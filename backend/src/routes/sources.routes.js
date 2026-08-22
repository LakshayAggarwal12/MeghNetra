const express = require("express");
const pool = require("../config/db");
const { asyncHandler } = require("../middleware/error.middleware");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(`SELECT id, name, type, reliability_score, config FROM sources ORDER BY name`);
    res.json({ sources: rows });
  })
);

module.exports = router;
