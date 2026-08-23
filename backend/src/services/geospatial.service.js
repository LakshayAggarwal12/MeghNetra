const pool = require("../config/db");
const env = require("../config/env");
const socketService = require("./socket.service");
const logger = require("../utils/logger");

/**
 * Layer 5 — Geospatial Analysis.
 *
 * Implemented natively in PostGIS rather than with a new GeoPandas/Shapely
 * dependency, per the task's own guidance to "use PostGIS where the
 * existing architecture/database already supports it" — this project's
 * `locations.geom` column and PostGIS extension already exist (see
 * backend/src/db/schema.sql), so this reuses that rather than adding a
 * second, parallel geometry stack in Python.
 *
 *  1. Event Clustering  -> PostGIS ST_ClusterDBSCAN (equivalent to
 *     scikit-learn DBSCAN, computed directly on the geography column).
 *  2. Hotspot Detection -> clusters whose member count reaches
 *     GEO_HOTSPOT_MIN_EVENTS are flagged is_hotspot = true.
 *  3. Affected Area     -> ST_ConvexHull over each cluster's points,
 *     area reported in km² (Shapely's convex-hull-area equivalent).
 *
 * Full recompute on every call is intentionally simple ("do not build an
 * unnecessarily sophisticated GIS system") — at hackathon-prototype data
 * volumes (tens to low hundreds of events) this runs in milliseconds.
 */
async function recomputeClusters() {
  const epsMeters = env.GEO_CLUSTER_EPS_KM * 1000;
  const minPoints = env.GEO_CLUSTER_MIN_POINTS;
  const hotspotMinEvents = env.GEO_HOTSPOT_MIN_EVENTS;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Event Clustering (DBSCAN over projected meters, eps configurable in km).
    await client.query(
      `WITH clustered AS (
         SELECT e.id,
                ST_ClusterDBSCAN(ST_Transform(l.geom::geometry, 3857), eps := $1, minpoints := $2)
                  OVER () AS cid
         FROM weather_events e
         JOIN locations l ON l.id = e.location_id
       )
       UPDATE weather_events e
       SET cluster_id = c.cid
       FROM clustered c
       WHERE c.id = e.id`,
      [epsMeters, minPoints]
    );

    // Reset stale hotspot/area values before recomputing per-cluster stats.
    await client.query(
      `UPDATE weather_events SET is_hotspot = false, affected_area_km2 = NULL`
    );

    // 2 & 3. Hotspot Detection + Affected Area Analysis, per cluster.
    const clusterStats = await client.query(
      `SELECT e.cluster_id,
              COUNT(*) AS event_count,
              ST_Area(ST_ConvexHull(ST_Collect(l.geom::geometry))::geography) / 1000000.0 AS area_km2
       FROM weather_events e
       JOIN locations l ON l.id = e.location_id
       WHERE e.cluster_id IS NOT NULL
       GROUP BY e.cluster_id`
    );

    for (const row of clusterStats.rows) {
      const isHotspot = parseInt(row.event_count, 10) >= hotspotMinEvents;
      await client.query(
        `UPDATE weather_events SET is_hotspot = $1, affected_area_km2 = $2 WHERE cluster_id = $3`,
        [isHotspot, row.area_km2, row.cluster_id]
      );
    }

    await client.query("COMMIT");

    logger.info(
      `Geospatial recompute: ${clusterStats.rows.length} cluster(s), ` +
        `${clusterStats.rows.filter((r) => parseInt(r.event_count, 10) >= hotspotMinEvents).length} hotspot(s)`
    );
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }

  // Re-broadcast affected events over the existing Socket.IO layer (Layer 7)
  // so open dashboards reflect updated cluster_id/is_hotspot without a
  // manual refresh — reuses socketService.emitEventUpdate, no new transport.
  const { rows: clusteredEvents } = await pool.query(
    `SELECT e.*, l.city, l.state, ST_Y(l.geom::geometry) AS lat, ST_X(l.geom::geometry) AS lng
     FROM weather_events e JOIN locations l ON l.id = e.location_id
     WHERE e.cluster_id IS NOT NULL`
  );
  for (const event of clusteredEvents) {
    socketService.emitEventUpdate(event);
  }
}

module.exports = { recomputeClusters };
