const express = require('express');
const router = express.Router();

const Middleware = require("../middleware/authMiddleware");
const {
    getGithubHealthScore,
    getGithubCommitStatsController,
    getGithubCommitTrendController,
    getGithubDailyActivityController,
    handleGithubWebhook
} = require("../controllers/githubController");

router.post('/webhook', handleGithubWebhook);
router.get('/progress', Middleware, getGithubHealthScore);
router.get('/stats', Middleware, getGithubCommitStatsController);
router.get('/commit-trend', Middleware, getGithubCommitTrendController);
router.get('/activity', Middleware, getGithubDailyActivityController);

module.exports = router;