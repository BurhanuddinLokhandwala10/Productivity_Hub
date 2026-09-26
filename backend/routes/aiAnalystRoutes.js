const express = require("express");
const router = express.Router();

const Middleware = require('../middleware/authMiddleware');
const { getAiAnalysis } = require('../controllers/aiAnalystController');

router.get("/analyze", Middleware, getAiAnalysis);

module.exports = router;    