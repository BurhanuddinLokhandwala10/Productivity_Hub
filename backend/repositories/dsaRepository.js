const { pool } = require("../config/db");

// 1. Check if question exists
const findQuestionById = async (questionId) => {
    const result = await pool.query(
        `SELECT id FROM questions WHERE id = $1`,
        [questionId]
    );
    return result.rows[0] || null;
};

// 2. Upsert user question progress
const upsertUserProgress = async (userId, questionId, status) => {
    const result = await pool.query(
        `
        INSERT INTO user_question_progress (user_id, question_id, status)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id, question_id)
        DO UPDATE SET status = EXCLUDED.status
        RETURNING *
        `,
        [userId, questionId, status]
    );
    return result.rows[0];
};

// 3. Get all progress for a user
const findUserProgress = async (userId) => {
    const result = await pool.query(
        `
        SELECT
            uqp.question_id,
            q.question,
            q.difficulty,
            q.relevance,
            uqp.status
        FROM user_question_progress uqp
        JOIN questions q ON q.id = uqp.question_id
        WHERE uqp.user_id = $1
        ORDER BY q.id
        `,
        [userId]
    );
    return result.rows;
};

// 4. Get DSA raw analytics data
const findDsaAnalyticsData = async (userId) => {
    const totalResult = await pool.query(`SELECT COUNT(*) FROM questions`);

    const progressResult = await pool.query(
        `
        SELECT
            COUNT(*) FILTER (WHERE status = 'SOLVED') AS solved,
            COUNT(*) FILTER (WHERE status = 'ATTEMPTED') AS attempted,
            COUNT(*) FILTER (WHERE status = 'NOT_SOLVED') AS not_solved
        FROM user_question_progress
        WHERE user_id = $1
        `,
        [userId]
    );

    const difficultyResult = await pool.query(
        `
        SELECT
            q.difficulty,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE uqp.status = 'SOLVED') AS solved
        FROM questions q
        LEFT JOIN user_question_progress uqp
            ON q.id = uqp.question_id AND uqp.user_id = $1
        GROUP BY q.difficulty
        ORDER BY q.difficulty
        `,
        [userId]
    );

    const topicResult = await pool.query(
        `
        SELECT
            t.topic,
            COUNT(DISTINCT qt.question_id) AS total,
            COUNT(DISTINCT qt.question_id) FILTER (WHERE uqp.status = 'SOLVED') AS solved
        FROM topics t
        JOIN question_topics qt ON t.id = qt.topic_id
        LEFT JOIN user_question_progress uqp
            ON qt.question_id = uqp.question_id AND uqp.user_id = $1
        GROUP BY t.id, t.topic
        ORDER BY t.topic
        `,
        [userId]
    );

    return {
        total: Number(totalResult.rows[0].count),
        solved: Number(progressResult.rows[0].solved),
        attempted: Number(progressResult.rows[0].attempted),
        notSolved: Number(progressResult.rows[0].not_solved),
        difficultyRows: difficultyResult.rows,
        topicRows: topicResult.rows
    };
};

// 5. Upsert Target
const upsertUserTarget = async (userId, targetType) => {
    const result = await pool.query(
        `
        INSERT INTO dsa_targets (user_id, target_type)
        VALUES ($1, $2)
        ON CONFLICT (user_id)
        DO UPDATE SET target_type = EXCLUDED.target_type
        RETURNING *
        `,
        [userId, targetType]
    );
    return result.rows[0];
};

// 6. Get Target
const findUserTarget = async (userId) => {
    const result = await pool.query(
        `SELECT target_type FROM dsa_targets WHERE user_id = $1`,
        [userId]
    );
    return result.rows[0]?.target_type || null;
};

// 7. Get Raw Readiness Query Data
const findDsaReadinessData = async (userId) => {
    const targetResult = await pool.query(
        `SELECT target_type FROM dsa_targets WHERE user_id = $1`,
        [userId]
    );

    const relevanceResult = await pool.query(
        `SELECT q.relevance, COUNT(*)::int AS total,
         COUNT(CASE WHEN uqp.status = 'SOLVED' THEN 1 END)::int AS solved
         FROM questions q
         LEFT JOIN user_question_progress uqp ON q.id = uqp.question_id AND uqp.user_id = $1
         WHERE q.relevance != 'SKIP'
         GROUP BY q.relevance`,
        [userId]
    );

    const difficultyResult = await pool.query(
        `SELECT q.difficulty, COUNT(*)::int AS total,
         COUNT(CASE WHEN uqp.status = 'SOLVED' THEN 1 END)::int AS solved
         FROM questions q
         LEFT JOIN user_question_progress uqp ON q.id = uqp.question_id AND uqp.user_id = $1
         WHERE q.relevance != 'SKIP'
         GROUP BY q.difficulty
         ORDER BY CASE q.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END`,
        [userId]
    );

    const topicResult = await pool.query(
        `SELECT t.topic, COUNT(DISTINCT q.id)::int AS total,
         COUNT(DISTINCT CASE WHEN uqp.status = 'SOLVED' THEN q.id END)::int AS solved
         FROM topics t
         JOIN question_topics qt ON t.id = qt.topic_id
         JOIN questions q ON q.id = qt.question_id
         LEFT JOIN user_question_progress uqp ON q.id = uqp.question_id AND uqp.user_id = $1
         WHERE q.relevance != 'SKIP'
         GROUP BY t.id, t.topic
         ORDER BY t.topic`,
        [userId]
    );

    return {
        target: targetResult.rows[0]?.target_type || "PRODUCT_BASED",
        relevanceRows: relevanceResult.rows,
        difficultyRows: difficultyResult.rows,
        topicRows: topicResult.rows
    };
};

module.exports = {
    findQuestionById,
    upsertUserProgress,
    findUserProgress,
    findDsaAnalyticsData,
    upsertUserTarget,
    findUserTarget,
    findDsaReadinessData
};
