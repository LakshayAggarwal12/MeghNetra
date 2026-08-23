# Weather API Dedup + On-Demand City Search — Changed Files

## What changed

1. **Duplicate data fix**: the scheduled weather-API poll used to re-fetch
   every city on every cycle, producing near-duplicate reports/events for
   the same city over and over. It now tracks a per-city "last fetched"
   timestamp in memory and skips any city still within
   `WEATHER_CITY_COOLDOWN_MINUTES` (default 30) of its last scheduled fetch.
2. **On-demand city search**: a new endpoint lets you type any city name and
   immediately fetch current weather-API conditions **and** search
   configured RSS feeds for mentions of that city — bypassing the cooldown,
   since an explicit user request should always get fresh data. Everything
   found is enqueued through the exact same pipeline as every other source
   (normalize → classify → location → severity → cluster → verify →
   geospatial) — nothing downstream changed.

## MODIFIED

| File | Change |
|---|---|
| `backend/src/ingestion/weatherApi.connector.js` | Added per-city cooldown tracking (in-memory `Map`); extracted a reusable `fetchCityOnDemand()` used by the new search endpoint, which bypasses the cooldown |
| `backend/src/ingestion/rss.connector.js` | Added `searchFeedsForCity(cityName, feedUrls)` — searches configured feeds for city mentions without the general weather-keyword pre-filter |
| `backend/src/config/env.js` | Added `WEATHER_CITY_COOLDOWN_MINUTES` |
| `backend/.env.example` | Documented the new variable |
| `backend/src/index.js` | Registered the new `/api/search` route |

## CREATED

| File | Purpose |
|---|---|
| `backend/src/controllers/search.controller.js` | `POST /api/search/city` handler — calls `fetchCityOnDemand()` + `searchFeedsForCity()`, enqueues results, returns an immediate summary |
| `backend/src/routes/search.routes.js` | Route registration for the above |

## New API Endpoint

```
POST /api/search/city
Body: { "city": "Noida" }

Response (202):
{
  "city": "Noida",
  "weather": { "mode": "openweathermap", "summary": "..." },
  "weatherError": null,
  "newsItemsFound": 3,
  "newsItemsQueued": 2,
  "reportIds": ["...", "..."],
  "message": "Lookup complete. Results are queued for AI processing..."
}
```

## New Environment Variable

```
WEATHER_CITY_COOLDOWN_MINUTES=30
```

## Verified

- All modified/new backend files pass `node --check` (syntax-verified)
- Logic was reasoned through for both paths: scheduled poll correctly skips
  cities on cooldown and does not mark a city as fetched on a failed
  request (so it retries next cycle rather than sitting on cooldown for
  data it never got); on-demand search always bypasses cooldown and still
  records the fetch, so the next *scheduled* poll respects it.
