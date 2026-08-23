const pool = require("../config/db");
const aiClient = require("./aiClient.service");
const locationService = require("./location.service");
const clusteringService = require("./clustering.service");
const verificationService = require("./verification.service");
const geospatialService = require("./geospatial.service");
const socketService = require("./socket.service");
const logger = require("../utils/logger");

/**
 * Runs the full pipeline for a single report:
 * normalize (Layer -1, common schema) -> classify -> location -> severity
 * (existing AI/ML) -> cluster (Layer 3 correlation: duplicate detection +
 * consolidation) -> verify (evidence/trust fusion) -> geospatial clustering
 * (Layer 5: DBSCAN hotspot/affected-area analysis over all events).
 *
 * This is called by the queue worker (src/queue/worker.js), never directly
 * from an HTTP request handler, so report submission stays fast (Feature 16).
 */
async function processReport(reportId, { locationHint, numericSignals } = {}) {
  const { rows } = await pool.query(
    `SELECT r.*, s.type AS source_type FROM reports r JOIN sources s ON s.id = r.source_id WHERE r.id = $1`,
    [reportId]
  );
  if (rows.length === 0) throw new Error(`Report ${reportId} not found`);
  const report = rows[0];

  socketService.emitReportStatus(reportId, "processing");

  // 0. Normalization (Layer -1): source standardization, timestamp normalization,
  // and structured-category synonym mapping -> produces the "common schema"
  // consumed by the existing AI/ML steps below. Falls back to the report's
  // own raw_text/submitted_at if normalization is ever unreachable, so this
  // step never blocks the rest of the (already-working) pipeline.
  let normalized;
  try {
    normalized = await aiClient.normalize(
      report.raw_text,
      report.source_type,
      report.submitted_at.toISOString(),
      null
    );
  } catch (err) {
    logger.warn(`Normalization step failed for report ${reportId}, continuing with raw values:`, err.message);
    normalized = { cleaned_text: report.raw_text, standardized_source: null, normalized_category: null };
  }
  const textForProcessing = normalized.cleaned_text || report.raw_text;

  // 1. Classification (existing AI/ML, unchanged) — a confident structured
  // category from normalization short-circuits the free-text classifier.
  const category =
    normalized.normalized_category || (await aiClient.classify(textForProcessing)).primary_category;

  // 2. Location extraction / geocoding
  const locResult = await aiClient.location(textForProcessing, locationHint);
  const location = await locationService.upsertLocation(locResult);

  // 3. Severity detection
  const wind = numericSignals?.windSpeedKmh ?? null;
  const rain = numericSignals?.rainfallMm ?? null;
  const sevResult = await aiClient.severity(textForProcessing, category, wind, rain);

  // Persist AI outputs onto the report row.
  await pool.query(
    `UPDATE reports SET category_guess = $1, severity_guess = $2, location_id = $3, status = 'processed',
            standardized_source = $4
     WHERE id = $5`,
    [category, sevResult.severity, location.id, normalized.standardized_source, reportId]
  );

  // 4. Duplicate detection & event clustering (Features 10-11)
  const clusterResult = await clusteringService.clusterReport({
    reportId,
    rawText: textForProcessing,
    category,
    severity: sevResult.severity,
    submittedAt: report.submitted_at.toISOString(),
    location,
  });

  // 5. Cross-source verification & confidence scoring (Features 12-13)
  await verificationService.runVerification(clusterResult.eventId);

  // 6. Geospatial analysis (Layer 5): recompute DBSCAN clusters/hotspots/
  // affected area over all events via PostGIS, then re-broadcast the
  // affected event so the dashboard reflects cluster_id/is_hotspot live.
  try {
    await geospatialService.recomputeClusters();
  } catch (err) {
    logger.warn(`Geospatial clustering failed (non-fatal):`, err.message);
  }

  socketService.emitReportStatus(reportId, "processed");

  logger.info(
    `Processed report ${reportId} -> event ${clusterResult.eventId} ` +
      `(${clusterResult.wasMerged ? "merged, sim=" + clusterResult.similarity : "new event"})`
  );

  return clusterResult;
}

module.exports = { processReport };
