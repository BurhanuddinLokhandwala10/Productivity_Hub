const PlatformAccount = require('../models/PlatformAccount');
const { getProgress, getLeetcodeDailyActivity, saveLeetcodeDailyActivity } = require('../repositories/leetcodeRepository');
const { leetcodeAPICall } = require('../services/leetcodeService');

const getLeetcodeProgressController = async (req, res) => {
    try {
        const progress = await getProgress(req.userId);
        return res.status(200).json({ message: "Leetcode Progress Fetched Successfully", progress });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch Leetcode progress", error: `${error}` });
    }
};

const getLeetcodeDailyActivityController = async (req, res) => {
    try {
        let activity = await getLeetcodeDailyActivity(req.userId);

        // If activity table is empty, attempt auto-sync from LeetCode GraphQL if account is registered
        if (!activity || activity.length === 0) {
            try {
                const account = await PlatformAccount.findOne({ userId: req.userId, platform: 'leetcode' });
                if (account && account.username) {
                    const stats = await leetcodeAPICall(account.username);
                    if (stats && stats.submissionCalendar) {
                        await saveLeetcodeDailyActivity(req.userId, stats.submissionCalendar);
                        activity = await getLeetcodeDailyActivity(req.userId);
                    }
                }
            } catch (autoErr) {
                console.warn("Auto-sync LeetCode daily activity warning:", autoErr.message);
            }
        }

        return res.status(200).json({
            message: "LeetCode Daily Activity Fetched Successfully",
            activity: activity || []
        });
    } catch (error) {
        console.error("getLeetcodeDailyActivityController error:", error);
        return res.status(500).json({
            message: "Failed to fetch LeetCode daily activity",
            error: error.message
        });
    }
};

module.exports = { getLeetcodeProgressController, getLeetcodeDailyActivityController };
