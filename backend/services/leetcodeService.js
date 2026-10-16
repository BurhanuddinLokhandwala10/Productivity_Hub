const axios = require('axios');

const leetcodeAPICall = async (username) => {
    try {
        const query = `
            query getUserProfile($username: String!) {
                matchedUser(username: $username) {
                    username
                    submitStats {
                        acSubmissionNum { difficulty count }
                    }
                    submissionCalendar
                }
                userContestRanking(username: $username) {
                    rating
                }
                recentAcSubmissionList(username: $username, limit: 50) {
                    id
                    title
                    titleSlug
                    timestamp
                }
            }
        `;
        const resp = await axios.post("https://leetcode.com/graphql", {
            query,
            variables: { username }
        }, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            timeout: 10000
        });

        if (!resp.data || !resp.data.data) {
            throw new Error(`LeetCode GraphQL error: ${JSON.stringify(resp.data?.errors || 'No data')}`);
        }

        const data = resp.data.data;
        return {
            submitStats: data.matchedUser?.submitStats?.acSubmissionNum || [],
            rating: data.userContestRanking?.rating || null,
            submissionCalendar: data.matchedUser?.submissionCalendar || "{}",
            recentAcSubmissions: data.recentAcSubmissionList || []
        };
    } catch (error) {
        console.error("Error fetching from LeetCode:", error.message || error);
        throw error;
    }
};

const fetchRecentAcSubmissions = async (username, limit = 50) => {
    try {
        const query = `
            query getRecentAc($username: String!, $limit: Int!) {
                recentAcSubmissionList(username: $username, limit: $limit) {
                    id
                    title
                    titleSlug
                    timestamp
                }
            }
        `;
        const resp = await axios.post("https://leetcode.com/graphql", {
            query,
            variables: { username, limit }
        }, {
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0"
            },
            timeout: 10000
        });
        return resp.data?.data?.recentAcSubmissionList || [];
    } catch (error) {
        console.error("Error fetching recent AC submissions from LeetCode:", error.message || error);
        throw error;
    }
};

module.exports = { leetcodeAPICall, fetchRecentAcSubmissions };