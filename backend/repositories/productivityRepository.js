const { pool } = require("../config/db");

const getProductivitySummary = async (userId) => {
    // GitHub
    const githubQuery = `
        SELECT
            COUNT(*) FILTER (
                WHERE committed_at::date = CURRENT_DATE
            ) AS today_commits,

            COUNT(*) FILTER (
                WHERE committed_at >= date_trunc('week', CURRENT_DATE)
            ) AS weekly_commits,

            COUNT(*) FILTER (
                WHERE committed_at >= date_trunc('month', CURRENT_DATE)
            ) AS monthly_commits,

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
        WHERE user_id = $1
    `;

    // LeetCode
    const leetcodeQuery = `
        SELECT *
        FROM leetcode_snapshots
        WHERE user_id = $1
        ORDER BY snapshot_date DESC
        LIMIT 1;
    `;

    const githubResult = await pool.query(githubQuery, [userId]);
    const leetcodeResult = await pool.query(leetcodeQuery, [userId]);


    const github = githubResult.rows[0];
    const leetcode = leetcodeResult.rows[0];

    return {
        github: {
            todayCommits: Number(github.today_commits),
            weeklyCommits: Number(github.weekly_commits),
            monthlyCommits: Number(github.monthly_commits),
            yearlyCommits: Number(github.yearly_commits),
            weeklyActiveDays: Number(github.weekly_active_days),
            monthlyActiveDays: Number(github.monthly_active_days)
        },

        leetcode: {
            totalSolved: leetcode?.total_solved || 0,
            easySolved: leetcode?.easy_solved || 0,
            mediumSolved: leetcode?.medium_solved || 0,
            hardSolved: leetcode?.hard_solved || 0,
            rating: leetcode?.rating || 0,
            streak: leetcode?.streak || 0
        }
    };
};

module.exports = {
    getProductivitySummary
};