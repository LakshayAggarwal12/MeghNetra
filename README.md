# MEGHNETRA — Eye of the Clouds

**AI-powered National Weather Big Data Analytics Platform**
Built for Smart India Hackathon — Problem Statement 26069

MEGHNETRA continuously ingests weather-related reports from multiple sources
(a simulated weather API, citizen reports, and news/RSS), automatically
classifies the event type and severity, geolocates it, detects duplicate
reports of the same underlying event, cross-verifies it against independent
sources, and computes an interpretable, evidence-based confidence score —
all visualized live on an India map with a human-in-the-loop admin panel.

This is a **working, runnable prototype**, not a mockup. Every endpoint below
has been built and exercised end-to-end.

---

## 1. Architecture

```
[Weather API (simulated) / Citizen App / RSS]
        │
        ▼
Node.js + Express  ──validates, normalizes──►  Redis Queue (BullMQ)
        │                                              │
        │◄──────────── worker picks up job ────────────┘
        ▼
Node worker calls Python FastAPI (internal, server-to-server):
   /classify   /location   /severity   /similarity/batch   /verification/score
        ▼
PostgreSQL + PostGIS  (system of record)
        ▼
Socket.IO  ──live push──►  React Dashboard / Admin Panel
```

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind, Leaflet, Recharts, Socket.IO client |
| Backend / API gateway | Node.js + Express |
| Real-time | Socket.IO |
| AI/ML service | Python + FastAPI |
| AI/ML libraries | scikit-learn (TF-IDF + cosine similarity), rule-based classification |
| Database | PostgreSQL + PostGIS |
| Queue/cache | Redis + BullMQ |

Node/Express is the only service the frontend ever talks to. Python/FastAPI
is a private internal microservice, called only by Node over HTTP with a
shared `x-internal-key` header — it never touches the database directly and
is never exposed to the browser.

## 2. What's Implemented (scope note)

This build follows a deliberately **trimmed, demo-reliable** scope — see
`docs/SCOPE_DECISIONS.md` for the full reasoning. In short:

- **Classification** is rule-based keyword matching (fast, explainable, no
  training data/model download needed).
- **Geocoding** uses a curated ~45-city Indian lookup table, not live NER or
  an external geocoding API — this means the demo never depends on a network
  call that could fail or rate-limit in front of judges.
- **Duplicate detection** uses TF-IDF + cosine similarity (not sentence
  embeddings) fused with geographic proximity, temporal proximity, and
  category agreement — exactly the blueprint's four-signal design, just with
  a lighter text-similarity method.
- **Weather-API ingestion is simulated** (a scheduled job generates
  plausible weather conditions for a rotating set of Indian cities) rather
  than calling a real external API — again, for demo reliability. The
  adapter boundary is identical to what a real integration would use.
- RSS ingestion and event-merge UI are documented but not wired into the UI
  in this build — the underlying data model supports them.

Every one of these is a documented, defensible simplification for a 2-day
build, not a missing understanding of the full design (see the companion
`MEGHNETRA_2Day_Implementation_Roadmap.pdf` for the complete, un-trimmed
feature roadmap this project was built from).

## 2b. Extended Pipeline Layers (Normalization + Correlation + Geospatial)

On top of the core prototype above, the following pipeline layers were
added, extending existing services rather than replacing them:

- **Layer -1, Normalization** (`ai-service/app/normalization/`): a new
  `POST /normalize` endpoint standardizes source labels to a controlled
  vocabulary (`IMD`/`CITIZEN`/`SOCIAL_MEDIA`/`NEWS`/`API`), normalizes
  timestamps to UTC ISO-8601, and maps structured category labels (e.g. an
  explicit "Heavy Rain Warning" field) onto the existing canonical category
  vocabulary — all before the existing classify/location/severity calls,
  which are unchanged.
