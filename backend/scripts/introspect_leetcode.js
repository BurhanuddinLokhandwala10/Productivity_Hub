const axios = require('axios');

async function inspectSchema() {
    // Introspection query for Query type fields matching submission or user
    const introspectionQuery = `
    query IntrospectLeetCode {
        __schema {
            queryType {
                fields {
                    name
                    args {
                        name
                        type {
                            name
                            kind
                        }
                    }
                }
            }
        }
    }
    `;

    try {
        const resp = await axios.post("https://leetcode.com/graphql", {
            query: introspectionQuery
        }, {
            headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
            timeout: 10000
        });

        const fields = resp.data?.data?.__schema?.queryType?.fields || [];
        const submissionFields = fields.filter(f => 
            f.name.toLowerCase().includes('submission') || 
            f.name.toLowerCase().includes('recent') ||
            f.name.toLowerCase().includes('ac') ||
            f.name.toLowerCase().includes('progress')
        );
        console.log("Matching GraphQL queries on LeetCode:", submissionFields.map(f => f.name));
    } catch (e) {
        console.error("Introspection error:", e.response?.data || e.message);
    }
}

inspectSchema();
