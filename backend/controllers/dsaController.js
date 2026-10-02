const {
    findQuestionById,
    upsertUserProgress,
    findUserProgress,
    getDsaFilterOptions,
    findDsaAnalyticsData,
    upsertUserTarget,
    findUserTarget
} = require("../repositories/dsaRepository");

const { getDsaReadiness } = require("../services/developerAnalyticsService");

// Mark/update question progress
const updateProgress = async (req, res) => {
    try {
        const { questionId, status } = req.body;

        if (!questionId || !status) {
            return res.status(400).json({ message: "questionId and status are required" });
        }

        const allowedStatuses = ["NOT_SOLVED", "ATTEMPTED", "SOLVED"];
        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const question = await findQuestionById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        await upsertUserProgress(req.userId, questionId, status);
        res.json({ message: "Progress updated successfully", questionId, status });
    } catch (error) {
        console.error("updateProgress error:", error);
        res.status(500).json({ message: "Failed to update progress" });
    }
};

// Get user's progress
const getProgress = async (req, res) => {
    try {
        const filters = {
            topic: req.query.topic,
            difficulty: req.query.difficulty,
            relevance: req.query.relevance,
            status: req.query.status,
            limit: req.query.limit,
            offset: req.query.offset
        };
        const progress = await findUserProgress(req.userId, filters);
        const filterOptions = await getDsaFilterOptions();
        res.json({
            count: progress.length,
            progress,
            filterOptions
        });
    } catch (error) {
        console.error("getProgress error:", error);
        res.status(500).json({ message: "Failed to fetch progress" });
    }
};

// DSA Analytics
const getAnalytics = async (req, res) => {
    try {
        const data = await findDsaAnalyticsData(req.userId);
        const { total, solved, attempted, notSolved, difficultyRows, topicRows } = data;

        const preparationPercentage = total > 0 ? Number(((solved / total) * 100).toFixed(2)) : 0;

        res.json({
            totalQuestions: total,
            solved,
            attempted,
            notSolved,
            preparationPercentage,
            difficulty: difficultyRows.map(row => ({
                difficulty: row.difficulty,
                total: Number(row.total),
                solved: Number(row.solved),
                percentage: Number(row.total) > 0 ? Number(((Number(row.solved) / Number(row.total)) * 100).toFixed(2)) : 0
            })),
            topics: topicRows.map(row => ({
                topic: row.topic,
                total: Number(row.total),
                solved: Number(row.solved),
                percentage: Number(row.total) > 0 ? Number(((Number(row.solved) / Number(row.total)) * 100).toFixed(2)) : 0
            }))
        });
    } catch (error) {
        console.error("getAnalytics error:", error);
        res.status(500).json({ message: "Failed to fetch DSA analytics" });
    }
};

// Update target
const updateTarget = async (req, res) => {
    try {
        const { targetType } = req.body;
        if (!["PRODUCT_BASED", "SERVICE_BASED"].includes(targetType)) {
            return res.status(400).json({ message: "Invalid targetType" });
        }

        const target = await upsertUserTarget(req.userId, targetType);
        res.json({ message: "DSA target updated successfully", target });
    } catch (error) {
        console.error("updateTarget error:", error);
        res.status(500).json({ message: "Failed to update DSA target" });
    }
};

// Get target
const getTarget = async (req, res) => {
    try {
        const target = await findUserTarget(req.userId);
        res.json({ target });
    } catch (error) {
        console.error("getTarget error:", error);
        res.status(500).json({ message: "Failed to fetch DSA target" });
    }
};

// DSA Readiness Score
const getReadiness = async (req, res) => {
    try {
        const readiness = await getDsaReadiness(req.userId);

        res.json(readiness);
    } catch (error) {
        console.error("Readiness Error:", error);

        res.status(500).json({
            message: "Failed to calculate DSA readiness",
            error: error.message
        });
    }
};

module.exports = {
    updateProgress,
    getProgress,
    getAnalytics,
    updateTarget,
    getTarget,
    getReadiness
};
