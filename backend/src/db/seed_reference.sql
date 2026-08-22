-- Reference data seed: categories + sources + admin user
-- Safe to re-run (ON CONFLICT DO NOTHING)

INSERT INTO event_categories (name, description) VALUES
  ('rainfall', 'Rainfall events of varying intensity'),
  ('thunderstorm', 'Thunderstorms with lightning/heavy rain'),
  ('flooding', 'Flooding, waterlogging, inundation'),
  ('heatwave', 'Extreme heat conditions'),
  ('fog', 'Fog or low-visibility conditions'),
  ('dust_storm', 'Dust or sand storms'),
  ('strong_wind', 'High winds not associated with cyclones'),
  ('cyclone', 'Cyclones and severe tropical storms'),
  ('other', 'Other severe weather events')
ON CONFLICT (name) DO NOTHING;

INSERT INTO sources (id, name, type, reliability_score, config) VALUES
  ('11111111-1111-1111-1111-111111111111', 'OpenWeatherMap / Weather API', 'weather_api', 0.9, '{}'),
  ('22222222-2222-2222-2222-222222222222', 'Citizen App', 'citizen', 0.55, '{"rejected_count":0,"total_count":0}'),
  ('33333333-3333-3333-3333-333333333333', 'News / RSS Feed', 'rss', 0.75, '{}')
ON CONFLICT (id) DO NOTHING;

-- Admin user: email admin@meghnetra.in / password admin123
-- password_hash below is a bcrypt hash of "admin123" (cost 10)
INSERT INTO users (name, email, password_hash, role) VALUES
  ('MEGHNETRA Admin', 'admin@meghnetra.in', '$2b$10$plddFxUsdxqFGelt6iFWaO35enxK2gPiXf26Jgfb3omdr54DAF5t6', 'admin')
ON CONFLICT (email) DO NOTHING;
