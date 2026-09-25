const { Queue } = require("bullmq");
const redis = require("../config/redis");

const syncQueue = new Queue("platform-sync", {
    connection: redis,

    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000
        },
        removeOnComplete: 100,
        removeOnFail: 100
    }
});

module.exports = syncQueue;