const express = require('express');
const router = express.Router();
const { platformConnect, githubStats } = require('../controllers/platformController');
const Middleware = require('../middlewares/authMiddlewares');

router.post('/connect', Middleware, platformConnect);
router.get('/github-stats', Middleware, githubStats)

module.exports = router;