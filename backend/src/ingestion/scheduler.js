const env = require("../config/env");
const { pollWeatherApi } = require("./weatherApi.connector");
const logger = require("../utils/logger");

function startSchedulers() {
  const seconds = env.WEATHER_POLL_INTERVAL_SECONDS;
  // A plain interval is used (rather than a cron expression) since we want
  // "every N seconds" at demo-friendly sub-minute granularity.
  setInterval(() => {
    pollWeatherApi().catch((err) => logger.error("Weather API poll cycle failed:", err.message));
  }, seconds * 1000);

  logger.info(`Weather API connector scheduled every ${seconds}s`);

  // Run one cycle immediately on startup so the demo has activity right away.
  pollWeatherApi().catch((err) => logger.error("Initial weather API poll failed:", err.message));
}

module.exports = { startSchedulers };
