# Suggested Demo Script (5-7 minutes)

## 1. Open with the populated dashboard (30s)
Show the India map already populated with events from the seed data —
multiple states, multiple categories, live stat counters. Say: "This is
MEGHNETRA after a few days of continuous ingestion from weather APIs, news,
and citizens."

## 2. Show the evidence-based verification story (90s)
Click into the seeded **Verified** flooding event in Noida. Point out:
- Multiple linked reports from different source types (citizen, weather-API,
  news)
- The confidence score and its full factor breakdown — "this isn't a black
  box, every percentage point is traceable"
- The evidence checklist matching PS 26069's requirement to assess
  reliability across sources

Then show the **Contradicted** event (Jaipur) — a citizen report of flooding
that the weather-API data directly disagreed with. Explain this is exactly
the "assess whether information is potentially fake or misleading"
requirement in action.

## 3. Live ingestion demo (90s) — the most important part
Open `/report` and submit a new citizen report describing a fictional event
in your own words, e.g. "Severe waterlogging in Sector 62, Noida, cars
stuck on the road."

Switch back to the dashboard **without refreshing** — the new event appears
live on the map within a few seconds via Socket.IO.

If time allows, submit a second, differently-worded report about the same
fictional event (e.g. "Heavy flooding reported near Sector 62 Noida today")
and show that it **merges into the same event** rather than creating a
duplicate — this is the duplicate-detection/clustering feature, and it's
the single most convincing "this is real AI, not a static map" moment.

## 4. Admin panel (60s)
Log in at `/admin` (admin@meghnetra.in / admin123). Show the review queue
of unverified/suspicious events, open one, and click "Verify." Switch back
to a still-open public dashboard tab and show the status badge update live
— proving admin actions are first-class and propagate through the same
real-time layer as automated updates. Then show the Audit Log tab.

## 5. Close with the architecture (30s)
One sentence: "Node/Express handles all orchestration and real-time
delivery; Python/FastAPI is a private AI microservice doing classification,
geolocation, duplicate detection, and evidence fusion; PostgreSQL/PostGIS is
the geospatial system of record — exactly the layered architecture the
problem statement calls for, and every layer is independently scalable."

## If Asked "What Would You Add With More Time?"
Point to `docs/SCOPE_DECISIONS.md` directly — RSS ingestion at scale, a
trained classifier fallback, live NER geocoding, and Kafka-based streaming
are all designed for, not missing from the architecture.
