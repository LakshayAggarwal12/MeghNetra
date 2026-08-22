require("dotenv").config();

const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8000",
  INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || "change-me-shared-secret",
  JWT_SECRET: process.env.JWT_SECRET || "change-me-jwt-secret",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  WEATHER_POLL_INTERVAL_SECONDS: parseInt(process.env.WEATHER_POLL_INTERVAL_SECONDS || "45", 10),
};

if (!env.DATABASE_URL) {
  console.error("FATAL: DATABASE_URL is not set. Copy .env.example to .env and configure it.");
  process.exit(1);
}

module.exports = env;
