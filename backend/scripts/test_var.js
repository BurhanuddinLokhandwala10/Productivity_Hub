const axios = require('axios');

async function testVariations() {
    const username = "BurhanuddinLokhandwala";

    const queries = [
        `query { recentAcSubmissionList(username: "${username}") { id title titleSlug timestamp } }`,
        `query { recentAcSubmissionList(username: "${username}", limit: 20) { id title titleSlug timestamp } }`,
        `query { recentSubmissionList(username: "${username}") { title titleSlug statusDisplay timestamp } }`,
        `query { recentSubmissionList(username: "${username}", limit: 20) { title titleSlug statusDisplay timestamp } }`
    ];

    for (let i = 0; i < queries.length; i++) {
        const resp = await axios.post("https://leetcode.com/graphql", { query: queries[i] }, {
            headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" }
        });
        console.log(`Query ${i}:`, resp.data);
    }
}

testVariations();
