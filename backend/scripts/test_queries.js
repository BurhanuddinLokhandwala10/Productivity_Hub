const axios = require('axios');

async function testAllQueries() {
    const username = "BurhanuddinLokhandwala";

    // Test 1: recentSubmissionList
    try {
        const q1 = `
        query getRecentSubmissions($username: String!) {
            recentSubmissionList(username: $username) {
                title
                titleSlug
                statusDisplay
                timestamp
            }
        }
        `;
        const r1 = await axios.post("https://leetcode.com/graphql", {
            query: q1,
            variables: { username }
        }, {
            headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" }
        });
        console.log("recentSubmissionList:", r1.data);
    } catch (e) {
        console.log("Error 1:", e.message);
    }

    // Test 2: Check matchedUser with questionProgress or other fields
    try {
        const q2 = `
        query getUser($username: String!) {
            matchedUser(username: $username) {
                username
                profile {
                    userAvatar
                    realName
                    reputation
                }
                submitStatsGlobal {
                    acSubmissionNum {
                        difficulty
                        count
                    }
                }
            }
        }
        `;
        const r2 = await axios.post("https://leetcode.com/graphql", {
            query: q2,
            variables: { username }
        }, {
            headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" }
        });
        console.log("submitStatsGlobal:", JSON.stringify(r2.data, null, 2));
    } catch (e) {
        console.log("Error 2:", e.message);
    }
}

testAllQueries();
