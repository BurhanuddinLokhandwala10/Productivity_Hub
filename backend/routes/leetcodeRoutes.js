const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    getLeetcodeProgressController,
    getLeetcodeDailyActivityController
} = require('../controllers/leetcodeController');

router.get('/progress', authMiddleware, getLeetcodeProgressController);
router.get('/activity', authMiddleware, getLeetcodeDailyActivityController);

module.exports = router;
