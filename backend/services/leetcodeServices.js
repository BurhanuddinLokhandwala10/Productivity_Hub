const axios = require('axios')

const leetcodeAPICall = async (username) => {
    try {
        const resp = await axios.post("https://leetcode.com/graphql", {
            "query": "query getUserProfile($username: String!) { matchedUser(username: $username) { username submitStats { acSubmissionNum { difficulty count } } } userContestRanking(username: $username) { rating } }",
            "variables": { "username": username }
        })
        return {
            submitStats: resp.data.data.matchedUser.submitStats.acSubmissionNum,
            rating: resp.data.data.userContestRanking?.rating || null
        };
    } catch (error) {
        console.error("Error fetching from LeetCode", error)
    }
}

module.exports = { leetcodeAPICall }