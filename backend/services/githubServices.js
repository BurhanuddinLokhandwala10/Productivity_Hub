const axios = require('axios')

// To get the profile of the user
const githubApiCall = async (username) => {
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
};

// to get the commit of the repos
const githubCommitsAPICall = async (username, repo) => {
    try {
        const resp = await axios.get(`https://api.github.com/repos/${username}/${repo}/commits`)

        return resp.data;
    } catch (error) {
        console.error("Error fetching commmits from Github", error)
    }
}

// To get all the repos
const githubReposAPICall = async (username) => {
    try {
        const resp = await axios.get(
            `https://api.github.com/users/${username}/repos`
        );

        return resp.data;
    } catch (error) {
        console.error("Error fetching GitHub repositories:", error.message);
        throw error;
    }
};

module.exports = { githubApiCall, githubCommitsAPICall, githubReposAPICall }