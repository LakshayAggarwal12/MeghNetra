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
 *
 * DEDUPE STRATEGY: the previous version re-fetched every city on every poll
 * cycle, which meant the same city could be re-enqueued every
 * WEATHER_POLL_INTERVAL_SECONDS even when conditions hadn't changed,
 * producing near-duplicate reports/events. This version tracks a per-city
 * "last fetched" timestamp in memory and skips a city until
 * WEATHER_CITY_COOLDOWN_MINUTES has elapsed since it was last fetched by
 * the SCHEDULED poll. On-demand lookups (fetchCityOnDemand, used by the new
 * city-search feature) intentionally bypass this cooldown, since a user
 * explicitly asking for a city wants fresh data regardless of the schedule.
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

// city (lowercase) -> ms timestamp last fetched by the SCHEDULED poll.
const lastFetchedAt = new Map();

function isOnCooldown(city) {
  const last = lastFetchedAt.get(city.toLowerCase());
  if (!last) return false;
  const cooldownMs = env.WEATHER_CITY_COOLDOWN_MINUTES * 60 * 1000;
  return Date.now() - last < cooldownMs;
}

function markFetched(city) {
  lastFetchedAt.set(city.toLowerCase(), Date.now());
}

async function fetchSimulatedCity(city) {
  const pool = Math.random() < 0.8 ? SCENARIOS.filter((s) => s.category !== "clear") : SCENARIOS;
  const scenario = pick(pool);

  const canonical = weatherApiAdapter({
    city,
    description: scenario.text(city),
    windSpeedKmh: scenario.wind,
    rainfallMm: scenario.rain,
  });
  return enqueueReport(canonical);
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

async function fetchOpenWeatherMapCity(city) {
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
  const reportId = await enqueueReport(canonical);
  return { reportId, sentence, windKmh, rainMm, raw: data };
}

/**
 * Scheduled poll: iterates the fixed city pool, skipping any city still
 * within its cooldown window so the same city isn't re-enqueued every cycle.
 */
async function pollWeatherApi() {
  const useReal = env.WEATHER_API_PROVIDER === "openweathermap" && env.WEATHER_API_KEY;
  if (env.WEATHER_API_PROVIDER === "openweathermap" && !env.WEATHER_API_KEY) {
    logger.warn("WEATHER_API_PROVIDER=openweathermap but WEATHER_API_KEY is not set — falling back to simulated data.");
  }

  const citiesDue = CITY_POOL.filter((c) => !isOnCooldown(c));
  if (citiesDue.length === 0) {
    logger.info(`Weather API poll: all ${CITY_POOL.length} cities on cooldown (${env.WEATHER_CITY_COOLDOWN_MINUTES}min) — skipping this cycle.`);
    return;
  }

  // Simulated mode still only samples 1-3 cities per cycle (keeps demo pace
  // similar to before); real mode fetches every due city each cycle.
  const citiesThisCycle = useReal
    ? citiesDue
    : [...citiesDue].sort(() => 0.5 - Math.random()).slice(0, 1 + Math.floor(Math.random() * 3));

  for (const city of citiesThisCycle) {
    try {
      if (useReal) {
        await fetchOpenWeatherMapCity(city);
      } else {
        await fetchSimulatedCity(city);
      }
      markFetched(city);
    } catch (err) {
      const detail = err.response ? `${err.response.status} ${JSON.stringify(err.response.data)}` : err.message;
      logger.error(`Weather API connector failed for ${city}:`, detail);
      // Do not mark as fetched on failure, so it will be retried next cycle
      // rather than sitting on a cooldown for data it never actually got.
    }
  }
}

/**
 * On-demand lookup for the new city-search feature (bypasses cooldown —
 * a user explicitly asking for a city wants current data now). Returns the
 * enqueued report info directly so the caller can respond immediately,
 * without waiting for the async pipeline to finish classifying it.
 */
async function fetchCityOnDemand(city) {
  if (env.WEATHER_API_PROVIDER === "openweathermap" && env.WEATHER_API_KEY) {
    const result = await fetchOpenWeatherMapCity(city);
    markFetched(city); // still records it, so the next SCHEDULED poll respects the cooldown too
    return { mode: "openweathermap", ...result };
  }
  await fetchSimulatedCity(city);
  markFetched(city);
  return { mode: "simulated" };
}

module.exports = { pollWeatherApi, fetchCityOnDemand };
