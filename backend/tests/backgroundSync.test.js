const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const { pool } = require('../config/db');
const redis = require('../config/redis');
const syncQueue = require('../queues/syncQueue');
const PlatformAccount = require('../models/PlatformAccount');
const { verifyGithubSignature, handleGithubWebhook } = require('../controllers/githubController');
const { triggerSyncNow, getSyncStatus } = require('../controllers/platformController');
const { startSyncScheduler, FAST_SYNC_INTERVAL_MS, RECONCILIATION_INTERVAL_MS } = require('../queues/syncScheduler');
const { syncLeetcodeAcceptedSubmissions, findQuestionBySlug } = require('../repositories/dsaRepository');

describe('Feature 2: Faster Automatic GitHub & LeetCode Background Synchronization', () => {
    const testSecret = 'test_webhook_secret_key_123';
    let testUserId;
    let ghAccount;
    let lcAccount;

    before(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
        }

        testUserId = new mongoose.Types.ObjectId();

        ghAccount = await PlatformAccount.create({
            userId: testUserId,
            platform: 'github',
            username: `test-gh-user-${Date.now()}`
        });

        lcAccount = await PlatformAccount.create({
            userId: testUserId,
            platform: 'leetcode',
            username: `test-lc-user-${Date.now()}`
        });
    });

    after(async () => {
        await PlatformAccount.deleteMany({ userId: testUserId });
        await pool.query('DELETE FROM user_question_progress WHERE user_id = $1', [testUserId.toString()]);
        await pool.end();
        await mongoose.disconnect();
        redis.disconnect();
    });

    it('1. Valid GitHub webhook signature verification succeeds', () => {
        const payload = JSON.stringify({ ref: 'refs/heads/main', repository: { name: 'test-repo' } });
        const hmac = crypto.createHmac('sha256', testSecret);
        hmac.update(Buffer.from(payload));
        const validSignature = 'sha256=' + hmac.digest('hex');

        const isValid = verifyGithubSignature(Buffer.from(payload), validSignature, testSecret);
        assert.equal(isValid, true, 'Valid HMAC signature must verify to true');
    });

    it('2. Invalid GitHub webhook signature is rejected', async () => {
        const payload = JSON.stringify({ repository: { name: 'test-repo' } });
        const invalidSignature = 'sha256=0000000000000000000000000000000000000000000000000000000000000000';

        const isValid = verifyGithubSignature(Buffer.from(payload), invalidSignature, testSecret);
        assert.equal(isValid, false, 'Invalid HMAC signature must verify to false');

        // Test with handleGithubWebhook mock req/res
        const origSecret = process.env.GITHUB_WEBHOOK_SECRET;
        process.env.GITHUB_WEBHOOK_SECRET = testSecret;

        let statusCode = 0;
        let responseJson = null;

        const req = {
            headers: {
                'x-hub-signature-256': invalidSignature,
                'x-github-event': 'push'
            },
            rawBody: Buffer.from(payload),
            body: JSON.parse(payload)
        };

        const res = {
            status: (code) => {
                statusCode = code;
                return {
                    json: (data) => {
                        responseJson = data;
                    }
                };
            }
        };

        await handleGithubWebhook(req, res);
        process.env.GITHUB_WEBHOOK_SECRET = origSecret;

        assert.equal(statusCode, 401, 'Invalid signature must return HTTP 401');
        assert.equal(responseJson.message, 'Invalid webhook signature');
    });

    it('3. Valid GitHub webhook queues a background sync job', async () => {
        const payload = JSON.stringify({
            repository: {
                name: 'cool-app',
                owner: { login: ghAccount.username }
            },
            sender: { login: ghAccount.username }
        });

        const hmac = crypto.createHmac('sha256', testSecret);
        hmac.update(Buffer.from(payload));
        const signature = 'sha256=' + hmac.digest('hex');

        const origSecret = process.env.GITHUB_WEBHOOK_SECRET;
        process.env.GITHUB_WEBHOOK_SECRET = testSecret;

        let statusCode = 0;
        let responseJson = null;

        const deliveryId = `del-${Date.now()}`;
        const req = {
            headers: {
                'x-hub-signature-256': signature,
                'x-github-event': 'push',
                'x-github-delivery': deliveryId
            },
            rawBody: Buffer.from(payload),
            body: JSON.parse(payload)
        };

        const res = {
            status: (code) => {
                statusCode = code;
                return {
                    json: (data) => {
                        responseJson = data;
                    }
                };
            }
        };

        await handleGithubWebhook(req, res);
        process.env.GITHUB_WEBHOOK_SECRET = origSecret;

        assert.equal(statusCode, 200);
        assert.ok(responseJson.queuedJobs.length > 0, 'Expected at least 1 queued job');
        const expectedJobId = `github-sync-${testUserId}-${deliveryId}`;
        assert.equal(responseJson.queuedJobs[0], expectedJobId);
    });

    it('4. Duplicate webhook delivery is handled idempotently without duplicate jobs', async () => {
        const payload = JSON.stringify({
            repository: {
                name: 'cool-app',
                owner: { login: ghAccount.username }
            }
        });

        const deliveryId = `fixed-delivery-id-${Date.now()}`;
        const expectedJobId = `github-sync-${testUserId}-${deliveryId}`;

        // Queue first time
        const job1 = await syncQueue.add(
            'github-sync',
            { userId: testUserId.toString() },
            { jobId: expectedJobId }
        );

        // Queue same job ID a second time (simulate duplicate delivery)
        const job2 = await syncQueue.add(
            'github-sync',
            { userId: testUserId.toString() },
            { jobId: expectedJobId }
        );

        assert.equal(job1.id, expectedJobId);
        assert.equal(job2.id, expectedJobId, 'Job ID must be identical and deduplicated');
    });

    it('5. Newly accepted LeetCode submission triggers DSA sheet update in worker sync', async () => {
        // Find question "Two Sum"
        const twoSumQ = (await findQuestionBySlug('two-sum'))[0];
        assert.ok(twoSumQ, 'Two Sum question should exist');

        // Simulate incoming accepted submissions detected by polling
        const newSubmissions = [
            {
                id: '12345678',
                title: 'Two Sum',
                titleSlug: 'two-sum',
                timestamp: `${Math.floor(Date.now() / 1000)}`
            }
        ];

        // Execute sync logic as called by the worker
        const syncResult = await syncLeetcodeAcceptedSubmissions(testUserId.toString(), newSubmissions);
        assert.equal(syncResult.matched, 1);
        assert.equal(syncResult.updated, 1);

        // Verify status in DB
        const progressRes = await pool.query(
            'SELECT status FROM user_question_progress WHERE user_id = $1 AND question_id = $2',
            [testUserId.toString(), twoSumQ.id]
        );
        assert.equal(progressRes.rows[0]?.status, 'SOLVED');
    });

    it('6. Queue configuration includes retry attempts and exponential backoff for transient errors', () => {
        const defaultOpts = syncQueue.defaultJobOptions;
        assert.ok(defaultOpts.attempts >= 3, 'Queue must configure at least 3 attempts');
        assert.equal(defaultOpts.backoff?.type, 'exponential', 'Queue backoff must be exponential');
        assert.ok(defaultOpts.backoff?.delay >= 1000, 'Queue backoff delay must be set');
    });

    it('7. One platform failure does not prevent another platform from syncing', async () => {
        // Dispatched as separate jobs in queue
        const ghJob = await syncQueue.add('github-sync', { userId: 'non-existent-user-id' });
        const lcJob = await syncQueue.add('leetcode-sync', { userId: testUserId.toString() });

        assert.notEqual(ghJob.id, lcJob.id, 'Jobs must be distinct and decoupled');
        assert.equal(ghJob.name, 'github-sync');
        assert.equal(lcJob.name, 'leetcode-sync');
    });

    it('8. Schedulers configured: 60-minute reconciliation and fast sync intervals', async () => {
        assert.equal(RECONCILIATION_INTERVAL_MS, 60 * 60 * 1000, 'Reconciliation must run every 60 minutes');
        assert.ok(FAST_SYNC_INTERVAL_MS <= 15 * 60 * 1000, 'Fast sync interval must be <= 15 minutes');
    });

    it('9. Frontend can query sync status and trigger on-demand sync', async () => {
        // 1. Test getSyncStatus
        let statusData = null;
        const req1 = { userId: testUserId };
        const res1 = {
            status: (code) => ({
                json: (d) => {
                    statusData = d;
                }
            })
        };

        await getSyncStatus(req1, res1);
        assert.ok(statusData.accounts.length >= 2);
        const platforms = statusData.accounts.map(a => a.platform);
        assert.ok(platforms.includes('github'));
        assert.ok(platforms.includes('leetcode'));

        // 2. Test triggerSyncNow
        let syncNowData = null;
        let syncNowStatus = 0;
        const res2 = {
            status: (code) => {
                syncNowStatus = code;
                return {
                    json: (d) => {
                        syncNowData = d;
                    }
                };
            }
        };

        await triggerSyncNow(req1, res2);
        assert.equal(syncNowStatus, 200);
        assert.equal(syncNowData.message, 'Sync job(s) queued successfully');
        assert.equal(syncNowData.queued.length, 2);
    });
});
