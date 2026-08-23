const env = require("../config/env");
const { pollWeatherApi } = require("./weatherApi.connector");
const { pollAllFeeds } = require("./rss.connector");
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

  // RSS/news ingestion — only starts if at least one feed URL is configured.
  if (env.RSS_FEED_URLS.length > 0) {
    const rssSeconds = env.RSS_POLL_INTERVAL_SECONDS;
    setInterval(() => {
      pollAllFeeds(env.RSS_FEED_URLS).catch((err) => logger.error("RSS poll cycle failed:", err.message));
    }, rssSeconds * 1000);

    logger.info(`RSS connector scheduled every ${rssSeconds}s for ${env.RSS_FEED_URLS.length} feed(s)`);

    pollAllFeeds(env.RSS_FEED_URLS).catch((err) => logger.error("Initial RSS poll failed:", err.message));
  } else {
    logger.info("RSS connector not started (no RSS_FEED_URLS configured)");
  }
}

module.exports = { startSchedulers };
