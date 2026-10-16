const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/USER/Documents/Study/Project/Productivity_Hub/backend/.env' });
const mongoose = require('mongoose');
const { pool } = require('../config/db');
const PlatformAccount = require('../models/PlatformAccount');
const { leetcodeAPICall } = require('../services/leetcodeService');
const { findQuestionBySlug } = require('../repositories/dsaRepository');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const accounts = await PlatformAccount.find({ platform: 'leetcode' });
        console.log('LeetCode accounts in MongoDB:', accounts.map(a => ({
            id: a._id,
            userId: a.userId,
            username: a.username,
            syncStatus: a.syncStatus,
            lastSyncedAt: a.lastSyncedAt,
            lastSyncError: a.lastSyncError
        })));

        // Check Majority Element in questions
        const qRes = await pool.query("SELECT * FROM questions WHERE question ILIKE '%majority element%'");
        console.log('Majority Element in questions table:', qRes.rows);

        // Check if there are any submissions for the user on LeetCode right now
        for (const acc of accounts) {
            console.log(`\nFetching live LeetCode stats for username: "${acc.username}"...`);
            const data = await leetcodeAPICall(acc.username);
            console.log('LeetCode data recentAcSubmissions:', data.recentAcSubmissions);

            // Check user progress in DB for this user
            const prog = await pool.query(
                "SELECT uqp.*, q.question, q.leetcode_slug FROM user_question_progress uqp JOIN questions q ON uqp.question_id = q.id WHERE uqp.user_id = $1",
                [acc.userId.toString()]
            );
            console.log(`Current progress for user ${acc.userId}:`, prog.rows);
        }
    } catch (e) {
        console.error('Error during check:', e);
    } finally {
        await mongoose.disconnect();
        await pool.end();
    }
}

check();
