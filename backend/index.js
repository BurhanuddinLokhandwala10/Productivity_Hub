const express = require('express');
const connectDB = require('./config/db')
const dotenv = require('dotenv')
const cors = require('cors');
const authRoutes = require('./routes/authRoutes')
const platformRoutes = require('./routes/platformRoutes')

// Creating the Sever
const app = express();

dotenv.config();

// Port 
const PORT = process.env.PORT || 3000;

// Middleware to connect to MongoDB
connectDB();

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
app.use("/api/auth", authRoutes)
app.use("/api/platform", platformRoutes)

app.listen(PORT, () => {
    console.log(`Server is Running at port no ${PORT}`)
})

module.exports = app;