const jwt = require('jsonwebtoken');
const Middleware = async (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        res.status(400).json({
            message: "Token Not Found"
        })
        return;
    }
    const token = authHeader.split(' ')[1]; // "Bearer xyz" se sirf "xyz" nikalna

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decodedToken.id;
        // res.status(200).json({
        //     message: "Token Verified Successfully",
        //     user: decodedToken
        // })
        next();
    } catch (e) {
        return res.status(401).json({ message: "Invalid Token" });
    }
}

module.exports = Middleware;