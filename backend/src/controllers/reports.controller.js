const pool = require("../config/db");
const { citizenAdapter } = require("../ingestion/adapters/citizenAdapter");
const { enqueueReport } = require("../services/enqueue.service");
const { asyncHandler } = require("../middleware/error.middleware");

const submitReport = asyncHandler(async (req, res) => {
  const canonical = citizenAdapter(req.body);
  const reportId = await enqueueReport(canonical);
  res.status(202).json({ reportId, status: "pending", message: "Report received and queued for processing" });
});

const getReport = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.*, s.name AS source_name, s.type AS source_type
     FROM reports r JOIN sources s ON s.id = r.source_id
     WHERE r.id = $1`,
    [req.params.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Report not found" } });
  }
  res.json(rows[0]);
});

module.exports = { submitReport, getReport };
