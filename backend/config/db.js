const mongoose = require('mongoose');

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("DB CONNECTED")
    } catch (e) {
        console.log("Something went wrong :", e)
    }
}


module.exports = connectDB;