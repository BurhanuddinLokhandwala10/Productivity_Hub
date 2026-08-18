const axios = require('axios')

const githubApiCall = async (username) => {
    console.log("Github username recive in service", username)

    // return res.status(200).json({
    //     message: "Service Connected Sucessfully"
    // })

    try {
        const resp = await axios.get(`https://api.github.com/users/${username}`, {
            headers: {
                'Authorization': process.env.GITHUB_TOKEN,
                'content-type': "application/json"
            }
        })
        return resp.data;
    } catch (error) {
        console.error("Error fetching from github", error)
    }
}

module.exports = { githubApiCall }