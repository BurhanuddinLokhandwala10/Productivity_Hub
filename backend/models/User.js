const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})
module.exports = mongoose.model("User", userSchema);
// Ye Mongoose ko bolta hai: "Mere userSchema (jo fields tumne define kiye — username, email, password) se ek model bana do, aur is model ka naam "User" rakho"
