const { weatherApiAdapter } = require("./adapters/weatherApiAdapter");
const { enqueueReport } = require("../services/enqueue.service");
const logger = require("../utils/logger");

/**
 * NOTE ON SIMULATION: This connector simulates a weather-API feed rather
 * than calling a real external API (OpenWeatherMap/IMD). This is a
 * deliberate, documented choice for the 2-day prototype (see the trimmed
 * implementation roadmap): a live demo must never depend on an external
 * API's uptime, quota, or network reachability from the judging venue.
 * The adapter boundary (weatherApiAdapter) is identical to what a real
 * API integration would use — swapping in a real HTTP call to
 * OpenWeatherMap/IMD later requires touching only this file.
 */

const CITY_POOL = [
  "Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru", "Hyderabad",
  "Jaipur", "Guwahati", "Patna", "Lucknow", "Pune", "Ahmedabad",
  "Bhubaneswar", "Chandigarh", "Nagpur",
];

const SCENARIOS = [
  { category: "rainfall", text: (c) => `Moderate rainfall reported across ${c} through the afternoon.`, wind: null, rain: 20 },
  { category: "flooding", text: (c) => `Heavy rainfall and waterlogging reported in low-lying areas of ${c}.`, wind: null, rain: 80 },
  { category: "thunderstorm", text: (c) => `Thunderstorm with lightning activity observed over ${c}.`, wind: 45, rain: 30 },
  { category: "heatwave", text: (c) => `${c} recorded significantly above-normal temperatures today, heatwave conditions likely.`, wind: null, rain: null },
  { category: "fog", text: (c) => `Dense fog reduced visibility across parts of ${c} this morning.`, wind: null, rain: null },
  { category: "dust_storm", text: (c) => `Dust storm conditions reported over ${c} region.`, wind: 50, rain: null },
  { category: "strong_wind", text: (c) => `High wind speeds recorded in ${c}, gusts affecting the region.`, wind: 65, rain: null },
  { category: "cyclone", text: (c) => `Cyclonic circulation intensifying near the coast close to ${c}.`, wind: 95, rain: 120 },
  { category: "clear", text: (c) => `Clear skies and pleasant weather conditions in ${c} today.`, wind: null, rain: null },
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Runs one polling cycle: picks 1-3 random cities and generates a plausible
 * weather condition report for each, weighted toward "interesting" (non-clear)
 * conditions so the live demo stays visually active.
 */
async function pollWeatherApi() {
  const numCities = 1 + Math.floor(Math.random() * 3);
  const cities = [...CITY_POOL].sort(() => 0.5 - Math.random()).slice(0, numCities);

  for (const city of cities) {
    // Bias toward non-clear scenarios (80% of the time) for a livelier demo.
    const pool = Math.random() < 0.8 ? SCENARIOS.filter((s) => s.category !== "clear") : SCENARIOS;
    const scenario = pick(pool);

    try {
      const canonical = weatherApiAdapter({
        city,
        description: scenario.text(city),
        windSpeedKmh: scenario.wind,
        rainfallMm: scenario.rain,
      });
      await enqueueReport(canonical);
    } catch (err) {
      logger.error(`Weather API connector failed for ${city}:`, err.message);
    }
  }
}

module.exports = { pollWeatherApi };
