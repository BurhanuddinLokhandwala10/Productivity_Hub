const mongoose = require('mongoose');
const { Pool } = require("pg");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB CONNECTED");
    } catch (e) {
        console.error("MongoDB connection failed:", e.message);
        throw e;
    }
}

const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
        }
        : {
            user: "postgres",
            host: "localhost",
            database: "Dev_Productivity_Hub",
            password: process.env.POSTGRES_PASSWORD,
            port: 5432,
        }
);

pool.on("connect", () => {
    console.log("PostgreSQL connected");
});

pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err);
});

module.exports = { connectDB, pool };