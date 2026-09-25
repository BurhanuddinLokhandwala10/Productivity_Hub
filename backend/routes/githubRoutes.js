const express = require('express');
const router = express.Router();

const Middleware = require("../middleware/authMiddleware");
const { getGithubHealthScore, getGithubCommitStatsController, getGithubCommitTrendController } = require("../controllers/githubController");

router.get('/progress', Middleware, getGithubHealthScore);
router.get('/stats', Middleware, getGithubCommitStatsController);
router.get('/commit-trend', Middleware, getGithubCommitTrendController);

module.exports = router;