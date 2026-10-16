const dotenv = require('dotenv');
dotenv.config({ path: 'c:/Users/USER/Documents/Study/Project/Productivity_Hub/backend/.env' });
const mongoose = require('mongoose');
const PlatformAccount = require('../models/PlatformAccount');
const { leetcodeAPICall } = require('../services/leetcodeService');

async function checkLeetcode() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const account = await PlatformAccount.findOne({ platform: 'leetcode' });
        console.log('Account username:', account.username);
        const stats = await leetcodeAPICall(account.username);
        console.log('Total recentAcSubmissions count:', stats.recentAcSubmissions.length);
        console.log('recentAcSubmissions:', JSON.stringify(stats.recentAcSubmissions, null, 2));
    } finally {
        await mongoose.disconnect();
    }
}

checkLeetcode();
