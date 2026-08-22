const axios = require("axios");
const env = require("../config/env");
const logger = require("../utils/logger");

const client = axios.create({
  baseURL: env.AI_SERVICE_URL,
  timeout: 5000,
  headers: { "x-internal-key": env.INTERNAL_API_KEY },
});

async function post(path, body) {
  try {
    const { data } = await client.post(path, body);
    return data;
  } catch (err) {
    if (err.response) {
      logger.error(`AI service ${path} returned ${err.response.status}:`, err.response.data);
      const e = new Error(`AI service error on ${path}: ${JSON.stringify(err.response.data)}`);
      e.status = 502;
      e.retryable = err.response.status >= 500;
      throw e;
    }
    logger.error(`AI service ${path} unreachable:`, err.message);
    const e = new Error(`AI service unreachable: ${path}`);
    e.status = 503;
    e.retryable = true;
    throw e;
  }
}

module.exports = {
  classify: (text) => post("/classify", { text }),
  severity: (text, category, wind_speed_kmh, rainfall_mm) =>
    post("/severity", { text, category, wind_speed_kmh, rainfall_mm }),
  location: (text, location_hint) => post("/location", { text, location_hint }),
  similarityBatch: (payload) => post("/similarity/batch", payload),
  verificationScore: (payload) => post("/verification/score", payload),
};
