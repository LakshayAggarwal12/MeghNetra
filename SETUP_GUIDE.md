# MEGHNETRA — Setup Guide

Follow these steps in order on a fresh machine. Total time: ~15-20 minutes
(most of it is dependency installation).

## Prerequisites

- **Node.js** v18+ (tested on v22)
- **Python** 3.10+ (tested on 3.12)
- **PostgreSQL** 14+ with the **PostGIS** extension available
- **Redis** 6+

### Installing prerequisites on Ubuntu/Debian

```bash
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib postgis postgresql-16-postgis-3 redis-server
sudo service postgresql start
redis-server --daemonize yes
```

(If you already have Postgres/Redis running, skip this section.)

## Step 1 — Create the database

```bash
sudo -u postgres psql -c "CREATE USER meghnetra WITH PASSWORD 'meghnetra';"
sudo -u postgres psql -c "CREATE DATABASE meghnetra OWNER meghnetra;"
sudo -u postgres psql -d meghnetra -c "CREATE EXTENSION IF NOT EXISTS postgis;"
sudo -u postgres psql -d meghnetra -c "GRANT ALL ON SCHEMA public TO meghnetra;"
```

Verify PostGIS is active:

```bash
psql "postgresql://meghnetra:meghnetra@localhost:5432/meghnetra" -c "SELECT PostGIS_Version();"
```

## Step 2 — AI Service (Python/FastAPI)

```bash
cd ai-service
pip install -r requirements.txt --break-system-packages   # drop the flag if not using system Python
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Leave this running in its own terminal. Verify it's up:

```bash
curl http://localhost:8000/health
# {"status":"ok","service":"meghnetra-ai-service"}
```

## Step 3 — Backend (Node.js/Express)

In a **new terminal**:

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and confirm `DATABASE_URL`, `REDIS_URL`, and `AI_SERVICE_URL`
match your setup (the defaults work for a local install following Step 1).
The `.env.example` also includes `CORRELATION_TIME_WINDOW_HOURS` and the
`GEO_CLUSTER_*`/`GEO_HOTSPOT_*` geospatial-analysis thresholds (Layer 3 and
Layer 5) — the defaults are fine for a demo, no changes needed.

Apply the database schema and reference data:

```bash
npm run db:setup
```

Start the backend API server:

```bash
npm run dev
```

Verify:

```bash
curl http://localhost:5000/api/health
# {"status":"ok","service":"meghnetra-backend"}
```

You should immediately see log lines showing the simulated weather-API
connector enqueuing reports — this is expected and confirms ingestion is
running.

## Step 4 — Queue Worker

The worker is a **separate process** from the API server (this is what lets
report submission stay fast while AI processing happens in the background).
In **another new terminal**:

```bash
cd backend
npm run worker
```

You should see log lines like:

```
Verification complete for event <uuid>: likely_authentic (80.2%)
Processed report <uuid> -> event <uuid> (new event)
```

If you don't see these within ~45 seconds, check that the AI service
(Step 2) is reachable and that `INTERNAL_API_KEY` matches between
`backend/.env` and `ai-service/.env`.

## Step 5 — Seed Demo Data (recommended before your first demo)

With the backend, worker, and AI service all running, in a **new terminal**:

```bash
cd backend
npm run db:seed
```

This clears existing report/event data and replays ~57 realistic reports
through the real pipeline — including a guaranteed **Verified** multi-source
flood event, a guaranteed **Contradicted** event, and a guaranteed
**Unverified** single report — plus ~50 bulk historical reports spread
across 6 days and 18 cities, so the dashboard looks like a live national
platform from the moment you open it.

This can take 1-2 minutes since each report goes through the full
classify → locate → severity → cluster → verify pipeline for realism.

## Step 6 — Frontend (React)

In a **final new terminal**:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL Vite prints (typically `http://localhost:5173`).

## Verifying Everything Works

- [ ] `http://localhost:8000/health` → `{"status":"ok",...}`
- [ ] `http://localhost:5000/api/health` → `{"status":"ok",...}`
- [ ] Dashboard loads at `http://localhost:5173` showing a populated map
- [ ] The green "● Live" indicator shows in the top-right of the dashboard
- [ ] Clicking any event marker/card opens its full evidence view
- [ ] `/admin` logs in with `admin@meghnetra.in` / `admin123` and shows a
      review queue
- [ ] `/report` lets you submit a new citizen report, which appears on the
      map within a few seconds without refreshing

## Running Order Summary (5 terminals)

| Terminal | Command | Directory |
|---|---|---|
| 1 | `uvicorn app.main:app --host 0.0.0.0 --port 8000` | `ai-service/` |
| 2 | `npm run dev` | `backend/` |
| 3 | `npm run worker` | `backend/` |
| 4 | `npm run db:seed` (once, then close) | `backend/` |
| 5 | `npm run dev` | `frontend/` |

## Troubleshooting

- **"AI service unreachable" errors in backend logs**: confirm `uvicorn` is
  running and `AI_SERVICE_URL` in `backend/.env` points to it correctly.
- **401 Unauthorized from FastAPI**: `INTERNAL_API_KEY` in `backend/.env`
  and `ai-service/.env` must be identical.
- **Events never leave "unverified"**: this is often correct behavior for a
  single, uncorroborated citizen report — submit 2-3 similarly-worded
  reports about the same fictional event to see clustering/verification
  produce a higher-confidence status.
- **Map markers missing**: check the worker terminal for errors; a report
  stuck in `pending` status usually means the AI service was unreachable
  when it was processed — it will retry automatically (3 attempts with
  backoff).
- **Port already in use**: something else is using 5000/8000/5173/5432/6379
  — stop it or change the relevant port in `.env`.
