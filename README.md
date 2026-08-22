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
- RSS ingestion, event-merge UI, and per-report suspicious-flagging are
  documented but not wired into the UI in this build — the underlying data
  model supports them.

Every one of these is a documented, defensible simplification for a 2-day
build, not a missing understanding of the full design (see the companion
`MEGHNETRA_2Day_Implementation_Roadmap.pdf` for the complete, un-trimmed
feature roadmap this project was built from).

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
