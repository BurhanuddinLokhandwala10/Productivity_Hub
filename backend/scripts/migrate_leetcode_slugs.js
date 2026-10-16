const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/USER/Documents/Study/Project/Productivity_Hub/backend/.env' });
const { pool } = require('c:/Users/USER/Documents/Study/Project/Productivity_Hub/backend/config/db');

// Explicit overrides for questions with descriptive subtitles, alternate names, or formula text
const SLUG_OVERRIDES = {
    "Maximum Subarray (Kadane's)": "maximum-subarray",
    "Sort Colors (Dutch National Flag)": "sort-colors",
    "Rotate Image (90 degrees)": "rotate-image",
    "Implement strStr() / Needle in Haystack": "find-the-index-of-the-first-occurrence-in-a-string",
    "Insert Delete GetRandom O(1)": "insert-delete-getrandom-o1",
    "Sqrt(x)": "sqrtx",
    "Sort an Array (Merge/Quick from scratch)": "sort-an-array",
    "01 Matrix (Distance to nearest 0)": "01-matrix",
    "01 Matrix": "01-matrix",
    "Implement Trie (Prefix Tree)": "implement-trie-prefix-tree",
    "Dijkstra's Algorithm (Network Delay Time)": "network-delay-time",
    "Bellman-Ford (Cheapest Flights K Stops)": "cheapest-flights-within-k-stops",
    "Minimum Spanning Tree (Kruskal/Prim)": "min-cost-to-connect-all-points",
    "0/1 Knapsack (Target Sum)": "target-sum",
    "Best Time to Buy/Sell Stock with Cooldown": "best-time-to-buy-and-sell-stock-with-cooldown",
    "Best Time to Buy/Sell Stock with Fee": "best-time-to-buy-and-sell-stock-with-transaction-fee",
    "Subsets (bitmask)": "subsets",
    "Subsets": "subsets",
    "Subsets II": "subsets-ii",
    "Pow(x, n)": "powx-n"
};

function generateSlug(questionText) {
    const trimmed = questionText.trim();
    if (SLUG_OVERRIDES[trimmed]) {
        return SLUG_OVERRIDES[trimmed];
    }

    // Strip trailing parenthesis if it exists (e.g. "Some Problem (Extra)")
    let clean = trimmed;
    if (clean.includes('(') && clean.endsWith(')')) {
        clean = clean.replace(/\s*\([^)]*\)$/, '');
    }

    return clean
        .toLowerCase()
        .replace(/['']/g, '') // Remove apostrophes e.g. Dijkstra's -> Dijkstras
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
        .replace(/^-+|-+$/g, ''); // Trim hyphens
}

async function migrate() {
    const client = await pool.connect();
    try {
        console.log("Adding leetcode_slug column if not exists...");
        await client.query(`
            ALTER TABLE questions 
            ADD COLUMN IF NOT EXISTS leetcode_slug TEXT;
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_questions_leetcode_slug 
            ON questions(leetcode_slug);
        `);

        const questionsRes = await client.query('SELECT id, question, leetcode_slug FROM questions');
        console.log(`Found ${questionsRes.rows.length} questions.`);

        let updated = 0;
        for (const row of questionsRes.rows) {
            const slug = generateSlug(row.question);
            await client.query(
                'UPDATE questions SET leetcode_slug = $1 WHERE id = $2',
                [slug, row.id]
            );
            updated++;
        }

        console.log(`Successfully migrated ${updated} questions with leetcode_slug.`);

        // Verify sample
        const sampleRes = await client.query('SELECT id, question, leetcode_slug FROM questions ORDER BY id LIMIT 15');
        console.log("Sample migrated questions:", sampleRes.rows);
    } catch (err) {
        console.error("Migration failed:", err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
