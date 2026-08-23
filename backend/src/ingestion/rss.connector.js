const Parser = require("rss-parser");
const { rssAdapter } = require("./adapters/rssAdapter");
const { enqueueReport } = require("../services/enqueue.service");
const logger = require("../utils/logger");

const parser = new Parser({ timeout: 10000 });

// Lightweight pre-filter so we don't enqueue every unrelated headline from a
// general news feed — the actual classification still happens downstream in
// the AI service; this is just a cheap gate to avoid wasting pipeline calls
// on obviously irrelevant items (sports scores, entertainment, etc.).
const WEATHER_KEYWORDS = [
  "rain", "rainfall", "flood", "flooding", "waterlogging", "storm", "thunderstorm",
  "lightning", "hail", "heatwave", "heat wave", "fog", "mist", "dust storm",
  "sandstorm", "wind", "gale", "cyclone", "hurricane", "typhoon", "weather",
  "monsoon", "downpour", "IMD", "meteorological",
];

function isWeatherRelated(text) {
  const lower = text.toLowerCase();
  return WEATHER_KEYWORDS.some((kw) => lower.includes(kw));
}

// In-memory dedupe of already-processed item links/guids. This resets on
// restart, which is an accepted prototype limitation — for a longer-running
// deployment this should be backed by a small DB table or Redis set instead.
const seenItems = new Set();

function pruneSeenItems() {
  if (seenItems.size > 5000) seenItems.clear(); // simple unbounded-growth guard
}

async function pollFeed(feedUrl) {
  let feed;
  try {
    feed = await parser.parseURL(feedUrl);
  } catch (err) {
    logger.error(`RSS connector: failed to fetch/parse ${feedUrl}:`, err.message);
    return;
  }

  for (const item of feed.items || []) {
    const dedupeKey = item.guid || item.link || item.title;
    if (!dedupeKey || seenItems.has(dedupeKey)) continue;

    const text = [item.title, item.contentSnippet].filter(Boolean).join(" — ");
    if (!text || !isWeatherRelated(text)) {
      seenItems.add(dedupeKey); // mark as seen even if irrelevant, so we don't re-check it every cycle
      continue;
    }

    try {
      const canonical = rssAdapter({
        title: item.title,
        contentSnippet: item.contentSnippet,
        isoDate: item.isoDate,
        link: item.link,
      });
      await enqueueReport(canonical);
      seenItems.add(dedupeKey);
    } catch (err) {
      logger.error(`RSS connector: failed to enqueue item from ${feedUrl}:`, err.message);
    }
  }
}

async function pollAllFeeds(feedUrls) {
  pruneSeenItems();
  for (const url of feedUrls) {
    await pollFeed(url);
  }
}

/**
 * On-demand city search (used by the new city-lookup feature): searches the
 * configured RSS feeds for items mentioning the given city by name, without
 * requiring the item to already match the general weather-keyword filter
 * used by the scheduled poll — the caller explicitly wants "everything
 * about this city" from the news feeds, and downstream classification will
 * still correctly categorize (or discard as low-relevance) whatever comes
 * back. Bypasses the seenItems dedupe too, since a user-initiated search
 * should surface a matching item even if the scheduled poll already saw it.
 * Returns the list of matched items (does NOT enqueue them itself — the
 * caller decides which of the returned candidates to enqueue).
 */
async function searchFeedsForCity(cityName, feedUrls) {
  const matches = [];
  const cityLower = cityName.trim().toLowerCase();
  if (!cityLower) return matches;

  for (const url of feedUrls) {
    let feed;
    try {
      feed = await parser.parseURL(url);
    } catch (err) {
      logger.error(`City search: failed to fetch/parse ${url}:`, err.message);
      continue;
    }

    for (const item of feed.items || []) {
      const text = [item.title, item.contentSnippet].filter(Boolean).join(" — ");
      if (text.toLowerCase().includes(cityLower)) {
        matches.push({
          title: item.title,
          contentSnippet: item.contentSnippet,
          isoDate: item.isoDate,
          link: item.link,
          feedUrl: url,
        });
      }
    }
  }

  return matches;
}

module.exports = { pollAllFeeds, isWeatherRelated, searchFeedsForCity };