- **Layer 3, Correlation**: the existing duplicate-detection/clustering
  logic is reused as-is; the only addition is a configurable time window
  (`CORRELATION_TIME_WINDOW_HOURS`) instead of a hardcoded constant.
- **Layer 5, Geospatial Analysis** (`backend/src/services/geospatial.service.js`):
  DBSCAN event clustering, hotspot detection, and convex-hull affected-area
  estimation — implemented natively in **PostGIS** (`ST_ClusterDBSCAN`,
  `ST_ConvexHull`, `ST_Area`) rather than adding a GeoPandas/Shapely
  dependency, since PostGIS was already part of the architecture.
- **Layer 6, Final Weather Event**: `cluster_id`, `is_hotspot`, and
  `affected_area_km2` are now additive columns on `weather_events`, exposed
  through the *existing* `GET /api/events` and `GET /api/events/:id`
  endpoints (no breaking contract changes), plus a `FinalWeatherEvent`
  Pydantic schema documenting the aggregated contract.
- **Layer 7, Real-time**: no new transport was added — the existing
  Socket.IO layer already satisfies this; the geospatial service simply
  re-emits through it after each recompute.

See `docs/PIPELINE_LAYERS.md` for the full changed-files list and
per-layer status.


## 3. Project Structure

```
meghnetra/
├── backend/           Node.js + Express API, orchestration, queue worker
├── ai-service/         Python + FastAPI AI/ML microservice
├── frontend/            React + TypeScript + Tailwind dashboard
├── docs/                 Scope decisions and demo script
└── SETUP_GUIDE.md    Step-by-step run instructions
```

See `SETUP_GUIDE.md` for exact run commands.

## 4. Demo Credentials

- Admin panel: `admin@meghnetra.in` / `admin123`

## 5. Quick API Reference

**Public (Node/Express, `localhost:5000/api`)**

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Backend health check |
| POST | `/reports` | Submit a citizen report |
| GET | `/events` | List events (filters: `from,to,category,state,status`) |
| GET | `/events/:id` | Full event detail + evidence + linked reports |
| GET | `/events/meta/states` | Distinct states for filter dropdown |
| GET | `/analytics/summary` | Dashboard counters |
| GET | `/analytics/trends` | Time-series data for charts |
| POST | `/auth/login` | Admin login → JWT |
| GET | `/admin/queue` | *(admin)* Pending/suspicious events |
| POST | `/admin/events/:id/verify` | *(admin)* Verify an event |
| POST | `/admin/events/:id/reject` | *(admin)* Reject an event |
| POST | `/admin/events/:id/correct` | *(admin)* Correct category/severity |
| GET | `/admin/audit-logs` | *(admin)* Audit trail |

**Internal (FastAPI, `localhost:8000`, requires `x-internal-key` header)**

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/classify` | Text → weather-event category |
| POST | `/location` | Text → city/state/lat/lng |
| POST | `/severity` | Text + category → severity level |
| POST | `/similarity/batch` | Duplicate-detection fusion score |
| POST | `/verification/score` | Evidence fusion → confidence score + status |

## 6. Why This Helps in SIH Judging

- **It runs.** Every endpoint listed above has been built and exercised —
  this is not a static mockup or a slide deck.
- **It directly maps to PS 26069's own language**: multi-source ingestion,
  metadata extraction, AI classification, duplicate detection, multi-source
  verification, confidence scoring, real-time dashboard, admin panel with
  evidence review — every phrase in the problem statement has a
  corresponding, demonstrable feature.
- **The AI is explainable, not a black box**: the confidence score is a
  transparent weighted formula with a full factor breakdown visible in the
  UI, which is a stronger answer to "how do you know it works?" than an
  opaque trained model would be in a live Q&A.
- **Every simplification is documented and defensible** (see
  `docs/SCOPE_DECISIONS.md`), which lets you answer "why didn't you do X"
  questions with a reasoned trade-off instead of an excuse.

See `docs/DEMO_SCRIPT.md` for a suggested walkthrough order for judges.
