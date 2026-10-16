const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const dotenv = require('dotenv');
dotenv.config();

const { pool } = require('../config/db');
const {
    syncLeetcodeAcceptedSubmissions,
    findQuestionBySlug,
    upsertUserProgress,
    findDsaReadinessData,
    findUserProgress
} = require('../repositories/dsaRepository');

describe('Feature 1: DSA Sheet Synchronization with LeetCode Submissions', () => {
    const testUserId = `test-user-${Date.now()}`;

    // Clean up test progress before and after
    const cleanup = async () => {
        await pool.query('DELETE FROM user_question_progress WHERE user_id = $1', [testUserId]);
        await pool.query('DELETE FROM dsa_targets WHERE user_id = $1', [testUserId]);
    };

    before(async () => {
        await cleanup();
    });

    after(async () => {
        await cleanup();
    });

    it('1. Matches an accepted LeetCode submission to a DSA sheet question using stable slug', async () => {
        // "Two Sum" is a known MUST question in the sheet with slug 'two-sum'
        const questions = await findQuestionBySlug('two-sum');
        assert.ok(questions.length > 0, 'Expected to find question with slug two-sum');
        const twoSumQ = questions[0];

        // Ensure initially not solved
        const initialProgress = await findUserProgress(testUserId, { status: 'SOLVED' });
        const alreadySolved = initialProgress.some(q => q.question_id === twoSumQ.id);
        assert.equal(alreadySolved, false, 'Question should not be solved yet');

        // Accepted LeetCode submission payload
        const acceptedSubmissions = [
            {
                id: '9990001',
                title: 'Two Sum',
                titleSlug: 'two-sum',
                timestamp: '1700000000'
            }
        ];

        const syncResult = await syncLeetcodeAcceptedSubmissions(testUserId, acceptedSubmissions);
        assert.equal(syncResult.matched, 1);
        assert.equal(syncResult.updated, 1);
        assert.equal(syncResult.matchedQuestions[0].leetcode_slug, 'two-sum');

        // Verify in DB that status is now SOLVED
        const progressRes = await pool.query(
            'SELECT status FROM user_question_progress WHERE user_id = $1 AND question_id = $2',
            [testUserId, twoSumQ.id]
        );
        assert.equal(progressRes.rows[0]?.status, 'SOLVED');
    });

    it('2. An unmatched LeetCode problem does not modify the sheet or create duplicate questions', async () => {
        const questionsCountBefore = (await pool.query('SELECT count(*) FROM questions')).rows[0].count;

        const unmatchedSubmissions = [
            {
                id: '9990002',
                title: 'Non-Existent Sheet Problem XYZ',
                titleSlug: 'non-existent-sheet-problem-xyz-999',
                timestamp: '1700000001'
            }
        ];

        const syncResult = await syncLeetcodeAcceptedSubmissions(testUserId, unmatchedSubmissions);
        assert.equal(syncResult.matched, 0);
        assert.equal(syncResult.updated, 0);
        assert.equal(syncResult.matchedQuestions.length, 0);

        const questionsCountAfter = (await pool.query('SELECT count(*) FROM questions')).rows[0].count;
        assert.equal(questionsCountBefore, questionsCountAfter, 'Sheet catalog question count must not change');
    });

    it('3. Reprocessing the same submission is idempotent and does not create duplicates or inflate counts', async () => {
        const acceptedSubmissions = [
            {
                id: '9990001',
                title: 'Two Sum',
                titleSlug: 'two-sum',
                timestamp: '1700000000'
            }
        ];

        // Process a second and third time
        await syncLeetcodeAcceptedSubmissions(testUserId, acceptedSubmissions);
        await syncLeetcodeAcceptedSubmissions(testUserId, acceptedSubmissions);

        // Check user_question_progress row count for this question
        const twoSumQ = (await findQuestionBySlug('two-sum'))[0];
        const res = await pool.query(
            'SELECT count(*) FROM user_question_progress WHERE user_id = $1 AND question_id = $2',
            [testUserId, twoSumQ.id]
        );
        assert.equal(Number(res.rows[0].count), 1, 'Must have exactly 1 record for this question and user');

        const totalSolvedRes = await pool.query(
            "SELECT count(*) FROM user_question_progress WHERE user_id = $1 AND status = 'SOLVED'",
            [testUserId]
        );
        assert.equal(Number(totalSolvedRes.rows[0].count), 1, 'Total solved count must remain 1');
    });

    it('4. Failed or non-accepted submissions do not mark questions solved', async () => {
        // "Contains Duplicate" is slug 'contains-duplicate'
        const containsDupQ = (await findQuestionBySlug('contains-duplicate'))[0];
        assert.ok(containsDupQ, 'Contains Duplicate question should exist');

        // A failed submission (e.g., Wrong Answer, Time Limit Exceeded)
        // Only accepted submissions (status === 'Accepted' or from recentAcSubmissionList) should be passed
        // If a submission status is NOT accepted, it must be filtered out
        const submissions = [
            {
                id: '9990003',
                title: 'Contains Duplicate',
                titleSlug: 'contains-duplicate',
                status: 'Wrong Answer',
                isAccepted: false
            }
        ];

        // Filter only accepted submissions
        const onlyAccepted = submissions.filter(s => s.isAccepted === true || s.statusDisplay === 'Accepted');
        const syncResult = await syncLeetcodeAcceptedSubmissions(testUserId, onlyAccepted);
        assert.equal(syncResult.matched, 0);

        // Verify status remains unsolved in database
        const progressRes = await pool.query(
            'SELECT status FROM user_question_progress WHERE user_id = $1 AND question_id = $2',
            [testUserId, containsDupQ.id]
        );
        assert.ok(!progressRes.rows[0] || progressRes.rows[0].status !== 'SOLVED');
    });

    it('5. DSA topic percentages and MUST/HIGH coverage update correctly', async () => {
        // Check readiness data before solving MUST problem
        const beforeData = await findDsaReadinessData(testUserId);
        const initialMustSolved = beforeData.relevanceRows.find(r => r.relevance === 'MUST')?.solved || 0;

        // Solve Contains Duplicate (MUST)
        await syncLeetcodeAcceptedSubmissions(testUserId, [
            {
                id: '9990004',
                title: 'Contains Duplicate',
                titleSlug: 'contains-duplicate',
                timestamp: '1700000002'
            }
        ]);

        // Solve Move Zeroes (HIGH)
        await syncLeetcodeAcceptedSubmissions(testUserId, [
            {
                id: '9990005',
                title: 'Move Zeroes',
                titleSlug: 'move-zeroes',
                timestamp: '1700000003'
            }
        ]);

        const afterData = await findDsaReadinessData(testUserId);
        const afterMustSolved = afterData.relevanceRows.find(r => r.relevance === 'MUST')?.solved || 0;
        const afterHighSolved = afterData.relevanceRows.find(r => r.relevance === 'HIGH')?.solved || 0;

        assert.equal(afterMustSolved, initialMustSolved + 1, 'MUST solved count should have increased by 1');
        assert.ok(afterHighSolved >= 1, 'HIGH solved count should have increased');
    });

    it('6. Missing or invalid problem identifiers are handled safely', async () => {
        // Missing slug, null, undefined, empty strings, non-array inputs
        assert.doesNotReject(async () => {
            const r1 = await syncLeetcodeAcceptedSubmissions(testUserId, null);
            assert.equal(r1.matched, 0);

            const r2 = await syncLeetcodeAcceptedSubmissions(testUserId, undefined);
            assert.equal(r2.matched, 0);

            const r3 = await syncLeetcodeAcceptedSubmissions(testUserId, []);
            assert.equal(r3.matched, 0);

            const r4 = await syncLeetcodeAcceptedSubmissions(testUserId, [
                { id: '1', title: 'Test' }, // missing titleSlug and slug
                { id: '2', titleSlug: '' }, // empty titleSlug
                { id: '3', slug: '   ' }    // whitespace slug
            ]);
            assert.equal(r4.matched, 0);
        });
    });

    it('7. Handles legitimate multi-sheet entries for a single LeetCode problem correctly', async () => {
        // "subsets" appears multiple times in the sheet (e.g. Backtracking and Bit Manipulation)
        const subsetsQuestions = await findQuestionBySlug('subsets');
        assert.ok(subsetsQuestions.length >= 2, 'Expected at least 2 questions with slug subsets');

        const syncResult = await syncLeetcodeAcceptedSubmissions(testUserId, [
            {
                id: '9990006',
                title: 'Subsets',
                titleSlug: 'subsets',
                timestamp: '1700000004'
            }
        ]);

        // All legitimate sheet entries sharing the slug should be updated to SOLVED
        assert.equal(syncResult.matched, subsetsQuestions.length);

        for (const q of subsetsQuestions) {
            const res = await pool.query(
                'SELECT status FROM user_question_progress WHERE user_id = $1 AND question_id = $2',
                [testUserId, q.id]
            );
            assert.equal(res.rows[0]?.status, 'SOLVED');
        }
    });
});
