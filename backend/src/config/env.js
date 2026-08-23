require("dotenv").config();
const fs = require("fs");

/**
 * OpenWeatherMap keys are usually a plain string, but some people keep the
 * key saved as a small JSON file (e.g. {"api_key": "..."} from their signup
 * email/download). If WEATHER_API_KEY_FILE is set, read the key from there
 * instead of requiring it to be pasted directly into .env.
 * Accepts either {"api_key": "..."} or {"key": "..."} shapes.
 */
function loadWeatherApiKey() {
  if (process.env.WEATHER_API_KEY) return process.env.WEATHER_API_KEY;

  const keyFile = process.env.WEATHER_API_KEY_FILE;
  if (keyFile && fs.existsSync(keyFile)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(keyFile, "utf-8"));
      return parsed.api_key || parsed.key || parsed.apiKey || "";
    } catch (err) {
      console.error(`FATAL: could not parse WEATHER_API_KEY_FILE (${keyFile}):`, err.message);
      process.exit(1);
    }
  }
  return "";
}

const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8000",
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || "change-me-shared-secret",
  JWT_SECRET: process.env.JWT_SECRET || "change-me-jwt-secret",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  WEATHER_POLL_INTERVAL_SECONDS: parseInt(process.env.WEATHER_POLL_INTERVAL_SECONDS || "45", 10),
  // Layer 3 — Correlation: configurable time-correlation window (hours).
  CORRELATION_TIME_WINDOW_HOURS: parseFloat(process.env.CORRELATION_TIME_WINDOW_HOURS || "12"),
  // Layer 5 — Geospatial analysis: DBSCAN clustering + hotspot thresholds.
  GEO_CLUSTER_EPS_KM: parseFloat(process.env.GEO_CLUSTER_EPS_KM || "50"),
  GEO_CLUSTER_MIN_POINTS: parseInt(process.env.GEO_CLUSTER_MIN_POINTS || "2", 10),
  GEO_HOTSPOT_MIN_EVENTS: parseInt(process.env.GEO_HOTSPOT_MIN_EVENTS || "3", 10),
  // RSS/news ingestion: comma-separated feed URLs; empty = disabled.
  RSS_FEED_URLS: (process.env.RSS_FEED_URLS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  RSS_POLL_INTERVAL_SECONDS: parseInt(process.env.RSS_POLL_INTERVAL_SECONDS || "300", 10),
  // Minimum minutes between scheduled re-fetches of the SAME city, to stop
  // near-duplicate reports/events piling up from repeated polling.
  WEATHER_CITY_COOLDOWN_MINUTES: parseInt(process.env.WEATHER_CITY_COOLDOWN_MINUTES || "30", 10),
  // Real weather API (OpenWeatherMap). Empty key = simulated data is used instead.
  WEATHER_API_KEY: loadWeatherApiKey(),
  WEATHER_API_PROVIDER: process.env.WEATHER_API_PROVIDER || "simulated",
};

if (!env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is not set. Copy .env.example to .env and configure it.");
  process.exit(1);
}

module.exports = env;
