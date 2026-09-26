const express = require('express');
const router = express.Router();
const { Login, SignUp } = require('../controllers/authController')
const Middleware = require('../middleware/authMiddleware');
const User = require('../models/User.js')



router.get('/protected-test', Middleware, async (req, res) => {
    const user = await User.findById(req.userId)
    console.log(user) //null
    res.status(200).json({ message: "You accessed a protected route!", user: user });
});
router.post('/signup', SignUp)
router.post('/login', Login)

module.exports = router;