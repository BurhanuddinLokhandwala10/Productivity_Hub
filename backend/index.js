const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const cors = require('cors');

// ── App setup (does NOT start listening yet) ──────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies (preserves rawBody for webhook HMAC verification)
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));

// CORS Configuration
const allowedOrigins = [
    "http://localhost:5173",
    "https://productivity-hub-bay.vercel.app"
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Health endpoint (always available, even before DBs are ready)
app.get('/', (req, res) => {
    res.status(200).json({
        message: "Server Running Smoothly"
    });
});

// ── Routes (loaded eagerly, but DB queries only run on request) ──
const authRoutes = require('./routes/authRoutes');
const platformRoutes = require('./routes/platformRoutes');
const productivityRoutes = require("./routes/productivityRoutes");
const dsaRoutes = require("./routes/dsaRoutes");
const githubRoutes = require("./routes/githubRoutes");
const leetcodeRoutes = require("./routes/leetcodeRoutes");
const aiAnalystRoutes = require("./routes/aiAnalystRoutes");

app.use("/auth", authRoutes);
app.use("/platform", platformRoutes);
app.use("/productivity", productivityRoutes);
app.use("/dsa", dsaRoutes);
app.use("/github", githubRoutes);
app.use("/leetcode", leetcodeRoutes);
app.use("/ai", aiAnalystRoutes);

// ── Controlled async bootstrap ───────────────────────────────────
async function bootstrap() {
    // 1. Connect MongoDB first (auth depends on it)
    const { connectDB, pool } = require('./config/db');
    try {
        await connectDB();
    } catch (err) {
        console.error("FATAL: MongoDB connection failed. Server will start but auth will not work.");
        console.error("MongoDB error:", err.message);
        // Continue — the server can still serve health checks and
        // PostgreSQL-only endpoints. Auth endpoints will return errors.
    }

    // 2. Initialize PostgreSQL schema (create tables if missing)
    const { initializeSchema } = require('./config/schema');
    try {
        await initializeSchema(pool);
        console.log("PostgreSQL schema initialized successfully");
    } catch (err) {
        console.error("PostgreSQL schema initialization failed:", err.message);
        // Continue — tables may already exist from a prior migration
    }

    // 3. Verify PostgreSQL connectivity
    try {
        const result = await pool.query("SELECT NOW()");
        console.log("PostgreSQL connected:", result.rows[0]);
    } catch (err) {
        console.error("PostgreSQL connection failed:", err.message);
    }

    // 4. Initialize Redis, Worker, and Scheduler AFTER databases are ready
    try {
        require("./config/redis");
        require("./workers/syncWorker");
        const { startSyncScheduler } = require("./queues/syncScheduler");
        // startSyncScheduler is already called at module load via the require,
        // so we don't need to call it again. It's idempotent via upsertJobScheduler.
        console.log("Redis, Worker, and Scheduler modules loaded");
    } catch (err) {
        console.error("Failed to initialize background services:", err.message);
        // Continue — the main HTTP API can still function
    }

    // 5. Start listening
    const server = app.listen(PORT, () => {
        console.log(`Server is Running at port no ${PORT}`);
    });

    // ── Graceful shutdown ─────────────────────────────────────────
    const shutdown = async (signal) => {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            try {
                const mongoose = require('mongoose');
                await mongoose.connection.close();
                console.log("MongoDB disconnected");
            } catch (e) { /* ignore */ }

            try {
                await pool.end();
                console.log("PostgreSQL pool closed");
            } catch (e) { /* ignore */ }

            try {
                const redis = require('./config/redis');
                await redis.quit();
                console.log("Redis disconnected");
            } catch (e) { /* ignore */ }

            process.exit(0);
        });

        // Force exit after 10 seconds if graceful shutdown hangs
        setTimeout(() => {
            console.error("Forced shutdown after timeout");
            process.exit(1);
        }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch(err => {
    console.error("Bootstrap failed:", err);
    process.exit(1);
});

module.exports = app;