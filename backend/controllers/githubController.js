const { getGithubCommitStats, getGithubCommitTrend, getGithubDailyActivity } = require("../repositories/githubRepository");
const {
    getGithubHealthScore: getGithubHealthScoreService
} = require("../services/developerAnalyticsService");
const getGithubHealthScore = async (req, res) => {
    try {
        const healthScore = await getGithubHealthScoreService(req.userId);

        res.status(200).json(healthScore);
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

const getGithubDailyActivityController = async (req, res) => {
    try {
        const activity = await getGithubDailyActivity(req.userId);

        res.status(200).json({
            message: "GitHub Daily Activity Fetched Successfully",
            activity
        });
    } catch (error) {
        console.error("GitHub Daily Activity Error:", error);
        res.status(500).json({
            message: "Failed to fetch GitHub daily activity",
            error: error.message
        });
    }
};

module.exports = {
    getGithubHealthScore,
    getGithubCommitStatsController,
    getGithubCommitTrendController,
    getGithubDailyActivityController
};