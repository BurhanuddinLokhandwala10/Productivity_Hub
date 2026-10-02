const { pool } = require("../config/db");

const saveGithubSnapshot = async (stats, userId) => {
    const snapshot_date = new Date();
    const github_id = stats.id;
    const followers = stats.followers;
    const following = stats.following;
    const public_repos = stats.public_repos;
    const public_gists = stats.public_gists;
    const github_created_at = stats.created_at;
    const github_updated_at = stats.updated_at;

    const query = `
    INSERT INTO github_snapshot
    (
        snapshot_date,
        github_id,
        followers,
        following,
        public_repos,
        public_gists,
        github_created_at,
        github_updated_at,
        user_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
    `;

    const values = [
        snapshot_date,        // $1
        github_id,            // $2
        followers,            // $3
        following,            // $4
        public_repos,         // $5
        public_gists,         // $6
        github_created_at,    // $7
        github_updated_at,    // $8
        userId                // $9
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};


const saveGithubRepository = async (repo, userId) => {
    const query = `
        INSERT INTO github_repository
        (
            user_id,
            github_repo_id,
            name,
            full_name,
            url,
            private,
            language,
            stars,
            forks,
            open_issues,
            created_at,
            updated_at,
            pushed_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (user_id, github_repo_id)
        DO UPDATE SET
            name = EXCLUDED.name,
            language = EXCLUDED.language,
            stars = EXCLUDED.stars,
            forks = EXCLUDED.forks,
            open_issues = EXCLUDED.open_issues,
            updated_at = EXCLUDED.updated_at,
            pushed_at = EXCLUDED.pushed_at
        RETURNING *;
    `;

    const values = [
        userId,
        repo.id,
        repo.name,
        repo.full_name,
        repo.html_url,
        repo.private,
        repo.language,
        repo.stargazers_count,
        repo.forks_count,
        repo.open_issues_count,
        repo.created_at,
        repo.updated_at,
        repo.pushed_at
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

const saveGithubCommit = async (commit, repositoryId, userId) => {
    const query = `
        INSERT INTO github_commit
        (
            user_id,
            github_commit_sha,
            repository_id,
            message,
            author_name,
            author_email,
            committed_at,
            commit_url
        )       
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id, github_commit_sha)
        DO NOTHING
        RETURNING *;
    `;

    const values = [
        userId,
        commit.sha,
        repositoryId,
        commit.commit.message,
        commit.commit.author?.name,
        commit.commit.author?.email,
        commit.commit.author?.date,
        commit.html_url
    ];

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};

const getGithubCommitStats = async (userId) => {
    const query = `
        SELECT
            COUNT(*) FILTER (
                WHERE committed_at::date = CURRENT_DATE
            ) AS today_commits,

            COUNT(*) FILTER (
                WHERE committed_at >= date_trunc('week', CURRENT_DATE)
            ) AS weekly_commits,

            COUNT(*) FILTER (
                WHERE committed_at >= date_trunc('month', CURRENT_DATE)
            ) AS current_month_commits,

            COUNT(*) FILTER (
                WHERE committed_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                AND committed_at < date_trunc('month', CURRENT_DATE)
            ) AS last_month_commits,

            COUNT(*) FILTER (
                WHERE committed_at >= date_trunc('year', CURRENT_DATE)
            ) AS yearly_commits,

            COUNT(DISTINCT committed_at::date) FILTER (
                WHERE committed_at >= date_trunc('week', CURRENT_DATE)
            ) AS weekly_active_days,

            COUNT(DISTINCT committed_at::date) FILTER (
                WHERE committed_at >= date_trunc('month', CURRENT_DATE)
            ) AS monthly_active_days

        FROM github_commit
        WHERE user_id = $1;
    `;

    const result = await pool.query(query, [userId]);

    return {
        todayCommits: Number(result.rows[0].today_commits),
        weeklyCommits: Number(result.rows[0].weekly_commits),
        currentMonthCommits: Number(result.rows[0].current_month_commits),
        lastMonthCommits: Number(result.rows[0].last_month_commits),
        yearlyCommits: Number(result.rows[0].yearly_commits),
        weeklyActiveDays: Number(result.rows[0].weekly_active_days),
        monthlyActiveDays: Number(result.rows[0].monthly_active_days)
    };
};

const getGithubCommitTrend = async (userId) => {
    const query = `
        SELECT
            committed_at::date AS commit_date,
            COUNT(*) AS commits
        FROM github_commit
        WHERE user_id = $1
        AND committed_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY committed_at::date
        ORDER BY commit_date ASC;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows.map(row => ({
        date: row.commit_date,
        commits: Number(row.commits)
    }));
};

// Trend data for health score calculation (moved from controller)
const getGithubTrendData = async (userId) => {
    const trendQuery = `
        SELECT
            COUNT(*) FILTER (
                WHERE committed_at >= CURRENT_DATE - INTERVAL '30 days'
            ) AS current_commits,

            COUNT(*) FILTER (
                WHERE committed_at >= CURRENT_DATE - INTERVAL '60 days'
                AND committed_at < CURRENT_DATE - INTERVAL '30 days'
            ) AS previous_commits

        FROM github_commit
        WHERE user_id = $1;
    `;

    const result = await pool.query(trendQuery, [userId]);

    return {
        currentCommits: Number(result.rows[0].current_commits),
        previousCommits: Number(result.rows[0].previous_commits)
    };
};

// Repository count for health score calculation
const getGithubRepositoryCount = async (userId) => {
    const repoQuery = `
        SELECT COUNT(*) AS repositories
        FROM github_repository
        WHERE user_id = $1;
    `;

    const result = await pool.query(repoQuery, [userId]);

    return Number(result.rows[0].repositories);
};

module.exports = { saveGithubSnapshot, saveGithubRepository, saveGithubCommit, getGithubCommitStats, getGithubCommitTrend, getGithubTrendData, getGithubRepositoryCount }