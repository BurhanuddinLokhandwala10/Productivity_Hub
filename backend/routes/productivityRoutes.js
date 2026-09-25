const express = require("express");
const {getProductivitySummaryController} = require("../controllers/productivityController");
const Middleware = require('../middlewares/authMiddlewares');

const router = express.Router();

router.get("/summary",Middleware,getProductivitySummaryController);

module.exports = router;