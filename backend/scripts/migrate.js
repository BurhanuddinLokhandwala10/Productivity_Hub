/**
 * PostgreSQL Schema Migration Script
 * 
 * Creates all required tables for the Developer Productivity Hub.
 * Safe to run multiple times (uses IF NOT EXISTS).
 * Does NOT drop or delete any existing data.
 * 
 * Usage:
 *   node scripts/migrate.js
 * 
 * Requires DATABASE_URL environment variable (or local PG config via .env).
 */
const dotenv = require("dotenv");
dotenv.config();

const { pool } = require("../config/db");

const migration = `
-- =============================================
-- 1. DSA Tables
-- =============================================

-- Topics table (DSA topic categories)
CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    topic TEXT NOT NULL UNIQUE
);

-- Questions table (DSA questions from the Bible sheet)
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL UNIQUE,
    difficulty TEXT,
    relevance TEXT,
    leetcode_slug TEXT
);

CREATE INDEX IF NOT EXISTS idx_questions_leetcode_slug ON questions(leetcode_slug);

-- Junction table linking questions to topics
CREATE TABLE IF NOT EXISTS question_topics (
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, topic_id)
);

-- User progress on individual questions
CREATE TABLE IF NOT EXISTS user_question_progress (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'NOT_SOLVED',
    UNIQUE (user_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_uqp_user_id ON user_question_progress(user_id);

-- DSA targets (product-based vs service-based goal per user)
CREATE TABLE IF NOT EXISTS dsa_targets (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    target_type TEXT NOT NULL DEFAULT 'PRODUCT_BASED'
);

-- =============================================
-- 2. GitHub Tables
-- =============================================

-- GitHub profile snapshots
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

-- GitHub repositories
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

-- GitHub commits
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

-- =============================================
-- 3. LeetCode Tables
-- =============================================

-- LeetCode progress snapshots
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

-- LeetCode daily submission activity
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

async function runMigration() {
    console.log("Starting PostgreSQL schema migration...");
    console.log("Database URL configured:", process.env.DATABASE_URL ? "Yes (using DATABASE_URL)" : "No (using local config)");

    try {
        await pool.query(migration);
        console.log("✅ All tables created successfully.");

        // Verify tables exist
        const verifyQuery = `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;
        const result = await pool.query(verifyQuery);
        console.log("\n📋 Tables in database:");
        result.rows.forEach(row => {
            console.log(`   - ${row.table_name}`);
        });

        // Verify key constraints
        const constraintQuery = `
            SELECT tc.table_name, tc.constraint_name, tc.constraint_type
            FROM information_schema.table_constraints tc
            WHERE tc.table_schema = 'public'
            AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY')
            ORDER BY tc.table_name, tc.constraint_type;
        `;
        const constraints = await pool.query(constraintQuery);
        console.log("\n🔑 Constraints:");
        constraints.rows.forEach(row => {
            console.log(`   ${row.table_name}: ${row.constraint_type} (${row.constraint_name})`);
        });

        console.log("\n✅ Migration completed successfully.");
    } catch (err) {
        console.error("❌ Migration failed:", err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
