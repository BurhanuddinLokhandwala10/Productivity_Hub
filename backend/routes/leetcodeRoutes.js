const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { getLeetcodeProgressController } = require('../controllers/leetcodeController');

router.get('/progress', authMiddleware, getLeetcodeProgressController);

module.exports = router;
