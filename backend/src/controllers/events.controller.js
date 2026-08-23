const pool = require("../config/db");
const { asyncHandler } = require("../middleware/error.middleware");

// GET /api/events — combined date/category/state/status filters (Feature 21, trimmed scope).
const listEvents = asyncHandler(async (req, res) => {
  const { from, to, category, state, status, limit = 200 } = req.query;

  const clauses = [];
  const params = [];

  if (from) {
    params.push(from);
    clauses.push(`e.first_seen_at >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    clauses.push(`e.first_seen_at <= $${params.length}`);
  }
  if (category) {
    params.push(category);
    clauses.push(`e.category = $${params.length}`);
  }
  if (state) {
    params.push(state);
    clauses.push(`l.state = $${params.length}`);
  }
  if (status) {
    params.push(status);
    clauses.push(`e.status = $${params.length}`);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  params.push(parseInt(limit, 10));

  const { rows } = await pool.query(
    `SELECT e.id, e.category, e.secondary_categories, e.severity, e.status, e.confidence_score,
            e.cluster_id, e.is_hotspot, e.affected_area_km2,
            e.first_seen_at, e.last_updated_at,
            l.city, l.state, l.locality, ST_Y(l.geom::geometry) AS lat, ST_X(l.geom::geometry) AS lng,
            (SELECT COUNT(*) FROM event_reports er WHERE er.event_id = e.id) AS report_count,
            (SELECT COUNT(DISTINCT r.source_id) FROM event_reports er JOIN reports r ON r.id = er.report_id WHERE er.event_id = e.id) AS source_count
     FROM weather_events e
     JOIN locations l ON l.id = e.location_id
     ${where}
     ORDER BY e.last_updated_at DESC
     LIMIT $${params.length}`,
    params
  );

  res.json({ events: rows, count: rows.length });
});

// GET /api/events/:id — full detail with evidence + linked reports (Feature 22).
const getEventDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const eventResult = await pool.query(
    `SELECT e.*, l.city, l.state, l.locality, ST_Y(l.geom::geometry) AS lat, ST_X(l.geom::geometry) AS lng
     FROM weather_events e JOIN locations l ON l.id = e.location_id
     WHERE e.id = $1`,
    [id]
  );
  if (eventResult.rows.length === 0) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "Event not found" } });
  }

  const verification = await pool.query(
    `SELECT * FROM verification_results WHERE event_id = $1 ORDER BY computed_at DESC LIMIT 1`,
    [id]
  );

  const evidence = await pool.query(`SELECT * FROM evidence WHERE event_id = $1 ORDER BY created_at`, [id]);

  const linkedReports = await pool.query(
    `SELECT r.id, r.raw_text, r.submitted_at, r.category_guess, r.severity_guess,
            s.name AS source_name, s.type AS source_type, er.similarity_score
     FROM event_reports er
     JOIN reports r ON r.id = er.report_id
     JOIN sources s ON s.id = r.source_id
     WHERE er.event_id = $1
     ORDER BY r.submitted_at DESC`,
    [id]
  );

  res.json({
    event: eventResult.rows[0],
    verification: verification.rows[0] || null,
    evidence: evidence.rows,
    reports: linkedReports.rows,
  });
});

// GET /api/events/meta/states — distinct states for the filter dropdown.
const listStates = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT state FROM locations WHERE state IS NOT NULL ORDER BY state`
  );
  res.json({ states: rows.map((r) => r.state) });
});

// GET /api/events/meta/hotspots — Layer 5 output: clusters flagged as hotspots,
// with centroid + affected area, for map overlay rendering.
const listHotspots = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.cluster_id,
            COUNT(*) AS event_count,
            MAX(e.affected_area_km2) AS affected_area_km2,
            AVG(ST_Y(l.geom::geometry)) AS centroid_lat,
            AVG(ST_X(l.geom::geometry)) AS centroid_lng
     FROM weather_events e
     JOIN locations l ON l.id = e.location_id
     WHERE e.is_hotspot = true
     GROUP BY e.cluster_id
     ORDER BY event_count DESC`
  );
  res.json({ hotspots: rows });
});

module.exports = { listEvents, getEventDetail, listStates, listHotspots };
