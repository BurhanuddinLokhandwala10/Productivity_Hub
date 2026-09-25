const { getGithubCommitStats, getGithubTrendData, getGithubRepositoryCount } = require("../repositories/githubRepository");
const { findDsaReadinessData } = require("../repositories/dsaRepository");
const { getProgress } = require("../repositories/leetcodeRepository");

// ==========================================
// GitHub Health Score
// ==========================================
const getGithubHealthScore = async (userId) => {
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
    const { currentCommits, previousCommits } = await getGithubTrendData(userId);

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
    const repositories = await getGithubRepositoryCount(userId);

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

    return {
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
    };
};

// ==========================================
// DSA Readiness
// ==========================================
const getDsaReadiness = async (userId) => {
    const { target, relevanceRows, difficultyRows, topicRows } = await findDsaReadinessData(userId);

    // 1. Relevance
    const relevance = {};
    relevanceRows.forEach(row => {
        relevance[row.relevance] = {
            total: row.total,
            solved: row.solved,
            percentage: row.total > 0 ? Number(((row.solved / row.total) * 100).toFixed(2)) : 0
        };
    });

    const mustTotal = relevance.MUST?.total || 0;
    const mustSolved = relevance.MUST?.solved || 0;
    const highTotal = relevance.HIGH?.total || 0;
    const highSolved = relevance.HIGH?.solved || 0;

    const mustPercentage = mustTotal > 0 ? (mustSolved / mustTotal) * 100 : 0;
    const highPercentage = highTotal > 0 ? (highSolved / highTotal) * 100 : 0;

    // 2. Difficulty
    const difficulty = difficultyRows.map(row => ({
        difficulty: row.difficulty,
        total: row.total,
        solved: row.solved,
        percentage: row.total > 0 ? Number(((row.solved / row.total) * 100).toFixed(2)) : 0
    }));

    const difficultyPercentage = difficulty.length > 0
        ? difficulty.reduce((sum, d) => sum + d.percentage, 0) / difficulty.length
        : 0;

    // 3. Topics
    const topics = topicRows.map(row => ({
        topic: row.topic,
        total: row.total,
        solved: row.solved,
        percentage: row.total > 0 ? Number(((row.solved / row.total) * 100).toFixed(2)) : 0
    }));

    const topicPercentage = topics.length > 0
        ? topics.reduce((sum, t) => sum + t.percentage, 0) / topics.length
        : 0;

    // 4. Weighted Score
    // Product-based: MUST=50%, HIGH=20%, TOPICS=20%, DIFFICULTY=10%
    // Service-based: MUST=40%, HIGH=20%, TOPICS=25%, DIFFICULTY=15%
    let readinessScore = target === "PRODUCT_BASED"
        ? (mustPercentage * 0.50) + (highPercentage * 0.20) + (topicPercentage * 0.20) + (difficultyPercentage * 0.10)
        : (mustPercentage * 0.40) + (highPercentage * 0.20) + (topicPercentage * 0.25) + (difficultyPercentage * 0.15);

    readinessScore = Number(readinessScore.toFixed(2));

    // 5. Label
    let label = "EARLY_STAGE";
    if (mustPercentage === 100 && readinessScore >= 90) label = "INTERVIEW_READY";
    else if (readinessScore >= 75) label = "STRONG_PREPARATION";
    else if (readinessScore >= 60) label = "NEARLY_READY";
    else if (readinessScore >= 40) label = "NEEDS_IMPROVEMENT";

    const weakTopics = [...topics].filter(t => t.percentage < 50).sort((a, b) => a.percentage - b.percentage).slice(0, 5);
    const strengths = [...topics].filter(t => t.percentage >= 70).sort((a, b) => b.percentage - a.percentage).slice(0, 5);

    return {
        target,
        readinessScore,
        label,
        must: { total: mustTotal, solved: mustSolved, percentage: Number(mustPercentage.toFixed(2)) },
        high: { total: highTotal, solved: highSolved, percentage: Number(highPercentage.toFixed(2)) },
        difficulty,
        topics,
        weakTopics,
        strengths
    };
};

// ==========================================
// Developer Analytics Aggregator
// ==========================================
/**
 * Aggregates all developer analytics for a given user.
 * Designed to be called by the AI Analyst (or any service) without going through controllers.
 *
 * @param {string} userId - The user's ID
 * @returns {Object} Combined analytics object containing GitHub health, LeetCode progress, and DSA readiness
 */
const getDeveloperAnalytics = async (userId) => {
    const [githubHealth, leetcodeProgress, dsaReadiness] = await Promise.all([
        getGithubHealthScore(userId),
        getProgress(userId),
        getDsaReadiness(userId)
    ]);

    return {
        github: githubHealth,
        leetcode: leetcodeProgress,
        dsa: dsaReadiness
    };
};

module.exports = { getGithubHealthScore, getDsaReadiness, getDeveloperAnalytics };
