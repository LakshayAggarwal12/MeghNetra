const { fetchCityOnDemand } = require("../ingestion/weatherApi.connector");
const { searchFeedsForCity } = require("../ingestion/rss.connector");
const { rssAdapter } = require("../ingestion/adapters/rssAdapter");
const { enqueueReport } = require("../services/enqueue.service");
const env = require("../config/env");
const { asyncHandler } = require("../middleware/error.middleware");
const logger = require("../utils/logger");

/**
 * POST /api/search/city  { city: "Noida" }
 *
 * On-demand lookup for a user-specified city, per the request to "enter a
 * city name myself and get all the information about that city available
 * on RSS and weather API". This does two things:
 *   1. Fetches current weather-API conditions for the city right now
 *      (bypassing the scheduled poll's cooldown — see weatherApi.connector.js)
 *   2. Searches the configured RSS feeds for any items mentioning the city
 * Both results are enqueued through the exact same pipeline as every other
 * source (normalize -> classify -> location -> severity -> cluster ->
 * verify -> geospatial), so they appear on the dashboard/map like any other
 * event once processed — this endpoint just returns an immediate summary
 * of what was found and queued, not the final processed event itself.
 */
const searchCity = asyncHandler(async (req, res) => {
  const { city } = req.body;
  if (!city || typeof city !== "string" || city.trim().length < 2) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "A city name is required" } });
  }
  const cityName = city.trim();

  const result = {
    city: cityName,
    weather: null,
    weatherError: null,
    newsItemsFound: 0,
    newsItemsQueued: 0,
    reportIds: [],
  };

  // 1. Weather API (bypasses cooldown intentionally — explicit user request).
  try {
    const weatherResult = await fetchCityOnDemand(cityName);
    result.weather = {
      mode: weatherResult.mode,
      summary: weatherResult.sentence || null,
    };
    if (weatherResult.reportId) result.reportIds.push(weatherResult.reportId);
  } catch (err) {
    logger.error(`City search: weather lookup failed for "${cityName}":`, err.message);
    result.weatherError = "Weather lookup failed — see server logs for details.";
  }

  // 2. RSS feeds (only if at least one feed is configured).
  if (env.RSS_FEED_URLS.length > 0) {
    try {
      const matches = await searchFeedsForCity(cityName, env.RSS_FEED_URLS);
      result.newsItemsFound = matches.length;

      for (const item of matches) {
        try {
          const canonical = rssAdapter(item);
          const reportId = await enqueueReport(canonical);
          result.reportIds.push(reportId);
          result.newsItemsQueued += 1;
        } catch (err) {
          logger.error(`City search: failed to enqueue news item for "${cityName}":`, err.message);
        }
      }
    } catch (err) {
      logger.error(`City search: RSS search failed for "${cityName}":`, err.message);
    }
  }

  res.status(202).json({
    ...result,
    message:
      "Lookup complete. Results are queued for AI processing and will appear on the dashboard within a few seconds.",
  });
});

module.exports = { searchCity };
