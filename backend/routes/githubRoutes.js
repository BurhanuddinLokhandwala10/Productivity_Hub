const express = require('express');
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddlewares");
const { getGithubHealthScore, getGithubCommitStatsController, getGithubCommitTrendController } = require("../controllers/githubController");

router.get('/readiness', authMiddleware, getGithubHealthScore);
router.get('/stats', authMiddleware, getGithubCommitStatsController);
router.get('/commit-trend', authMiddleware, getGithubCommitTrendController);

module.exports = router;