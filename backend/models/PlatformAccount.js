const mongoose = require('mongoose');

const PlatformAccountSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    platform: {
        type: String,
        required: true
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

module.exports = mongoose.model("PlatformAccount", PlatformAccountSchema);