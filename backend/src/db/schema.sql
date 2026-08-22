-- MEGHNETRA Database Schema
-- PostgreSQL + PostGIS

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- for gen_random_uuid()

-- ============================================================
-- Reference data
-- ============================================================

CREATE TABLE IF NOT EXISTS event_categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('weather_api','rss','citizen','web')),
  reliability_score NUMERIC DEFAULT 0.6,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Users (admin only in this prototype — citizen reports are anonymous)
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen','admin')) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Geospatial locations
-- ============================================================

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  locality TEXT,
  city TEXT,
  state TEXT,
  geom GEOGRAPHY(Point, 4326) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_locations_geom ON locations USING GIST(geom);

-- ============================================================
-- Raw reports (from any source, after normalization)
-- ============================================================

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES sources(id),
  raw_text TEXT NOT NULL,
  media_refs JSONB DEFAULT '[]',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  location_id UUID REFERENCES locations(id),
  category_guess TEXT,
  severity_guess TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','processed','flagged','rejected','failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- ============================================================
-- Consolidated weather events
-- ============================================================

CREATE TABLE IF NOT EXISTS weather_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  secondary_categories TEXT[] DEFAULT '{}',
  severity TEXT CHECK (severity IN ('low','moderate','high','severe')) DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'unverified'
     CHECK (status IN ('verified','likely_authentic','unverified','suspicious','contradicted')),
  confidence_score NUMERIC DEFAULT 0,
  location_id UUID REFERENCES locations(id),
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_category_status ON weather_events(category, status, first_seen_at);

CREATE TABLE IF NOT EXISTS event_reports (
  event_id UUID REFERENCES weather_events(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  similarity_score NUMERIC,
  PRIMARY KEY (event_id, report_id)
);
CREATE INDEX IF NOT EXISTS idx_event_reports_lookup ON event_reports(event_id, report_id);

-- ============================================================
-- Verification & evidence
-- ============================================================

CREATE TABLE IF NOT EXISTS verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES weather_events(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  confidence_score NUMERIC NOT NULL,
  factor_scores JSONB NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES weather_events(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  source_id UUID REFERENCES sources(id),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Audit trail
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_logs(target_type, target_id);
