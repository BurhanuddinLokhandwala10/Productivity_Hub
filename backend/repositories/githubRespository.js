const { pool } = require("../config/db");

const saveGithubSnapshot = async (stats) => {
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
        (snapshot_date, github_id, followers, following, public_repos, public_gists, github_created_at, github_updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;

    const values = [
        snapshot_date,
        github_id,
        followers,
        following,
        public_repos,
        public_gists,
        github_created_at,
        github_updated_at
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};


const saveGithubRepository = async (repo) => {
    const query = `
        INSERT INTO github_repository
        (
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
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (github_repo_id)
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

const saveGithubCommit = async (commit, repositoryId) => {
    const query = `
        INSERT INTO github_commit
        (
            github_commit_sha,
            repository_id,
            message,
            author_name,
            author_email,
            committed_at,
            commit_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (github_commit_sha)
        DO UPDATE SET
            message = EXCLUDED.message,
            author_name = EXCLUDED.author_name,
            author_email = EXCLUDED.author_email,
            committed_at = EXCLUDED.committed_at,
            commit_url = EXCLUDED.commit_url
        RETURNING *;
    `;

    const values = [
        commit.sha,
        repositoryId,
        commit.commit.message,
        commit.commit.author?.name,
        commit.commit.author?.email,
        commit.commit.author?.date,
        commit.html_url
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
};

module.exports = { saveGithubSnapshot, saveGithubRepository, saveGithubCommit }