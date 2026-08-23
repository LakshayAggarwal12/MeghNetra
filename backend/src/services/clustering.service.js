const pool = require("../config/db");
const aiClient = require("./aiClient.service");
const env = require("../config/env");

// Layer 3 — Correlation: time-correlation window is configurable via
// CORRELATION_TIME_WINDOW_HOURS (see backend/.env.example) rather than
// hardcoded, per the "make the threshold configurable" requirement.
const TIME_WINDOW_HOURS = env.CORRELATION_TIME_WINDOW_HOURS;
const SIMILARITY_THRESHOLD = 0.6;
const SEVERITY_RANK = { low: 1, moderate: 2, high: 3, severe: 4 };

/**
 * Fetches candidate events from the last TIME_WINDOW_HOURS, each represented
 * by its most recently linked report's text, for similarity comparison.
 */
// referenceTime anchors the window to the new report's own timestamp rather
// than the real wall-clock — this makes clustering behave correctly both
// live (referenceTime ~= now) and when seeding backdated historical demo
// data (Feature 27), where "now" and the data's own era are different.
async function getCandidateEvents(referenceTime) {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (e.id)
        e.id, e.category, e.severity, e.status,
        l.lat AS lat, l.lng AS lng,
        r.raw_text AS text, r.submitted_at
     FROM weather_events e
     JOIN (SELECT id, city, state, ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lng FROM locations) l
       ON l.id = e.location_id
     JOIN event_reports er ON er.event_id = e.id
     JOIN reports r ON r.id = er.report_id
     WHERE e.last_updated_at > $2::timestamptz - ($1 || ' hours')::interval
       AND e.last_updated_at <= $2::timestamptz
     ORDER BY e.id, r.submitted_at DESC`,
    [TIME_WINDOW_HOURS, referenceTime]
  );
  return rows;
}

/**
 * Consolidates a newly processed report into an existing event (if a strong
 * duplicate match is found) or creates a new weather_events row.
 * Returns the affected event's id.
 */
async function clusterReport({ reportId, rawText, category, severity, submittedAt, location }) {
  const candidates = await getCandidateEvents(submittedAt);

  let matchedEventId = null;
  let matchedSimilarity = null;

  if (candidates.length > 0) {
    const { results } = await aiClient.similarityBatch({
      new_text: rawText,
      new_lat: location.lat,
      new_lng: location.lng,
      new_category: category,
      new_submitted_at: submittedAt,
      time_window_hours: TIME_WINDOW_HOURS,
      candidates: candidates.map((c) => ({
        id: c.id,
        text: c.text,
        lat: c.lat,
        lng: c.lng,
        category: c.category,
        submitted_at: c.submitted_at.toISOString(),
      })),
    });

    const best = results.sort((a, b) => b.fused_score - a.fused_score)[0];
    if (best && best.fused_score >= SIMILARITY_THRESHOLD) {
      matchedEventId = best.candidate_id;
      matchedSimilarity = best.fused_score;
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let eventId;
    if (matchedEventId) {
      eventId = matchedEventId;

      // Bump severity to the max of existing vs. new.
      const { rows } = await client.query("SELECT severity FROM weather_events WHERE id = $1 FOR UPDATE", [eventId]);
      const currentSeverity = rows[0]?.severity || "low";
      const newSeverity =
        SEVERITY_RANK[severity] > SEVERITY_RANK[currentSeverity] ? severity : currentSeverity;

      await client.query(
        `UPDATE weather_events SET severity = $1, last_updated_at = $3 WHERE id = $2`,
        [newSeverity, eventId, submittedAt]
      );

      await client.query(
        `INSERT INTO event_reports (event_id, report_id, similarity_score)
         VALUES ($1, $2, $3)
         ON CONFLICT (event_id, report_id) DO NOTHING`,
        [eventId, reportId, matchedSimilarity]
      );
    } else {
      const { rows } = await client.query(
        `INSERT INTO weather_events (category, severity, status, location_id, first_seen_at, last_updated_at)
         VALUES ($1, $2, 'unverified', $3, $4, $4)
         RETURNING id`,
        [category, severity, location.id, submittedAt]
      );
      eventId = rows[0].id;

      await client.query(
        `INSERT INTO event_reports (event_id, report_id, similarity_score) VALUES ($1, $2, 1.0)`,
        [eventId, reportId]
      );
    }

    await client.query("COMMIT");
    return { eventId, wasMerged: !!matchedEventId, similarity: matchedSimilarity };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { clusterReport, TIME_WINDOW_HOURS, SIMILARITY_THRESHOLD };
