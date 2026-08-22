const { Worker } = require("bullmq");
const connection = require("../config/redis");
const pool = require("../config/db");
const { processReport } = require("../services/pipeline.service");
const logger = require("../utils/logger");

const worker = new Worker(
  "report-processing",
  async (job) => {
    const { reportId, locationHint, numericSignals } = job.data;
    try {
      return await processReport(reportId, { locationHint, numericSignals });
    } catch (err) {
      logger.error(`Failed processing report ${reportId} (attempt ${job.attemptsMade}):`, err.message);
      // Only mark as permanently failed after BullMQ's retries are exhausted.
      if (job.attemptsMade >= job.opts.attempts) {
        await pool.query(`UPDATE reports SET status = 'failed', error_message = $1 WHERE id = $2`, [
          err.message,
          reportId,
        ]);
      }
      throw err; // let BullMQ handle retry/backoff
    }
  },
  { connection, concurrency: 4 }
);

worker.on("completed", (job) => {
  logger.info(`Job ${job.id} (report ${job.data.reportId}) completed`);
});

worker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} (report ${job?.data?.reportId}) failed permanently:`, err.message);
});

logger.info("MEGHNETRA queue worker started, listening for report-processing jobs...");

module.exports = worker;
