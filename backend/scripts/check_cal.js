const axios = require('axios');

async function checkCalendar() {
    const username = "BurhanuddinLokhandwala";
    const q = `
    query getUserProfile($username: String!) {
        matchedUser(username: $username) {
            submissionCalendar
            submitStats {
                acSubmissionNum { difficulty count }
                totalSubmissionNum { difficulty count }
            }
        }
        recentAcSubmissionList(username: $username, limit: 10) {
            id
            title
            titleSlug
            timestamp
        }
    }
    `;

    const r = await axios.post("https://leetcode.com/graphql", {
        query: q,
        variables: { username }
    }, {
        headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" }
    });

    const data = r.data?.data;
    console.log("submitStats AC:", data?.matchedUser?.submitStats?.acSubmissionNum);
    console.log("recentAcSubmissionList:", data?.recentAcSubmissionList);

    const cal = JSON.parse(data?.matchedUser?.submissionCalendar || "{}");
    const sorted = Object.entries(cal)
        .map(([ts, count]) => ({ date: new Date(Number(ts) * 1000).toISOString().split('T')[0], count, ts }))
        .sort((a, b) => b.ts - a.ts);

    console.log("Latest 5 submission calendar days:", sorted.slice(0, 5));
}

checkCalendar();
