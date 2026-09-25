const { pool } = require("../config/db");
const { getGithubCommitStats, getGithubCommitTrend } = require("../repositories/githubRepository");

const getGithubHealthScore = async (req, res) => {
    try {
        const userId = req.userId;
        const stats = await getGithubCommitStats(userId);

        // Activity 40%
        const activityScore = Math.min(
            (stats.monthlyCommits / 100) * 100,
            100
        );

        // Consistency 30%
        const consistencyScore = Math.min(
            (stats.monthlyActiveDays / 20) * 100,
            100
        );

        // Trend 20%
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

        const trendResult = await pool.query(trendQuery, [userId]);

        const currentCommits =
            Number(trendResult.rows[0].current_commits);

        const previousCommits =
            Number(trendResult.rows[0].previous_commits);

        let trendScore = 50;
        let trend = "STABLE";

        if (previousCommits === 0 && currentCommits > 0) {
            trendScore = 100;
            trend = "IMPROVING";
        } else if (previousCommits > 0) {
            const change =
                ((currentCommits - previousCommits) /
                    previousCommits) * 100;

            if (change >= 10) {
                trendScore = Math.min(100, 50 + change);
                trend = "IMPROVING";
            } else if (change <= -10) {
                trendScore = Math.max(0, 50 + change);
                trend = "DECLINING";
            }
        }

        // Repository score 10%
        const repoQuery = `
            SELECT COUNT(*) AS repositories
            FROM github_repository;
        `;

        const repoResult = await pool.query(repoQuery);

        const repositories =
            Number(repoResult.rows[0].repositories);

        const repositoryScore = Math.min(
            (repositories / 5) * 100,
            100
        );

        // Final score
        const healthScore =
            (activityScore * 0.40) +
            (consistencyScore * 0.30) +
            (trendScore * 0.20) +
            (repositoryScore * 0.10);

        // THIS IS IMPORTANT
        res.status(200).json({
            score: Number(healthScore.toFixed(2)),
            trend,

            activity: {
                monthlyCommits: stats.monthlyCommits,
                score: Number(activityScore.toFixed(2))
            },

            consistency: {
                monthlyActiveDays: stats.monthlyActiveDays,
                score: Number(consistencyScore.toFixed(2))
            },

            trendAnalysis: {
                currentCommits,
                previousCommits,
                score: Number(trendScore.toFixed(2))
            },

            repositories: {
                total: repositories,
                score: Number(repositoryScore.toFixed(2))
            }
        });

    } catch (error) {
        console.error("GitHub Health Error:", error);

        res.status(500).json({
            message: "Failed to calculate GitHub health score",
            error: error.message
        });
    }
};

const getGithubCommitStatsController = async (req, res) => {
    try {
        const stats = await getGithubCommitStats(req.userId);

        res.status(200).json({
            message: "GitHub Commit Stats Fetched Successfully",
            stats
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch GitHub commit stats"
        });
    }
};

const getGithubCommitTrendController = async (req, res) => {
    try {
        const trend = await getGithubCommitTrend(req.userId);

        res.status(200).json({
            message: "GitHub Commit Trend Fetched Successfully",
            trend
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch GitHub commit trend"
        });
    }
};

module.exports = { getGithubHealthScore, getGithubCommitStatsController, getGithubCommitTrendController };