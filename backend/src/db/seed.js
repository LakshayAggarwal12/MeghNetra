/**
 * Demo data seeder (Feature 27).
 *
 * Pushes synthetic reports through the REAL pipeline (classify -> location ->
 * severity -> cluster -> verify), not hand-written weather_events rows, so
 * seeded data is internally consistent (correct confidence scores, correct
 * event_reports links) and doubles as an end-to-end pipeline test.
 *
 * Reports are processed in chronological order (oldest first) with
 * backdated `submitted_at` timestamps so the trend chart has real shape
 * across the last several days, and so duplicate-detection's time window
 * is evaluated against each report's own era rather than wall-clock "now".
 *
 * Requires: Postgres reachable, AI service running on AI_SERVICE_URL.
 * Safe to re-run: it TRUNCATEs report/event tables first (never touches
 * event_categories, sources, or users).
 */
require("dotenv").config();
const pool = require("../config/db");
const { processReport } = require("../services/pipeline.service");
const { SOURCE_IDS } = require("../services/enqueue.service");

const HOURS = 60 * 60 * 1000;

function hoursAgo(h) {
  return new Date(Date.now() - h * HOURS).toISOString();
}

async function insertReportDirect({ sourceType, rawText, submittedAt, locationHint, numericSignals }) {
  const sourceId = SOURCE_IDS[sourceType];
  const { rows } = await pool.query(
    `INSERT INTO reports (source_id, raw_text, media_refs, submitted_at, status)
     VALUES ($1, $2, '[]', $3, 'pending') RETURNING id`,
    [sourceId, rawText, submittedAt]
  );
  const reportId = rows[0].id;
  await processReport(reportId, { locationHint, numericSignals });
  return reportId;
}

// --- Scripted scenarios: guarantee at least one of every verification status ---
const scriptedScenarios = [
  // VERIFIED: multi-source agreement on a flooding event in Noida, tightly clustered in time.
  { sourceType: "citizen", rawText: "Heavy flooding in Sector 62 Noida, roads submerged", submittedAt: hoursAgo(2.5), locationHint: "Sector 62 Noida" },
  { sourceType: "citizen", rawText: "Waterlogging reported near Sector 62 Noida, traffic stuck", submittedAt: hoursAgo(2.2), locationHint: "Noida" },
  { sourceType: "weather_api", rawText: "Heavy rainfall and flooding conditions reported across Noida region", submittedAt: hoursAgo(2.0), locationHint: "Noida", numericSignals: { rainfallMm: 95 } },
  { sourceType: "rss", rawText: "Local news: Noida sector 62 flooded after overnight downpour, residents affected", submittedAt: hoursAgo(1.8), locationHint: "Noida" },

  // CONTRADICTED: citizen reports flooding in Jaipur, but weather-API says clear skies at the same time.
  { sourceType: "citizen", rawText: "Severe flooding reported in Jaipur city center, extreme conditions", submittedAt: hoursAgo(5.0), locationHint: "Jaipur" },
  { sourceType: "weather_api", rawText: "Clear skies and pleasant weather conditions in Jaipur today", submittedAt: hoursAgo(4.8), locationHint: "Jaipur" },

  // UNVERIFIED: single, uncorroborated citizen report of fog in Lucknow.
  { sourceType: "citizen", rawText: "Dense fog this morning near Lucknow, visibility very low", submittedAt: hoursAgo(1.0), locationHint: "Lucknow" },
];

// --- Bulk historical volume for map spread + trend chart shape ---
const cities = [
  "Mumbai", "Chennai", "Kolkata", "Bengaluru", "Hyderabad", "Ahmedabad",
  "Pune", "Guwahati", "Patna", "Bhubaneswar", "Chandigarh", "Nagpur",
  "Kochi", "Amritsar", "Dehradun", "Raipur", "Indore", "Surat",
];

const bulkTemplates = [
  { cat: "rainfall", text: (c) => `Moderate to heavy rainfall recorded in ${c} over the past day.` },
  { cat: "flooding", text: (c) => `Waterlogging reported in several low-lying areas of ${c}.` },
  { cat: "thunderstorm", text: (c) => `Thunderstorm activity with lightning observed over ${c}.` },
  { cat: "heatwave", text: (c) => `${c} recorded unusually high temperatures, heatwave-like conditions.` },
  { cat: "fog", text: (c) => `Fog reduced visibility across ${c} in the early hours.` },
  { cat: "dust_storm", text: (c) => `Dust storm conditions swept through parts of ${c}.` },
  { cat: "strong_wind", text: (c) => `Strong winds recorded across ${c}, minor disruptions reported.` },
  { cat: "cyclone", text: (c) => `Cyclonic weather system tracked approaching the coast near ${c}.` },
];

function randomBulkReports(count) {
  const list = [];
  for (let i = 0; i < count; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const template = bulkTemplates[Math.floor(Math.random() * bulkTemplates.length)];
    const hoursBack = Math.random() * 24 * 6; // spread across last 6 days
    const sourceType = Math.random() < 0.75 ? "citizen" : Math.random() < 0.5 ? "weather_api" : "rss";
    list.push({
      sourceType,
      rawText: template.text(city),
      submittedAt: hoursAgo(hoursBack),
      locationHint: city,
    });
  }
  // Oldest first so clustering windows behave correctly as we replay history.
  list.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
  return list;
}

async function truncateDemoData() {
  console.log("Clearing existing report/event data (categories, sources, users are preserved)...");
  await pool.query(
    `TRUNCATE audit_logs, evidence, verification_results, event_reports, weather_events, reports, locations RESTART IDENTITY CASCADE`
  );
}

async function run() {
  await truncateDemoData();

  const allScenarios = [...scriptedScenarios].sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));
  const bulk = randomBulkReports(50);

  console.log(`Seeding ${allScenarios.length} scripted scenario reports...`);
  for (const scenario of allScenarios) {
    try {
      await insertReportDirect(scenario);
    } catch (err) {
      console.error("Scenario seed failed:", scenario.rawText, err.message);
    }
  }

  console.log(`Seeding ${bulk.length} bulk historical reports for trend/map depth...`);
  for (const item of bulk) {
    try {
      await insertReportDirect(item);
    } catch (err) {
      console.error("Bulk seed report failed:", item.rawText, err.message);
    }
  }

  const counts = await pool.query(`SELECT status, COUNT(*) FROM weather_events GROUP BY status`);
  console.log("\nSeed complete. Event status distribution:");
  console.table(counts.rows);

  await pool.end();
}

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
