const express = require('express');
const router = express.Router();
const { platformRegister, getPlatformStats } = require('../controllers/platformController');
const Middleware = require('../middleware/authMiddleware');

router.post('/register', Middleware, platformRegister);
router.get('/stats', Middleware, getPlatformStats)

module.exports = router;                                