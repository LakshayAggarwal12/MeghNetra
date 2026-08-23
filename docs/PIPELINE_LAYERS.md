# Pipeline Layers — Changed Files & Status

This document records exactly what was added/modified to implement the
missing pipeline layers (Normalization, Correlation config, Geospatial
Analysis, Final Event aggregation) on top of the already-working MEGHNETRA
prototype. No existing file was rewritten wholesale — every change below is
additive or a small, targeted edit to a single function.

## MODIFIED

| File | One-line reason |
|---|---|
| `ai-service/app/main.py` | Registered the new `normalize` router (2 lines: import + include_router). |
| `ai-service/app/schemas.py` | Added `NormalizeRequest`/`NormalizeResponse` (common schema) and `FinalWeatherEvent` Pydantic models, appended at the end — existing schemas untouched. |
| `backend/src/services/aiClient.service.js` | Added one `normalize()` wrapper function alongside the existing classify/location/severity/similarity/verification calls. |
| `backend/src/services/pipeline.service.js` | Inserted a normalization step (Layer -1) before the existing classify call, and a geospatial recompute step (Layer 5) after verification; the existing classify/location/severity/cluster/verify calls themselves are unchanged. |
| `backend/src/services/clustering.service.js` | Replaced the hardcoded `TIME_WINDOW_HOURS = 12` constant with `env.CORRELATION_TIME_WINDOW_HOURS` (configurable time-correlation threshold, Layer 3 requirement). Correlation logic itself is unchanged. |
| `backend/src/config/env.js` | Added 4 new env vars: `CORRELATION_TIME_WINDOW_HOURS`, `GEO_CLUSTER_EPS_KM`, `GEO_CLUSTER_MIN_POINTS`, `GEO_HOTSPOT_MIN_EVENTS`. |
| `backend/.env.example` | Documented the 4 new env vars above. |
| `backend/src/db/schema.sql` | Additive `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` for `reports.standardized_source`, `weather_events.cluster_id`, `weather_events.is_hotspot`, `weather_events.affected_area_km2` (idempotent, no existing column touched). |
| `backend/src/controllers/events.controller.js` | Added the 3 new geospatial columns to the `listEvents` SELECT list, and added a new `listHotspots` export (detail endpoint already used `e.*` so it needed no change). |
| `backend/src/routes/events.routes.js` | Registered one new route, `GET /events/meta/hotspots`. |
| `frontend/src/types/models.ts` | Added optional `cluster_id`/`is_hotspot`/`affected_area_km2` fields to the existing `WeatherEvent` interface. |
| `frontend/src/components/map/MapView.tsx` | Added a `HotspotOverlays` sub-component rendering translucent circles for hotspot clusters; existing marker rendering unchanged. |
| `frontend/src/components/map/EventMarker.tsx` | Added one conditional line in the popup showing hotspot/cluster/affected-area info when present. |
| `frontend/src/pages/EventDetail.tsx` | Added a hotspot badge and affected-area line to the existing header card. |
| `README.md` | Documented the new pipeline layers (section 2b) and this file. |

## CREATED

| File | One-line reason |
|---|---|
| `ai-service/app/normalization/__init__.py` | New package: Layer -1 normalization utilities. |
| `ai-service/app/normalization/timestamp_utils.py` | Stdlib-only timestamp → UTC ISO-8601 normalizer (epoch, space-separated, `Z`-suffixed, and plain ISO inputs). |
| `ai-service/app/normalization/source_map.py` | Maps internal/raw source labels to the controlled vocabulary `IMD`/`CITIZEN`/`SOCIAL_MEDIA`/`NEWS`/`API`. |
| `ai-service/app/normalization/event_synonyms.py` | Maps *structured* category labels (not free text — that's still the existing ML classifier's job) to the project's existing canonical category vocabulary. |
| `ai-service/app/routers/normalize.py` | New `POST /normalize` FastAPI endpoint wiring the three normalization utilities together into one common-schema response. |
| `backend/src/services/geospatial.service.js` | New Layer 5 service: PostGIS-based DBSCAN clustering, hotspot detection, and convex-hull affected-area estimation. |
| `docs/PIPELINE_LAYERS.md` | This file. |

## Pipeline Status

| Component | Status |
|---|---|
| Normalization | ✅ New (`/normalize` endpoint, live-tested) |
| Common Schema | ✅ New (`NormalizeResponse` Pydantic model) |
| AI/ML Processing (classify/severity/location) | Existing/Reused — unchanged |
| Correlation (duplicate detection + clustering) | Existing/Reused, time window now configurable |
| Evidence/Trust Fusion (verification/confidence) | Existing/Reused — unchanged |
| Geospatial Analysis (DBSCAN/hotspot/affected area) | ✅ New (PostGIS-based, live-tested: 15 clusters / 10 hotspots on seed data) |
| Event Aggregation (Final Weather Event) | ✅ New fields on existing endpoints + `FinalWeatherEvent` Pydantic schema |
| FastAPI | Existing/Updated (one new router registered) |
| React Dashboard | Existing/Updated (hotspot display added) |
| Leaflet Map | Existing/Updated (hotspot circle overlay added) |
| WebSocket / Real-time | Existing/Reused — Socket.IO already satisfied this; geospatial recompute re-emits through it |

## Verified Live (this session)

```
POST /normalize  -> {"cleaned_text":"Heavy flooding in Noida","standardized_source":"CITIZEN",
                      "normalized_timestamp":"2026-08-22T09:30:00+00:00","normalized_category":"rainfall"}

Worker log after submitting a report:
  Normalization complete -> classify -> location -> severity -> cluster -> verify
  Geospatial recompute: 15 cluster(s), 10 hotspot(s)

GET /api/events -> events now include cluster_id, is_hotspot, affected_area_km2
GET /api/events/meta/hotspots -> returns per-cluster centroid + affected area
```

## New Environment Variables

```
CORRELATION_TIME_WINDOW_HOURS=12   # Layer 3 — same-event time window
GEO_CLUSTER_EPS_KM=50              # Layer 5 — DBSCAN neighborhood radius
GEO_CLUSTER_MIN_POINTS=2           # Layer 5 — DBSCAN min points per cluster
GEO_HOTSPOT_MIN_EVENTS=3           # Layer 5 — cluster size to flag as a hotspot
```

No new npm or pip dependencies were added — normalization uses only the
Python stdlib, and geospatial analysis uses PostGIS functions already
available via the existing `postgis` extension.
