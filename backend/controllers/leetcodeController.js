const { getProgress } = require('../repositories/leetcodeRepository');

const getLeetcodeProgressController = async (req, res) => {
    try {
        const progress = await getProgress(req.userId);
        return res.status(200).json({ message: "Leetcode Progress Fetched Successfully", progress });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch Leetcode progress", error: `${error}` });
    }
};

module.exports = { getLeetcodeProgressController };
