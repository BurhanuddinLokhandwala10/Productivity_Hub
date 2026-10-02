const syncQueue = require("./syncQueue");

const startSyncScheduler = async () => {
    await syncQueue.upsertJobScheduler(
        "platform-sync-scheduler",
        {
            every: 1000
        },
        {
            name: "sync-all-users",
            data: {}
        }
    );

    console.log("Sync Scheduler Started");
};

startSyncScheduler();