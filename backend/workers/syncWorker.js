const { Worker } = require("bullmq");
const redis = require("../config/redis");
const syncQueue = require("../queues/syncQueue");

const PlatformAccount = require("../models/PlatformAccount");
const { githubApiCall, githubReposAPICall, githubCommitsAPICall } = require("../services/githubService");
const { saveGithubSnapshot, saveGithubRepository, saveGithubCommit } = require("../repositories/githubRepository");

const { leetcodeAPICall } = require("../services/leetcodeService");
const { saveLeetcodeSnapshot } = require("../repositories/leetcodeRepository");

const worker = new Worker(
    "platform-sync",

    async (job) => {

        const { userId } = job.data;

        console.log("Processing job:", job.name);
        console.log("User ID:", userId);

        if (job.name === "github-sync") {

            const account = await PlatformAccount.findOne({
                userId,
                platform: "github"
            });

            if (!account) {
                throw new Error("GitHub account not found");
            }

            const username = account.username;

            // GitHub profile
            const stats = await githubApiCall(username);
            await saveGithubSnapshot(stats, userId);

            // GitHub repositories
            const repos = await githubReposAPICall(username);

            for (const repo of repos) {

                const savedRepo = await saveGithubRepository(
                    repo,
                    userId
                );

                const [owner, repoName] =
                    repo.full_name.split("/");

                // GitHub commits
                const commits =
                    await githubCommitsAPICall(
                        owner,
                        repoName
                    );

                for (const commit of commits) {

                    await saveGithubCommit(
                        commit,
                        savedRepo.repository_id,
                        userId
                    );
                }
            }

            console.log(
                `GitHub sync completed for user ${userId}`
            );
        }

        if (job.name === "leetcode-sync") {

            const account = await PlatformAccount.findOne({
                userId,
                platform: "leetcode"
            });

            if (!account) {
                throw new Error("LeetCode account not found");
            }

            const username = account.username;

            const stats = await leetcodeAPICall(username);

            await saveLeetcodeSnapshot(stats, userId);

            console.log(
                `LeetCode sync completed for user ${userId}`
            );
        }

        if (job.name === "sync-all-users") {
            const accounts = await PlatformAccount.find({});

            for (const account of accounts) {
                await syncQueue.add(`${account.platform}-sync`, {
                    userId: account.userId
                });
            }

            console.log(
                `Scheduled sync jobs created for ${accounts.length} accounts`
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