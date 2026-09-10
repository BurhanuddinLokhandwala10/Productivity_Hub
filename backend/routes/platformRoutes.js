const express = require('express');
const router = express.Router();
const { platformRegister, getPlatformStats, getLeetcodeProgress } = require('../controllers/platformController');
const Middleware = require('../middlewares/authMiddlewares');

router.post('/register', Middleware, platformRegister);
router.get('/stats', Middleware, getPlatformStats)
router.get('/leetcodeProgress', Middleware, getLeetcodeProgress)

module.exports = router;