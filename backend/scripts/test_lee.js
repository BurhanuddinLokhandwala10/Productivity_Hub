const axios = require('axios');

async function testLee() {
    const q = `query { recentAcSubmissionList(username: "lee215", limit: 5) { id title titleSlug timestamp } }`;
    const r = await axios.post("https://leetcode.com/graphql", { query: q });
    console.log(r.data);
}

testLee();
