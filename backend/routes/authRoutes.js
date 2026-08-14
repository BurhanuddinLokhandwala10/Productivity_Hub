const express = require('express');
const router = express.Router();
const { Login, SignUp } = require('../controllers/authController')
const Middleware = require('../middlewares/authMiddlewares');

router.get('/protected-test', Middleware, (req, res) => {
    res.status(200).json({ message: "You accessed a protected route!", user: req.user });
});
router.post('/signup', SignUp)
router.post('/login', Login)

module.exports = router;