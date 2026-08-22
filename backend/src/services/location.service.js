const pool = require("../config/db");

const REUSE_RADIUS_METERS = 500;

/**
 * Given a resolved city/state/lat/lng from the AI service, either reuse an
 * existing `locations` row within REUSE_RADIUS_METERS, or create a new one.
 * This keeps duplicate detection's geo-proximity queries fast and avoids
 * flooding the table with near-identical location rows for the same place.
 */
async function upsertLocation({ city, state, lat, lng }) {
  const existing = await pool.query(
    `SELECT id, city, state, ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lng
     FROM locations
     WHERE ST_DWithin(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
     ORDER BY ST_Distance(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) ASC
     LIMIT 1`,
    [lng, lat, REUSE_RADIUS_METERS]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  const inserted = await pool.query(
    `INSERT INTO locations (locality, city, state, geom)
     VALUES (NULL, $1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography)
     RETURNING id, city, state, ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lng`,
    [city, state, lng, lat]
  );

  return inserted.rows[0];
}

module.exports = { upsertLocation };
