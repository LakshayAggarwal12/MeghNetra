const pool = require("../config/db");
const { asyncHandler } = require("../middleware/error.middleware");

const getSummary = asyncHandler(async (req, res) => {
  const totalActive = await pool.query(`SELECT COUNT(*) FROM weather_events`);

  const byCategory = await pool.query(
    `SELECT category, COUNT(*) AS count FROM weather_events GROUP BY category ORDER BY count DESC`
  );

  const byStatus = await pool.query(
    `SELECT status, COUNT(*) AS count FROM weather_events GROUP BY status ORDER BY count DESC`
  );

  const bySeverity = await pool.query(
    `SELECT severity, COUNT(*) AS count FROM weather_events GROUP BY severity ORDER BY count DESC`
  );

  res.json({
    totalActive: parseInt(totalActive.rows[0].count, 10),
    byCategory: Object.fromEntries(byCategory.rows.map((r) => [r.category, parseInt(r.count, 10)])),
    byStatus: Object.fromEntries(byStatus.rows.map((r) => [r.status, parseInt(r.count, 10)])),
    bySeverity: Object.fromEntries(bySeverity.rows.map((r) => [r.severity, parseInt(r.count, 10)])),
  });
});

const getTrends = asyncHandler(async (req, res) => {
  const hours = parseInt(req.query.hours || "168", 10); // default 7 days
  const { rows } = await pool.query(
    `SELECT date_trunc('hour', first_seen_at) AS bucket, category, COUNT(*) AS count
     FROM weather_events
     WHERE first_seen_at > now() - ($1 || ' hours')::interval
     GROUP BY bucket, category
     ORDER BY bucket ASC`,
    [hours]
  );

  // Reshape into Recharts-friendly rows: [{time, rainfall: 3, flooding: 1, ...}]
  const byBucket = {};
  for (const row of rows) {
    const key = row.bucket.toISOString();
    if (!byBucket[key]) byBucket[key] = { time: key };
    byBucket[key][row.category] = parseInt(row.count, 10);
  }

  res.json({ trends: Object.values(byBucket) });
});

module.exports = { getSummary, getTrends };
