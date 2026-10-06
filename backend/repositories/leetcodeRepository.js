const { pool } = require("../config/db");


const saveLeetcodeSnapshot = async (stats, userId) => {
    const submitStats = stats.submitStats;
    const rating = stats.rating;
    const submissionCalendar = JSON.parse(stats.submissionCalendar);

    let streak = 0;

    // Unix Timestamp → JavaScript Date
    const dates = Object.keys(submissionCalendar)
        .filter(timestamp => submissionCalendar[timestamp] > 0)
        .map(timestamp => new Date(Number(timestamp) * 1000))
        // Why * 1000? -> Unix timestamps are generally in seconds, while JavaScript Date uses milliseconds.
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

    // console.log("SAVING LEETCODE SNAPSHOT:", {
    //     totalSolved: stats.totalSolved,
    //     easy: stats.easy,
    //     medium: stats.medium,
    //     hard: stats.hard,
    //     rating: stats.rating,
    //     streak: stats.streak,
    const newTotal = all?.count || 0;
    const newEasy = easy?.count || 0;
    const newMedium = medium?.count || 0;
    const newHard = hard?.count || 0;
    const newRating = Number(rating) || 0;
    const newStreak = Number(streak) || 0;

    // Feature 4: Compare latest stored values with newly fetched values.
    // If relevant values are unchanged, do not create another snapshot.
    const latestQuery = `
        SELECT *
        FROM leetcode_snapshots
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 1;
    `;
    const latestResult = await pool.query(latestQuery, [userId]);
    const latest = latestResult.rows[0];

    if (latest) {
        const isUnchanged =
            Number(latest.total_solved) === newTotal &&
            Number(latest.easy_solved) === newEasy &&
            Number(latest.medium_solved) === newMedium &&
            Number(latest.hard_solved) === newHard &&
            Number(latest.rating) === newRating &&
            Number(latest.streak) === newStreak;

        if (isUnchanged) {
            console.log(`LeetCode data unchanged for user ${userId}, skipping new snapshot creation.`);
            await saveLeetcodeDailyActivity(userId, stats.submissionCalendar);
            return latest;
        }
    }

    const query = `
        INSERT INTO leetcode_snapshots
        (user_id, snapshot_date, total_solved, easy_solved, medium_solved, hard_solved, rating, streak)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *; 
    `;

    const values = [
        userId,
        new Date(),
        newTotal,
        newEasy,
        newMedium,
        newHard,
        newRating,
        newStreak
    ];

    const result = await pool.query(query, values);
    console.log("New LeetCode snapshot created:", result.rows[0]);

    // Save daily submission activity into leetcode_daily_activity (with UPSERT to prevent duplicate rows)
    await saveLeetcodeDailyActivity(userId, stats.submissionCalendar);

    return result.rows[0];
};

/**
 * Saves or updates daily submission counts into leetcode_daily_activity.
 * Scoped strictly by (user_id, activity_date).
 */
const saveLeetcodeDailyActivity = async (userId, submissionCalendar) => {
    if (!submissionCalendar) return;
    let parsed;
    try {
        parsed = typeof submissionCalendar === 'string' ? JSON.parse(submissionCalendar) : submissionCalendar;
    } catch {
        return;
    }
    const entries = Object.entries(parsed).filter(([_, count]) => Number(count) >= 0);
    if (entries.length === 0) return;

    // Process in batches of 50 for efficiency and parameter limits
    const chunkSize = 50;
    for (let i = 0; i < entries.length; i += chunkSize) {
        const chunk = entries.slice(i, i + chunkSize);
        const valueClauses = [];
        const values = [userId];

        chunk.forEach(([ts, count]) => {
            const dateStr = new Date(Number(ts) * 1000).toISOString().split('T')[0];
            const dateIdx = values.length + 1;
            const countIdx = values.length + 2;
            values.push(dateStr, Number(count));
            valueClauses.push(`($1, $${dateIdx}, $${countIdx}, CURRENT_TIMESTAMP)`);
        });

        const query = `
            INSERT INTO leetcode_daily_activity (user_id, activity_date, submission_count, updated_at)
            VALUES ${valueClauses.join(', ')}
            ON CONFLICT (user_id, activity_date)
            DO UPDATE SET submission_count = EXCLUDED.submission_count, updated_at = CURRENT_TIMESTAMP;
        `;
        await pool.query(query, values);
    }
};

/**
 * Retrieves daily LeetCode activity for the last 12 months for the authenticated user
 */
const getLeetcodeDailyActivity = async (userId) => {
    const query = `
        SELECT
            TO_CHAR(activity_date, 'YYYY-MM-DD') AS date,
            submission_count AS count
        FROM leetcode_daily_activity
        WHERE user_id = $1
          AND activity_date >= CURRENT_DATE - INTERVAL '365 days'
        ORDER BY activity_date ASC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows.map(r => ({
        date: r.date,
        count: Number(r.count)
    }));
};

const getProgress = async (userId) => {
    // 1. SQL query
    const query = `
        SELECT *
        FROM leetcode_snapshots
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 2;
    `;
    // 2. Execute query
    const result = await pool.query(query, [userId]);

    // If no snapshots at all
    if (result.rows.length === 0) {
        return {
            easyProgress: 0,
            mediumProgress: 0,
            hardProgress: 0,
            totalProgress: 0,
            ratingDiff: 0,
            streakProgress: 0,
            current: {
                totalSolved: 0,
                easy: 0,
                medium: 0,
                hard: 0,
                rating: 0,
                streak: 0
            }
        };
    }

    const currRow = result.rows[0];
    const current = {
        totalSolved: Number(currRow.total_solved) || 0,
        easy: Number(currRow.easy_solved) || 0,
        medium: Number(currRow.medium_solved) || 0,
        hard: Number(currRow.hard_solved) || 0,
        rating: Number(currRow.rating) || 0,
        streak: Number(currRow.streak) || 0
    };

    // If only one snapshot, progress is 0 but current totals are available
    if (result.rows.length === 1) {
        return {
            easyProgress: 0,
            mediumProgress: 0,
            hardProgress: 0,
            totalProgress: 0,
            ratingDiff: 0,
            streakProgress: 0,
            current
        };
    }

    const previousRow = result.rows[1];

    // 4. Calculate progress
    const progress = {
        easyProgress: currRow.easy_solved - previousRow.easy_solved,
        mediumProgress: currRow.medium_solved - previousRow.medium_solved,
        hardProgress: currRow.hard_solved - previousRow.hard_solved,
        totalProgress: currRow.total_solved - previousRow.total_solved,
        ratingDiff: Number(currRow.rating) - Number(previousRow.rating),
        streakProgress: currRow.streak - previousRow.streak,
        current
    };

    return progress;
};

module.exports = {
    saveLeetcodeSnapshot,
    saveLeetcodeDailyActivity,
    getLeetcodeDailyActivity,
    getProgress
};