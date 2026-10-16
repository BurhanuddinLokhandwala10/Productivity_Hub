const express = require('express');
const router = express.Router();
const { platformRegister, getPlatformStats, triggerSyncNow, getSyncStatus } = require('../controllers/platformController');
const Middleware = require('../middleware/authMiddleware');

router.post('/register', Middleware, platformRegister);
router.get('/stats', Middleware, getPlatformStats);
router.post('/sync-now', Middleware, triggerSyncNow);
router.get('/sync-status', Middleware, getSyncStatus);

module.exports = router;                                