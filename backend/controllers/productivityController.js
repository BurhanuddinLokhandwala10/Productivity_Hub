const { getProductivitySummary } = require("../repositories/productivityRepository");

const getProductivitySummaryController = async (req, res) => {
    try {
        const summary = await getProductivitySummary(req.userId);

        res.status(200).json({
            message: "Productivity Summary Fetched Successfully",
            summary
        });
    } catch (error) {
        console.error("Error fetching productivity summary:", error);

        res.status(500).json({
            message: "Failed to fetch productivity summary"
        });
    }
};

module.exports = { getProductivitySummaryController };