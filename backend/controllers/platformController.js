const PlatformAccount = require('../models/PlatformAccount');
const platformConnect = async (req, res) => {
    const { platform, username } = req.body;

    if (!platform || !username) {
        res.status(400).json({
            message: "Please Enter all The Credentials"
        })
        return;
    }
    try {
        const platformAccount = new PlatformAccount({
            userId: req.userId,
            platform,
            username
        })
        await platformAccount.save();
        console.log("Platform Account Created with username : ", username, "and platform : ", platform);
        res.status(200).json({
            message: "Platform Account Created Successfully",
            platformAccount
        })
    } catch (e) {
        res.status(500).json({
            message: `Failed to Create Platform Account due to : ${e}`
        })
    }
}

module.exports = { platformConnect }