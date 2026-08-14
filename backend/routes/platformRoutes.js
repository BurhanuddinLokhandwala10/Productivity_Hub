const express = require('express');
const router = express.Router();
const { platformConnect } = require('../controllers/platformController');
const Middleware = require('../middlewares/authMiddlewares')

router.post('/connect', Middleware, platformConnect);


module.exports = router;