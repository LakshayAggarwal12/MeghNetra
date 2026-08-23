const axios = require("axios");
const env = require("../config/env");
const { weatherApiAdapter } = require("./adapters/weatherApiAdapter");
const { enqueueReport } = require("../services/enqueue.service");
const logger = require("../utils/logger");

/**
 * This connector supports two modes, controlled by WEATHER_API_PROVIDER:
 *  - "openweathermap": calls the real OpenWeatherMap Current Weather API
 *  - "simulated" (default): generates plausible conditions with no network
 *    dependency, kept as a safety net if no key is configured or the demo
 *    venue's network is unreliable.
 * The adapter boundary (weatherApiAdapter) is identical either way, so
 * nothing downstream in the pipeline needed to change.
 */

const CITY_POOL = [
  "Delhi", "Mumbai", "Chennai", "Kolkata", "Bengaluru", "Hyderabad",
  "Jaipur", "Guwahati", "Patna", "Lucknow", "Pune", "Ahmedabad",
  "Bhubaneswar", "Chandigarh", "Nagpur","Thiruvananthapuram",
  "Bhopal",
  "Ranchi",
  "Raipur",
  "Dehradun",
  "Shimla",
  "Srinagar",
  "Jammu",
  "Panaji",
  "Gandhinagar",
  "Kochi",
  "Vijayawada",
  "Visakhapatnam",
  "Bhubaneswar",
  "Cuttack",
  "Agartala",
  "Imphal",
  "Shillong",
  "Aizawl",
  "Kohima",
  "Itanagar",
  "Gangtok",
  "Dispur"
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

async function pollSimulated() {
  const numCities = 1 + Math.floor(Math.random() * 3);
  const cities = [...CITY_POOL].sort(() => 0.5 - Math.random()).slice(0, numCities);

  for (const city of cities) {
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
      logger.error(`Weather API connector (simulated) failed for ${city}:`, err.message);
    }
  }
}

/**
 * Builds a natural-language sentence from OpenWeatherMap's response so the
 * existing keyword-based classifier (ai-service) has enough context to
 * match a category, rather than passing the bare one/two-word `description`
 * field through unchanged.
 */
function describeConditions(city, owmData) {
  const description = owmData.weather?.[0]?.description || "weather conditions";
  const windKmh = owmData.wind?.speed != null ? owmData.wind.speed * 3.6 : null;
  const rainMm = owmData.rain?.["1h"] ?? owmData.rain?.["3h"] ?? null;

  let sentence = `${description.charAt(0).toUpperCase() + description.slice(1)} reported in ${city}.`;
  if (windKmh != null && windKmh >= 40) sentence += ` Wind speeds around ${Math.round(windKmh)} km/h.`;
  if (rainMm != null && rainMm > 0) sentence += ` Rainfall of approximately ${rainMm}mm recorded.`;

  return { sentence, windKmh, rainMm };
}

async function pollOpenWeatherMap() {
  for (const city of CITY_POOL) {
    try {
      const { data } = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
        params: { q: `${city},IN`, appid: env.WEATHER_API_KEY, units: "metric" },
        timeout: 8000,
      });

      const { sentence, windKmh, rainMm } = describeConditions(city, data);

      const canonical = weatherApiAdapter({
        city,
        description: sentence,
        windSpeedKmh: windKmh,
        rainfallMm: rainMm,
      });
      await enqueueReport(canonical);
    } catch (err) {
      const detail = err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message;
      logger.error(`OpenWeatherMap fetch failed for ${city}:`, detail);
      // Never let one city's failure stop the rest of the poll cycle.
    }
  }
}

async function pollWeatherApi() {
  if (env.WEATHER_API_PROVIDER === "openweathermap" && env.WEATHER_API_KEY) {
    return pollOpenWeatherMap();
  }
  if (env.WEATHER_API_PROVIDER === "openweathermap" && !env.WEATHER_API_KEY) {
    logger.warn("WEATHER_API_PROVIDER=openweathermap but WEATHER_API_KEY is not set — falling back to simulated data.");
  }
  return pollSimulated();
}

module.exports = { pollWeatherApi };
