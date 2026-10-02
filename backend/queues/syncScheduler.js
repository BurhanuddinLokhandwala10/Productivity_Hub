const syncQueue = require("./syncQueue");

const startSyncScheduler = async () => {
    await syncQueue.upsertJobScheduler(
        "platform-sync-scheduler",
        {
            every: 6 * 60 * 60 * 1000 // 6 hours
        },
        {
            name: "sync-all-users",
            data: {}
        }
    );

    console.log("Sync Scheduler Started");
};

startSyncScheduler();