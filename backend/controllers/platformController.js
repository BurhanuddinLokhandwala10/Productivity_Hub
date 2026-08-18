const PlatformAccount = require('../models/PlatformAccount');
const { githubApiCall } = require('../services/githubServices')


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


const githubStats = async (req, res) => {
    console.log("USER ID FROM MIDDLEWARE", req.userId)
    const account = await PlatformAccount.findOne({ userId: req.userId })
    if (!account) {
        res.status(404).json({
            message: "Platform Account Not Found"
        })
        return;
    }

    const username = account.username
    const platform = account.platform
    console.log("Username in Controller", username)

    if (platform === "github") {
        const stats = await githubApiCall(username)
        if (stats) {
            res.status(200).json({
                message: "Github Stats Fetched Successfully",
                stats
            })
        } else {
            res.status(500).json({
                message: "Failed to Fetch Github Stats"
            })
        }
    }
}

module.exports = { platformConnect, githubStats }