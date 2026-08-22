const pool = require("../config/db");
const aiClient = require("./aiClient.service");
const socketService = require("./socket.service");
const logger = require("../utils/logger");

const CROSS_SOURCE_SCORE = { 1: 0.35, 2: 0.7, 3: 1.0 };

/**
 * Gathers the five evidence factors for an event from the reports linked to
 * it, sends them to the AI service for the transparent weighted-fusion
 * confidence score, and persists the result.
 *
 * Simplification note (2-day prototype scope): location_consistency and
 * temporal_consistency both reuse the average fused similarity_score
 * recorded at clustering time (which itself blends geo + time + text +
 * category). This is a documented, defensible approximation rather than
 * recomputing geo/time distance separately at verification time.
 */
async function runVerification(eventId) {
  const linkedReports = await pool.query(
    `SELECT r.id, r.raw_text, r.category_guess, er.similarity_score,
            s.id AS source_id, s.type AS source_type, s.reliability_score
     FROM event_reports er
     JOIN reports r ON r.id = er.report_id
     JOIN sources s ON s.id = r.source_id
     WHERE er.event_id = $1`,
    [eventId]
  );

  const event = await pool.query(`SELECT category FROM weather_events WHERE id = $1`, [eventId]);
  if (event.rows.length === 0) throw new Error(`Event ${eventId} not found`);
  const eventCategory = event.rows[0].category;

  const reports = linkedReports.rows;

  // --- source_reliability: average reliability of contributing sources
  const avgReliability =
    reports.reduce((sum, r) => sum + parseFloat(r.reliability_score), 0) / reports.length;

  // --- cross_source_agreement: distinct source types contributing evidence
  const distinctTypes = new Set(reports.map((r) => r.source_type));
  const crossSourceScore = CROSS_SOURCE_SCORE[Math.min(distinctTypes.size, 3)] || 0.35;

  // --- weather_observation_agreement: does a weather-API report exist, and does it agree?
  const weatherApiReports = reports.filter((r) => r.source_type === "weather_api");
  let weatherObservationAgreement = 0.5; // neutral: no weather-API evidence either way
  let contradictionFlag = false;
  if (weatherApiReports.length > 0) {
    const agrees = weatherApiReports.some((r) => r.category_guess === eventCategory);
    if (agrees) {
      weatherObservationAgreement = 0.95;
    } else {
      weatherObservationAgreement = 0.1;
      contradictionFlag = true;
    }
  }

  // --- location_consistency / temporal_consistency: proxy via avg clustering similarity
  const similarityScores = reports.map((r) => parseFloat(r.similarity_score)).filter((s) => !isNaN(s));
  const avgSimilarity =
    similarityScores.length > 0
      ? similarityScores.reduce((a, b) => a + b, 0) / similarityScores.length
      : 0.5;

  const scoreResult = await aiClient.verificationScore({
    source_reliability: avgReliability,
    cross_source_agreement: crossSourceScore,
    weather_observation_agreement: weatherObservationAgreement,
    location_consistency: avgSimilarity,
    temporal_consistency: avgSimilarity,
    contradiction_flag: contradictionFlag,
  });

  await pool.query(
    `INSERT INTO verification_results (event_id, status, confidence_score, factor_scores)
     VALUES ($1, $2, $3, $4)`,
    [eventId, scoreResult.status, scoreResult.confidence_score, JSON.stringify(scoreResult.factor_breakdown)]
  );

  await pool.query(
    `UPDATE weather_events SET status = $1, confidence_score = $2 WHERE id = $3`,
    [scoreResult.status, scoreResult.confidence_score, eventId]
  );

  // Evidence line items for the admin/detail evidence panel.
  await pool.query(`DELETE FROM evidence WHERE event_id = $1`, [eventId]); // recompute fresh each time
  const evidenceRows = [];
  for (const type of distinctTypes) {
    const sample = reports.find((r) => r.source_type === type);
    const label =
      type === "weather_api"
        ? "Weather observation agreement"
        : type === "citizen"
        ? "Independent citizen reports"
        : "News report corroboration";
    evidenceRows.push([eventId, type, sample.source_id, label]);
  }
  for (const [eid, etype, sid, desc] of evidenceRows) {
    await pool.query(
      `INSERT INTO evidence (event_id, evidence_type, source_id, description) VALUES ($1,$2,$3,$4)`,
      [eid, etype, sid, desc]
    );
  }

  const fullEvent = await pool.query(
    `SELECT e.*, l.city, l.state, ST_Y(l.geom::geometry) AS lat, ST_X(l.geom::geometry) AS lng
     FROM weather_events e JOIN locations l ON l.id = e.location_id
     WHERE e.id = $1`,
    [eventId]
  );

  socketService.emitEventUpdate(fullEvent.rows[0]);
  logger.info(`Verification complete for event ${eventId}: ${scoreResult.status} (${scoreResult.confidence_score}%)`);

  return scoreResult;
}

module.exports = { runVerification };
