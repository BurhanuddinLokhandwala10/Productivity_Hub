const PlatformAccount = require('../models/PlatformAccount');

const { leetcodeAPICall } = require('../services/leetcodeService')
const { saveLeetcodeSnapshot } = require('../repositories/leetcodeRepository')
const { githubApiCall, githubCommitsAPICall, githubReposAPICall } = require('../services/githubService')
const { saveGithubSnapshot, saveGithubRepository, saveGithubCommit } = require('../repositories/githubRepository')



const platformRegister = async (req, res) => {
    const { platform, username } = req.body;

    if (!platform || !username) {
        res.status(400).json({
            message: "Please Enter all The Credentials"
        })
        return;
    }
    try {
        const platformAccount = new PlatformAccount({
            userId: req.userId,
            platform,
            username
        })
        await platformAccount.save();
        res.status(200).json({
            message: "Platform Account Created Successfully",
            platformAccount
        })
    } catch (e) {
        res.status(500).json({
            message: `Failed to Create Platform Account due to : ${e}`
        })
    }
}


const getPlatformStats = async (req, res) => {
    const { platform } = req.query;
    const account = await PlatformAccount.findOne({ userId: req.userId, platform })
    if (!account) {
        res.status(404).json({
            message: "Platform Account Not Found"
        })
        return;
    }

    const username = account.username
    try {
        if (platform === "github") {
            // getting the user profile details and saving it to database
            const stats = await githubApiCall(username);
            const saveStatus = await saveGithubSnapshot(stats, req.userId);

            // getting the repos and saving it to database
            const repos = await githubReposAPICall(username)
            // basically the api is returning the array therefore we were not able to fetch the id from it 
            // so we are going through each repo and saving it to database
            // if it was a object then we can fetch the repo.id directly
            for (const repo of repos) {
                const savedRepo = await saveGithubRepository(repo, req.userId);
                const [owner, repoName] = repo.full_name.split("/");
                const commits = await githubCommitsAPICall(owner, repoName);

                for (const commit of commits) {
                    await saveGithubCommit(commit, savedRepo.repository_id, req.userId);
                }
            }
            return res.status(200).json({ message: "Github Stats, Repo and Commits Fetched Successfully and Saved Successfully" });
        }

        if (platform === "leetcode") {
            const stats = await leetcodeAPICall(username);

            const saveStatus = await saveLeetcodeSnapshot(stats, req.userId);
            
            let dsaSync = null;
            if (stats?.recentAcSubmissions && stats.recentAcSubmissions.length > 0) {
                const { syncLeetcodeAcceptedSubmissions } = require('../repositories/dsaRepository');
                dsaSync = await syncLeetcodeAcceptedSubmissions(req.userId, stats.recentAcSubmissions);
            }

            return res.status(200).json({
                message: "Leetcode Stats Fetched Successfully",
                stats,
                saveStatus,
                dsaSync
            });
        }

        return res.status(400).json({ message: "Invalid platform" });
    } catch (e) {
        return res.status(500).json({ message: "Failed to fetch stats", error: `${e}` });
    }
}

const triggerSyncNow = async (req, res) => {
    try {
        const accounts = await PlatformAccount.find({ userId: req.userId });
        if (!accounts || accounts.length === 0) {
            return res.status(404).json({ message: "No platform accounts registered for this user" });
        }

        const syncQueue = require('../queues/syncQueue');
        const queued = [];

        for (const account of accounts) {
            const jobId = `${account.platform}-sync-${account.userId}-${Date.now()}`;
            const job = await syncQueue.add(
                `${account.platform}-sync`,
                { userId: account.userId.toString() },
                {
                    jobId,
                    attempts: 3,
                    backoff: { type: "exponential", delay: 5000 }
                }
            );
            queued.push({ platform: account.platform, jobId: job.id });
        }

        return res.status(200).json({
            message: "Sync job(s) queued successfully",
            queued
        });
    } catch (e) {
        console.error("triggerSyncNow error:", e);
        return res.status(500).json({ message: "Failed to queue sync jobs", error: `${e}` });
    }
};

const getSyncStatus = async (req, res) => {
    try {
        const accounts = await PlatformAccount.find({ userId: req.userId }).select('platform username lastSyncedAt syncStatus lastSyncError');
        return res.status(200).json({
            accounts: accounts || []
        });
    } catch (e) {
        console.error("getSyncStatus error:", e);
        return res.status(500).json({ message: "Failed to fetch sync status", error: `${e}` });
    }
};

module.exports = { platformRegister, getPlatformStats, triggerSyncNow, getSyncStatus };