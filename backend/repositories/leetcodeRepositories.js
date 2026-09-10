const { pool } = require("../config/db");


const saveLeetcodeSnapshot = async (stats) => {
    const submitStats = stats.submitStats;
    const rating = stats.rating;
    const submissionCalendar = JSON.parse(stats.submissionCalendar);

    let streak = 0;

    const dates = Object.keys(submissionCalendar)
        .filter(timestamp => submissionCalendar[timestamp] > 0)
        .map(timestamp => new Date(Number(timestamp) * 1000))
        .sort((a, b) => b - a);

    if (dates.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const latestDate = new Date(dates[0]);
        latestDate.setHours(0, 0, 0, 0);

        const daysFromToday =
            (today - latestDate) / (1000 * 60 * 60 * 24);

        // No submission today or yesterday = current streak is 0
        if (daysFromToday > 1) {
            streak = 0;
        } else {
            streak = 1;

            for (let i = 0; i < dates.length - 1; i++) {
                const current = new Date(dates[i]);
                const previous = new Date(dates[i + 1]);

                current.setHours(0, 0, 0, 0);
                previous.setHours(0, 0, 0, 0);

                const difference =
                    (current - previous) / (1000 * 60 * 60 * 24);

                if (difference === 1) {
                    streak++;
                } else {
                    break;
                }
            }
        }
    }

    const all = submitStats.find(item => item.difficulty === "All");
    const easy = submitStats.find(item => item.difficulty === "Easy");
    const medium = submitStats.find(item => item.difficulty === "Medium");
    const hard = submitStats.find(item => item.difficulty === "Hard");

    const query = `
        INSERT INTO leetcode_snapshots
        (snapshot_date, total_solved, easy_solved, medium_solved, hard_solved, rating, streak)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;

    const values = [
        new Date(),
        all?.count || 0,
        easy?.count || 0,
        medium?.count || 0,
        hard?.count || 0,
        rating,
        streak
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
};

const getProgress = async () => {

    // 1. SQL query
    const query = `
        SELECT *
        FROM leetcode_snapshots
        ORDER BY snapshot_date DESC
        LIMIT 2;
    `;

    // 2. Execute query
    const result = await pool.query(query);

    // if we don't have two snapshots then we can't calculate the progress
    if (result.rows.length < 2) {
        return {
            message: "Not enough data to calculate progress",
            data: result.rows
        }
    }

    // 3. Get current and previous
    const currRow = result.rows[0];
    const previousRow = result.rows[1];

    // 4. Calculate progress
    const progress = {
        easyProgress: currRow.easy_solved - previousRow.easy_solved,
        mediumProgress: currRow.medium_solved - previousRow.medium_solved,
        hardProgress: currRow.hard_solved - previousRow.hard_solved,
        totalProgress: currRow.total_solved - previousRow.total_solved,
        ratingDiff: currRow.rating - previousRow.rating,
        streakProgress: currRow.streak - previousRow.streak
    };

    return progress;
};

module.exports = { saveLeetcodeSnapshot, getProgress }