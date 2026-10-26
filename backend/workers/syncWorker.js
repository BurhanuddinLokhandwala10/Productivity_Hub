const { Worker } = require("bullmq");
const redis = require("../config/redis");
const syncQueue = require("../queues/syncQueue");

const PlatformAccount = require("../models/PlatformAccount");
const { githubApiCall, githubReposAPICall, githubCommitsAPICall } = require("../services/githubService");
const { saveGithubSnapshot, saveGithubRepository, saveGithubCommit } = require("../repositories/githubRepository");

const { leetcodeAPICall } = require("../services/leetcodeService");
const { saveLeetcodeSnapshot } = require("../repositories/leetcodeRepository");
const { syncLeetcodeAcceptedSubmissions } = require("../repositories/dsaRepository");

const worker = new Worker(
    "platform-sync",

    async (job) => {
        const { userId } = job.data;

        console.log(`Processing job: ${job.name} (id: ${job.id}) for user: ${userId}`);

        if (job.name === "github-sync") {
            const account = await PlatformAccount.findOne({
                userId,
                platform: { $regex: /^github$/i }
            });

            if (!account) {
                console.error(`[github-sync] No GitHub account for userId=${userId}`);
                throw new Error("GitHub account not found");
            }

            try {
                await PlatformAccount.updateOne(
                    { _id: account._id },
                    { $set: { syncStatus: "SYNCING" } }
                );

                const username = account.username;

                // GitHub profile
                const stats = await githubApiCall(username);
                if (stats) {
                    await saveGithubSnapshot(stats, userId);
                }

                // GitHub repositories
                const repos = await githubReposAPICall(username);

                if (Array.isArray(repos)) {
                    for (const repo of repos) {
                        const savedRepo = await saveGithubRepository(
                            repo,
                            userId
                        );

                        if (repo.full_name && savedRepo?.repository_id) {
                            const [owner, repoName] = repo.full_name.split("/");
                            const commits = await githubCommitsAPICall(
                                owner,
                                repoName
                            );

                            if (Array.isArray(commits)) {
                                for (const commit of commits) {
                                    await saveGithubCommit(
                                        commit,
                                        savedRepo.repository_id,
                                        userId
                                    );
                                }
                            }
                        }
                    }
                }

                await PlatformAccount.updateOne(
                    { _id: account._id },
                    {
                        $set: {
                            syncStatus: "SUCCESS",
                            lastSyncedAt: new Date(),
                            lastSyncError: null
                        }
                    }
                );

                console.log(`GitHub sync completed successfully for user ${userId}`);
            } catch (err) {
                await PlatformAccount.updateOne(
                    { _id: account._id },
                    {
                        $set: {
                            syncStatus: "ERROR",
                            lastSyncError: err.message
                        }
                    }
                );
                throw err;
            }
        }

        if (job.name === "leetcode-sync") {
            // Case-insensitive platform lookup to handle inconsistent registration values
            const account = await PlatformAccount.findOne({
                userId,
                platform: { $regex: /^leetcode$/i }
            });

            if (!account) {
                // Diagnostic: log what accounts exist for this userId (without credentials)
                const allAccounts = await PlatformAccount.find({ userId }).select('platform syncStatus');
                console.error(`[leetcode-sync] No leetcode account for userId=${userId}. Existing accounts:`,
                    allAccounts.map(a => ({ platform: a.platform, status: a.syncStatus }))
                );
                throw new Error("LeetCode account not found");
            }

            console.log(`[leetcode-sync] Found account for userId=${userId}, username=${account.username}`);

            try {
                await PlatformAccount.updateOne(
                    { _id: account._id },
                    { $set: { syncStatus: "SYNCING" } }
                );

                const username = account.username;

                const stats = await leetcodeAPICall(username);
                if (stats) {
                    await saveLeetcodeSnapshot(stats, userId);

                    // Feature 1: Automatically synchronize accepted submissions with DSA sheet
                    if (stats.recentAcSubmissions && stats.recentAcSubmissions.length > 0) {
                        const dsaResult = await syncLeetcodeAcceptedSubmissions(
                            userId,
                            stats.recentAcSubmissions
                        );
                        console.log(`DSA sheet sync result for user ${userId}:`, {
                            updated: dsaResult.updated,
                            matched: dsaResult.matched
                        });
                    }
                }

                await PlatformAccount.updateOne(
                    { _id: account._id },
                    {
                        $set: {
                            syncStatus: "SUCCESS",
                            lastSyncedAt: new Date(),
                            lastSyncError: null
                        }
                    }
                );

                console.log(`LeetCode sync completed successfully for user ${userId}`);
            } catch (err) {
                await PlatformAccount.updateOne(
                    { _id: account._id },
                    {
                        $set: {
                            syncStatus: "ERROR",
                            lastSyncError: err.message
                        }
                    }
                );
                throw err;
            }
        }

        if (job.name === "sync-all-users") {
            const accounts = await PlatformAccount.find({});
            const queuedPairs = new Set();
            let scheduledCount = 0;

            for (const account of accounts) {
                const normPlatform = (account.platform || '').toLowerCase().trim();
                if (!['github', 'leetcode'].includes(normPlatform)) continue;

                const pairKey = `${account.userId.toString()}-${normPlatform}`;
                if (queuedPairs.has(pairKey)) continue;
                queuedPairs.add(pairKey);

                // Deduplicate scheduled sync jobs so concurrent runs for same user/platform are avoided
                const dedupId = `${normPlatform}-sync-${account.userId}-${Math.floor(Date.now() / 60000)}`;
                await syncQueue.add(
                    `${normPlatform}-sync`,
                    { userId: account.userId.toString() },
                    {
                        jobId: dedupId,
                        attempts: 3,
                        backoff: { type: "exponential", delay: 5000 }
                    }
                );
                scheduledCount++;
            }

            console.log(
                `Scheduled sync jobs created for ${scheduledCount} unique user-platform accounts`
            );

            return;
        }
    },

    {
        connection: redis
    }
);


worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});


worker.on("failed", (job, err) => {
    console.error(
        `Job ${job?.id} failed:`,
        err.message
    );
});


console.log("Sync Worker Started");