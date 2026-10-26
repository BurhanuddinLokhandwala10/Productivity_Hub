/**
 * PostgreSQL schema initialization module.
 * Exports a function that creates all required tables.
 * Safe to call multiple times (uses IF NOT EXISTS).
 */
const migrationSQL = `
-- DSA Tables
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    topic TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL UNIQUE,
    difficulty TEXT,
    relevance TEXT,
    leetcode_slug TEXT
);

CREATE INDEX IF NOT EXISTS idx_questions_leetcode_slug ON questions(leetcode_slug);

CREATE TABLE IF NOT EXISTS question_topics (
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, topic_id)
);

CREATE TABLE IF NOT EXISTS user_question_progress (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'NOT_SOLVED',
    UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_uqp_user_id ON user_question_progress(user_id);

CREATE TABLE IF NOT EXISTS dsa_targets (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    target_type TEXT NOT NULL DEFAULT 'PRODUCT_BASED'
);

-- GitHub Tables
CREATE TABLE IF NOT EXISTS github_snapshot (
    id SERIAL PRIMARY KEY,
    snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    github_id BIGINT,
    followers INTEGER DEFAULT 0,
    following INTEGER DEFAULT 0,
    public_repos INTEGER DEFAULT 0,
    public_gists INTEGER DEFAULT 0,
    github_created_at TIMESTAMPTZ,
    github_updated_at TIMESTAMPTZ,
    user_id TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_github_snapshot_user_id ON github_snapshot(user_id);

CREATE TABLE IF NOT EXISTS github_repository (
    repository_id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    github_repo_id BIGINT NOT NULL,
    name TEXT,
    full_name TEXT,
    url TEXT,
    private BOOLEAN DEFAULT false,
    language TEXT,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    open_issues INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    pushed_at TIMESTAMPTZ,
    UNIQUE (user_id, github_repo_id)
);

CREATE INDEX IF NOT EXISTS idx_github_repository_user_id ON github_repository(user_id);

CREATE TABLE IF NOT EXISTS github_commit (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    github_commit_sha TEXT NOT NULL,
    repository_id INTEGER REFERENCES github_repository(repository_id) ON DELETE CASCADE,
    message TEXT,
    author_name TEXT,
    author_email TEXT,
    committed_at TIMESTAMPTZ,
    commit_url TEXT,
    UNIQUE (user_id, github_commit_sha)
);

CREATE INDEX IF NOT EXISTS idx_github_commit_user_id ON github_commit(user_id);
CREATE INDEX IF NOT EXISTS idx_github_commit_committed_at ON github_commit(committed_at);

-- LeetCode Tables
CREATE TABLE IF NOT EXISTS leetcode_snapshots (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_solved INTEGER DEFAULT 0,
    easy_solved INTEGER DEFAULT 0,
    medium_solved INTEGER DEFAULT 0,
    hard_solved INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    streak INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leetcode_snapshots_user_id ON leetcode_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_leetcode_snapshots_created_at ON leetcode_snapshots(created_at);

CREATE TABLE IF NOT EXISTS leetcode_daily_activity (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    activity_date DATE NOT NULL,
    submission_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, activity_date)
);

CREATE INDEX IF NOT EXISTS idx_leetcode_daily_activity_user_id ON leetcode_daily_activity(user_id);
`;

const { generateSlug, SLUG_OVERRIDES } = require('../utils/slugUtils');

/**
 * Runs the schema migration against the provided pool.
 * Also automatically ensures questions have canonical leetcode_slug populated.
 * @param {import('pg').Pool} pool - PostgreSQL connection pool
 * @returns {Promise<void>}
 */
async function initializeSchema(pool) {
    await pool.query(migrationSQL);

    try {
        // Ensure all questions have leetcode_slug populated
        const missingRes = await pool.query(
            `SELECT id, question FROM questions WHERE leetcode_slug IS NULL OR TRIM(leetcode_slug) = ''`
        );

        if (missingRes.rows.length > 0) {
            console.log(`[schema] Backfilling leetcode_slug for ${missingRes.rows.length} questions...`);
            for (const row of missingRes.rows) {
                const slug = generateSlug(row.question);
                if (slug) {
                    await pool.query(
                        `UPDATE questions SET leetcode_slug = $1 WHERE id = $2`,
                        [slug, row.id]
                    );
                }
            }
            console.log(`[schema] Backfilled leetcode_slug for ${missingRes.rows.length} questions.`);
        }

        // Apply any specific overrides where question titles are ambiguous
        for (const [questionTitle, canonicalSlug] of Object.entries(SLUG_OVERRIDES)) {
            await pool.query(
                `UPDATE questions SET leetcode_slug = $1 WHERE question = $2 AND (leetcode_slug IS NULL OR leetcode_slug != $1)`,
                [canonicalSlug, questionTitle]
            );
        }
    } catch (err) {
        console.error("[schema] Warning: Failed to backfill question slugs:", err.message);
    }
}

module.exports = { initializeSchema };
