const express = require("express");
const { getSummary, getTrends } = require("../controllers/analytics.controller");

const router = express.Router();

router.get("/summary", getSummary);
router.get("/trends", getTrends);

module.exports = router;
