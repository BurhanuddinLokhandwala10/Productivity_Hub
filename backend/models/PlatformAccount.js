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
    }

}, { timestamps: true });

module.exports = mongoose.model("PlatformAccount", PlatformAccountSchema);