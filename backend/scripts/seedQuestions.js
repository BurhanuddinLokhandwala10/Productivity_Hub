const dotenv = require("dotenv");
dotenv.config();

const XLSX = require("xlsx");
const { pool } = require("../config/db");

// reads the excel sheet, since may the excel sheet content amny sheet inside it so therefore we calll it as workbook - collection of sheets
const workbook = XLSX.readFile("DSA_BIBLE.xlsx");

// we will select the DSA_BIBLE sheet from the workbook
const sheet = workbook.Sheets["DSA Bible"];


// at lasy we will convert the sheet into the jso format
const rows = XLSX.utils.sheet_to_json(sheet);
// console.log(rows.slice(0, 5));

const questions = rows.filter((row) => {
    if (row.DIFFICULTY == "Easy" || row.DIFFICULTY == "Medium" || row.DIFFICULTY == "Hard") {
        return row.DIFFICULTY
    }
});

// console.log(questions);

let currentTopic = null;

async function seedQuestions() {

    for (const row of rows) {

        const problem = row.PROBLEM?.trim();

        if (!problem) continue;

        // Actual question
        if (
            row.DIFFICULTY === "Easy" ||
            row.DIFFICULTY === "Medium" ||
            row.DIFFICULTY === "Hard"
        ) {

            // Insert question
            await pool.query(
                `
                INSERT INTO questions (question, difficulty, relevance)
                VALUES ($1, $2, $3)
                ON CONFLICT (question) DO NOTHING
                `,
                [
                    problem,
                    row.DIFFICULTY,
                    row["INTERVIEW RELEVANCE"]
                ]
            );

            // Get question id
            const questionResult = await pool.query(
                `SELECT id FROM questions WHERE question = $1`,
                [problem]
            );

            const questionId = questionResult.rows[0].id;

            // Get topic id
            const topicResult = await pool.query(
                `SELECT id FROM topics WHERE topic = $1`,
                [currentTopic]
            );

            const topicId = topicResult.rows[0].id;

            // Connect question with topic
            await pool.query(
                `
                INSERT INTO question_topics (question_id, topic_id)
                VALUES ($1, $2)
                ON CONFLICT DO NOTHING
                `,
                [questionId, topicId]
            );

        }

        // Topic header
        else if (
            problem === problem.toUpperCase() &&
            !problem.startsWith("PATTERNS:") &&
            !problem.includes("─") &&
            !problem.includes("🔵")
        ) {
            currentTopic = problem;

            await pool.query(
                `
        INSERT INTO topics (topic)
        VALUES ($1)
        ON CONFLICT (topic) DO NOTHING
        `,
                [currentTopic]
            );
        }
    }

    console.log("Questions and topics seeded successfully");
}

seedQuestions();
