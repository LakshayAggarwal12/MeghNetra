const pool = require("../config/db");
const reportQueue = require("../queue/reportQueue");
const logger = require("../utils/logger");

const SOURCE_IDS = {
  weather_api: "11111111-1111-1111-1111-111111111111",
  citizen: "22222222-2222-2222-2222-222222222222",
  rss: "33333333-3333-3333-3333-333333333333",
};

/**
 * Persists the canonical report row (status='pending') and enqueues a
 * background job to process it through the AI pipeline. The HTTP/connector
 * caller gets an immediate response; processing happens asynchronously.
 */
async function enqueueReport(canonicalReport) {
  const sourceId = SOURCE_IDS[canonicalReport.sourceType];
  if (!sourceId) {
    throw new Error(`Unknown sourceType: ${canonicalReport.sourceType}`);
  }

  const insertResult = await pool.query(
    `INSERT INTO reports (source_id, raw_text, media_refs, submitted_at, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING id`,
    [
      sourceId,
      canonicalReport.rawText,
      JSON.stringify(canonicalReport.mediaRefs || []),
      canonicalReport.submittedAt,
    ]
  );

  const reportId = insertResult.rows[0].id;

  await reportQueue.add(
    "process-report",
    {
      reportId,
      locationHint: canonicalReport.locationHint || null,
      numericSignals: canonicalReport.numericSignals || null,
    },
    {
      attempts: 3,
      backoff: { type: "exponential", delay: 2000 },
      removeOnComplete: 100,
      removeOnFail: 100,
    }
  );

  logger.info(`Enqueued report ${reportId} (source=${canonicalReport.sourceType})`);
  return reportId;
}

module.exports = { enqueueReport, SOURCE_IDS };
