const bcrypt = require('bcryptjs');
const User = require('../models/User')
const jwt = require('jsonwebtoken')

const SignUp = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please Enter All Details"
            });
        }

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({
                message: "User Already Exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            username,
            email,
            password: hashedPassword
        });
        await user.save();

        res.status(201).json({
            message: "User Created Successfully"
        });
    } catch (e) {
        console.error("SignUp error:", e.message);
        return res.status(500).json({ message: "Failed to sign up. Please try again later." });
    }
}

const Login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password"
            });
        }

        const userExist = await User.findOne({ email });

        if (!userExist) {
            return res.status(404).json({
                message: "User Not Found"
            });
        }

        const isMatch = await bcrypt.compare(password, userExist.password)

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Credentials"
            });
        }

        console.log("User Loggedin with username:", userExist.username);

        const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

        res.status(200).json({
            message: "User Logged in Successfully",
            Token: `${token}`
        });
    } catch (e) {
        console.error("Login error:", e.message);
        return res.status(500).json({ message: "Failed to log in. Please try again later." });
    }
}

module.exports = { Login, SignUp };