const express = require('express');
// Node executes require('./config/db') before you call:
// dotenv.config();
// So when db.js does:
// password: process.env.POSTGRES_PASSWORD
// the environment variable hasn't been loaded yet.
const dotenv = require('dotenv')
dotenv.config();

const { connectDB, pool } = require('./config/db')
const cors = require('cors');
const authRoutes = require('./routes/authRoutes')
const platformRoutes = require('./routes/platformRoutes')
const productivityRoutes = require("./routes/productivityRoutes");
const dsaRoutes = require("./routes/dsaRoutes");
const githubRoutes = require("./routes/githubRoutes");
const leetcodeRoutes = require("./routes/leetcodeRoutes");

// Creating the Sever
const app = express();

// Port 
const PORT = process.env.PORT || 3000;

// Middleware to connect to MongoDB and PostgreSQL
connectDB();

// SELECT NOW() is a PostgreSQL function that returns the current date and time.
pool.query("SELECT NOW()", (err, result) => {
    if (err) {
        console.error("PostgreSQL connection failed:", err);
    } else {
        console.log("PostgreSQL connected:", result.rows[0]);
    }
});

// Middleware to parse JSON bodies
app.use(express.json())

// CORS Configuration
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
    res.status(200).json({
        message: "Server Running Smoothly"
    })
})

// Router file
app.use("/auth", authRoutes)
app.use("/platform", platformRoutes)
app.use("/productivity", productivityRoutes);
app.use("/dsa", dsaRoutes);
app.use("/github", githubRoutes);
app.use("/leetcode", leetcodeRoutes);

app.listen(PORT, () => {
    console.log(`Server is Running at port no ${PORT}`)
})

module.exports = app;