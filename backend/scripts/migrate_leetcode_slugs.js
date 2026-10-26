/**
 * One-time migration: Populate leetcode_slug for all 282 DSA Bible questions.
 *
 * - Uses explicit SLUG_OVERRIDES for questions whose titles don't map cleanly.
 * - Falls back to a deterministic slug generator for standard titles.
 * - ONLY fills slugs that are currently NULL or empty — never overwrites existing valid slugs.
 * - Safe to run multiple times (idempotent).
 *
 * Usage:
 *   cd backend && node scripts/migrate_leetcode_slugs.js
 */
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
const { pool } = require('../config/db');

const { SLUG_OVERRIDES, generateSlug } = require('../utils/slugUtils');


async function migrate() {
    const client = await pool.connect();
    try {
        console.log("── LeetCode Slug Migration ──────────────────────────");

        // Ensure column exists
        await client.query(`
            ALTER TABLE questions 
            ADD COLUMN IF NOT EXISTS leetcode_slug TEXT;
        `);
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_questions_leetcode_slug 
            ON questions(leetcode_slug);
        `);

        // Only fetch questions that are missing a slug
        const questionsRes = await client.query(
            `SELECT id, question, leetcode_slug FROM questions
             WHERE leetcode_slug IS NULL OR TRIM(leetcode_slug) = ''
             ORDER BY id`
        );
        console.log(`Found ${questionsRes.rows.length} questions missing leetcode_slug.`);

        if (questionsRes.rows.length === 0) {
            console.log("✅ All questions already have slugs. Nothing to do.");
            return;
        }

        let updated = 0;
        let overrideUsed = 0;
        let generated = 0;
        const unmapped = [];

        for (const row of questionsRes.rows) {
            const slug = generateSlug(row.question);

            if (!slug) {
                unmapped.push({ id: row.id, question: row.question });
                continue;
            }

            await client.query(
                `UPDATE questions SET leetcode_slug = $1
                 WHERE id = $2
                   AND (leetcode_slug IS NULL OR TRIM(leetcode_slug) = '')`,
                [slug, row.id]
            );
            updated++;

            if (SLUG_OVERRIDES[row.question.trim()]) {
                overrideUsed++;
            } else {
                generated++;
            }
        }

        console.log(`\n── Results ──────────────────────────────────────────`);
        console.log(`  Updated:       ${updated}`);
        console.log(`  Via override:  ${overrideUsed}`);
        console.log(`  Via generator: ${generated}`);
        if (unmapped.length > 0) {
            console.log(`  ⚠ Unmapped:    ${unmapped.length}`);
            unmapped.forEach(u => console.log(`    - [id=${u.id}] "${u.question}"`));
        }

        // Verification
        const verifyRes = await client.query(`
            SELECT
                COUNT(*) AS total,
                COUNT(CASE WHEN leetcode_slug IS NOT NULL AND TRIM(leetcode_slug) != '' THEN 1 END) AS with_slug,
                COUNT(CASE WHEN leetcode_slug IS NULL OR TRIM(leetcode_slug) = '' THEN 1 END) AS without_slug
            FROM questions
        `);
        const v = verifyRes.rows[0];
        console.log(`\n── Verification ─────────────────────────────────────`);
        console.log(`  Total questions:  ${v.total}`);
        console.log(`  With slug:        ${v.with_slug}`);
        console.log(`  Without slug:     ${v.without_slug}`);

        // Show sample
        const sampleRes = await client.query(
            `SELECT id, question, leetcode_slug FROM questions ORDER BY id LIMIT 10`
        );
        console.log(`\n── Sample ───────────────────────────────────────────`);
        sampleRes.rows.forEach(r =>
            console.log(`  [${r.id}] ${r.question} → ${r.leetcode_slug}`)
        );

        console.log("\n✅ Slug migration completed successfully.");
    } catch (err) {
        console.error("❌ Migration failed:", err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
