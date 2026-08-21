const { pool } = require("../config/db");


const saveLeetcodeSnapshot = async (stats) => {
    const submitStats = stats.submitStats;
    const rating = stats.rating;

    const all = submitStats.find(item => item.difficulty === "All");
    const easy = submitStats.find(item => item.difficulty === "Easy");
    const medium = submitStats.find(item => item.difficulty === "Medium");
    const hard = submitStats.find(item => item.difficulty === "Hard");

    const query = `
        INSERT INTO leetcode_snapshots
        (snapshot_date, total_solved, easy_solved, medium_solved, hard_solved, rating)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `;

    const values = [
        new Date(),
        all?.count || 0,
        easy?.count || 0,
        medium?.count || 0,
        hard?.count || 0,
        rating
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = { saveLeetcodeSnapshot }