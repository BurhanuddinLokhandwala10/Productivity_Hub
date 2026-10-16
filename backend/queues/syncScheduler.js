const syncQueue = require("./syncQueue");

// Configurable fast sync interval: defaults to 5 minutes (300,000 ms)
const FAST_SYNC_INTERVAL_MS = Number(process.env.FAST_SYNC_INTERVAL_MS) || (5 * 60 * 1000);
// 60-minute reconciliation fallback interval
const RECONCILIATION_INTERVAL_MS = Number(process.env.RECONCILIATION_INTERVAL_MS) || (60 * 60 * 1000);

const startSyncScheduler = async () => {
    try {
        // 1. Existing 60-minute reconciliation fallback schedule
        await syncQueue.upsertJobScheduler(
            "platform-sync-scheduler",
            {
                every: RECONCILIATION_INTERVAL_MS
            },
            {
                name: "sync-all-users",
                data: { isReconciliation: true }
            }
        );

        // 2. Faster background synchronization scheduler for detecting recent activity
        await syncQueue.upsertJobScheduler(
            "platform-fast-sync-scheduler",
            {
                every: FAST_SYNC_INTERVAL_MS
            },
            {
                name: "sync-all-users",
                data: { isFastSync: true }
            }
        );

        console.log(`Sync Scheduler Started: reconciliation every ${RECONCILIATION_INTERVAL_MS / 60000}m, fast sync every ${FAST_SYNC_INTERVAL_MS / 60000}m`);
    } catch (err) {
        console.error("Failed to start sync scheduler:", err);
    }
};

startSyncScheduler();

module.exports = { startSyncScheduler, FAST_SYNC_INTERVAL_MS, RECONCILIATION_INTERVAL_MS };