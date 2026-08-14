const bcrypt = require('bcryptjs');
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const SignUp = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        res.status(400).json({
            message: "Please Enter All Details"
        })
        return;
    }

    const userExist = await User.findOne({ email });

    if (userExist) {
        res.status(400).json({
            message: "User Already Exists"
        })
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({
            username,
            email,
            password: hashedPassword
        })
        await user.save();
    } catch (e) {
        return res.status(500).json({ Message: `Failed To SignUp due to : ${e}` })
    }


    res.status(200).json({
        message: "User Created Successfully"
    })
    console.log("User Created with username : ", username, "and email : ", email)
}

const Login = async (req, res) => {
    const { email, password } = req.body;

    const userExist = await User.findOne({ email });

    if (!userExist) {
        res.status(404).json({
            message: "User Not Found"
        })
        return;
    }

    const isMatch = await bcrypt.compare(password, userExist.password)

    if (!isMatch) {
        res.status(400).json({
            message: "Invalid Credentials"
        })
        return;
    }



    console.log("User Loggedin with username : ", userExist.username, "and email : ", userExist.email)

    const token = jwt.sign({ id: userExist._id }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(200).json({
        message: "User Logged in Successfully",
        Token: `${token}`
    })
}

module.exports = { Login, SignUp };