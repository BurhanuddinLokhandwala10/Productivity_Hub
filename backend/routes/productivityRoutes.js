const express = require("express");
const { getProductivitySummaryController } = require("../controllers/productivityController");
const Middleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get("/summary", Middleware, getProductivitySummaryController);

module.exports = router;