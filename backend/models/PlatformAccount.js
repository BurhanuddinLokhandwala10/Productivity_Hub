const mongoose = require('mongoose');

const PlatformAccountSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    platform: {
        type: String,
        required: true,
        set: (v) => (typeof v === 'string' ? v.toLowerCase().trim() : v)
    },
    username: {
        type: String,
        required: true
    },
    lastSyncedAt: {
        type: Date,
        default: null
    },
    syncStatus: {
        type: String,
        enum: ['IDLE', 'SYNCING', 'SUCCESS', 'ERROR'],
        default: 'IDLE'
    },
    lastSyncError: {
        type: String,
        default: null
    }
}, { timestamps: true });

// Prevent duplicate platform accounts per user
PlatformAccountSchema.index({ userId: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model("PlatformAccount", PlatformAccountSchema);