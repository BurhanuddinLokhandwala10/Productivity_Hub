const { getGithubCommitStats, getGithubCommitTrend, getGithubDailyActivity } = require("../repositories/githubRepository");
const {
    getGithubHealthScore: getGithubHealthScoreService
} = require("../services/developerAnalyticsService");


const getGithubHealthScore = async (req, res) => {
    try {
        const healthScore = await getGithubHealthScoreService(req.userId);

        res.status(200).json(healthScore);
    } catch (error) {
        console.error("GitHub Health Error:", error);

        res.status(500).json({
            message: "Failed to calculate GitHub health score",
            error: error.message
        });
    }
};

const getGithubCommitStatsController = async (req, res) => {
    try {
        const stats = await getGithubCommitStats(req.userId);

        res.status(200).json({
            message: "GitHub Commit Stats Fetched Successfully",
            stats
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch GitHub commit stats"
        });
    }
};

const getGithubCommitTrendController = async (req, res) => {
    try {
        const trend = await getGithubCommitTrend(req.userId);

        res.status(200).json({
            message: "GitHub Commit Trend Fetched Successfully",
            trend
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch GitHub commit trend"
        });
    }
};

const getGithubDailyActivityController = async (req, res) => {
    try {
        const activity = await getGithubDailyActivity(req.userId);

        res.status(200).json({
            message: "GitHub Daily Activity Fetched Successfully",
            activity
        });
    } catch (error) {
        console.error("GitHub Daily Activity Error:", error);
        res.status(500).json({
            message: "Failed to fetch GitHub daily activity",
            error: error.message
        });
    }
};

const crypto = require("crypto");
const PlatformAccount = require("../models/PlatformAccount");
const syncQueue = require("../queues/syncQueue");

const verifyGithubSignature = (rawBody, signatureHeader, secret) => {
    if (!secret || !signatureHeader || !rawBody) {
        return false;
    }
    try {
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(rawBody);
        const digest = "sha256=" + hmac.digest("hex");
        const sigBuffer = Buffer.from(signatureHeader);
        const digestBuffer = Buffer.from(digest);
        if (sigBuffer.length !== digestBuffer.length) {
            return false;
        }
        return crypto.timingSafeEqual(sigBuffer, digestBuffer);
    } catch {
        return false;
    }
};

const handleGithubWebhook = async (req, res) => {
    try {
        const secret = process.env.GITHUB_WEBHOOK_SECRET;
        const signature = req.headers["x-hub-signature-256"];
        const event = req.headers["x-github-event"];
        const deliveryId = req.headers["x-github-delivery"];

        // 1. Signature validation (if secret is configured)
        if (secret) {
            if (!signature) {
                return res.status(401).json({ message: "Missing X-Hub-Signature-256 header" });
            }
            const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
            const isValid = verifyGithubSignature(rawBody, signature, secret);
            if (!isValid) {
                return res.status(401).json({ message: "Invalid webhook signature" });
            }
        }

        // 2. Respond to GitHub ping event
        if (event === "ping") {
            return res.status(200).json({ message: "pong" });
        }

        // 3. We only handle push events for sync
        if (event && event !== "push") {
            return res.status(200).json({ message: `Ignored event: ${event}` });
        }

        // 4. Extract repository and sender usernames
        const repoOwner = req.body?.repository?.owner?.login || req.body?.repository?.owner?.name;
        const sender = req.body?.sender?.login;
        const candidates = [repoOwner, sender].filter(Boolean);

        if (candidates.length === 0) {
            return res.status(200).json({ message: "No repository or sender information found in payload" });
        }

        // 5. Match with registered PlatformAccounts
        const accounts = await PlatformAccount.find({
            platform: "github",
            username: { $in: candidates.map(c => new RegExp(`^${c}$`, 'i')) }
        });

        if (accounts.length === 0) {
            return res.status(200).json({
                message: "Webhook received, but no matching registered accounts found in system"
            });
        }

        // 6. Queue background sync job for each matched account
        const queuedJobs = [];
        for (const account of accounts) {
            const jobId = deliveryId
                ? `github-sync-${account.userId}-${deliveryId}`
                : `github-sync-${account.userId}-${Date.now()}`;

            const job = await syncQueue.add(
                "github-sync",
                { userId: account.userId.toString() },
                {
                    jobId,
                    attempts: 3,
                    backoff: { type: "exponential", delay: 5000 }
                }
            );
            queuedJobs.push(job.id);
        }

        return res.status(200).json({
            message: "GitHub webhook processed and sync job(s) queued successfully",
            queuedJobs
        });
    } catch (error) {
        console.error("handleGithubWebhook error:", error);
        return res.status(500).json({
            message: "Failed to process GitHub webhook",
            error: error.message
        });
    }
};

module.exports = {
    getGithubHealthScore,
    getGithubCommitStatsController,
    getGithubCommitTrendController,
    getGithubDailyActivityController,
    handleGithubWebhook,
    verifyGithubSignature
};