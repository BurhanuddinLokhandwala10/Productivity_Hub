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

module.exports = { saveGithubSnapshot }