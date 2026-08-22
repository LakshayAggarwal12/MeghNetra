const pool = require("../config/db");
const aiClient = require("./aiClient.service");
const locationService = require("./location.service");
const clusteringService = require("./clustering.service");
const verificationService = require("./verification.service");
const socketService = require("./socket.service");
const logger = require("../utils/logger");

/**
 * Runs the full AI pipeline for a single report:
 * classify -> location -> severity -> cluster (duplicate detection +
 * consolidation) -> verification (evidence fusion + confidence score).
 *
 * This is called by the queue worker (src/queue/worker.js), never directly
 * from an HTTP request handler, so report submission stays fast (Feature 16).
 */
async function processReport(reportId, { locationHint, numericSignals } = {}) {
  const { rows } = await pool.query(`SELECT * FROM reports WHERE id = $1`, [reportId]);
  if (rows.length === 0) throw new Error(`Report ${reportId} not found`);
  const report = rows[0];

  socketService.emitReportStatus(reportId, "processing");

  // 1. Classification
  const classifyResult = await aiClient.classify(report.raw_text);
  const category = classifyResult.primary_category;

  // 2. Location extraction / geocoding
  const locResult = await aiClient.location(report.raw_text, locationHint);
  const location = await locationService.upsertLocation(locResult);

  // 3. Severity detection
  const wind = numericSignals?.windSpeedKmh ?? null;
  const rain = numericSignals?.rainfallMm ?? null;
  const sevResult = await aiClient.severity(report.raw_text, category, wind, rain);

  // Persist AI outputs onto the report row.
  await pool.query(
    `UPDATE reports SET category_guess = $1, severity_guess = $2, location_id = $3, status = 'processed'
     WHERE id = $4`,
    [category, sevResult.severity, location.id, reportId]
  );

  // 4. Duplicate detection & event clustering (Features 10-11)
  const clusterResult = await clusteringService.clusterReport({
    reportId,
    rawText: report.raw_text,
    category,
    severity: sevResult.severity,
    submittedAt: report.submitted_at.toISOString(),
    location,
  });

  // 5. Cross-source verification & confidence scoring (Features 12-13)
  await verificationService.runVerification(clusterResult.eventId);

  socketService.emitReportStatus(reportId, "processed");

  logger.info(
    `Processed report ${reportId} -> event ${clusterResult.eventId} ` +
      `(${clusterResult.wasMerged ? "merged, sim=" + clusterResult.similarity : "new event"})`
  );

  return clusterResult;
}

module.exports = { processReport };
