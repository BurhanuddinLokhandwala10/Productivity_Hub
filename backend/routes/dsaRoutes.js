const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { updateProgress, getProgress, getAnalytics, updateTarget, getTarget, getReadiness } = require('../controllers/dsaController')

// Apply middleware to all DSA routes
router.use(authMiddleware);

// 1 Route = 1 Function
router.post("/progress", updateProgress);
router.get("/progress", getProgress);
router.get("/analytics", getAnalytics);
router.post("/target", updateTarget);
router.get("/target", getTarget);
router.get("/readiness", getReadiness);

module.exports = router;