const { getDeveloperAnalytics } = require('../services/developerAnalyticsService');
const { analyzeDeveloper } = require('../services/aiAnalystService');

const getAiAnalysis = async (req, res) => {
    try {
        const analytics = await getDeveloperAnalytics(req.userId);
        const analysis = await analyzeDeveloper(analytics);

        res.status(200).json({
            data: {
                analysis
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Failed to generate AI analysis",
            error: error.message
        });
    }

}

module.exports = { getAiAnalysis };