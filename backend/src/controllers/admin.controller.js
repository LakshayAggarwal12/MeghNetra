const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const env = require("../config/env");
const { asyncHandler } = require("../middleware/error.middleware");
const socketService = require("../services/socket.service");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Email and password required" } });
  }

  const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1 AND role = 'admin'`, [email]);
  if (rows.length === 0) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
  }

  const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
    expiresIn: "12h",
  });

  res.json({ token, user: { name: user.name, email: user.email, role: user.role } });
});

// GET /api/admin/queue — pending/flagged/unverified items needing review
const getQueue = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT e.id, e.category, e.severity, e.status, e.confidence_score, e.first_seen_at,
            l.city, l.state,
            (SELECT COUNT(*) FROM event_reports er WHERE er.event_id = e.id) AS report_count
     FROM weather_events e
     JOIN locations l ON l.id = e.location_id
     WHERE e.status IN ('unverified', 'suspicious')
     ORDER BY
       CASE e.status WHEN 'suspicious' THEN 0 ELSE 1 END,
       e.last_updated_at DESC
     LIMIT 100`
  );
  res.json({ queue: rows, count: rows.length });
});

async function writeAudit(client, { actor, action, targetType, targetId, details }) {
  await client.query(
    `INSERT INTO audit_logs (actor, action, target_type, target_id, details) VALUES ($1,$2,$3,$4,$5)`,
    [actor, action, targetType, targetId, JSON.stringify(details || {})]
  );
}

const verifyEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const actor = req.user.email;

  const before = await pool.query(`SELECT status, confidence_score FROM weather_events WHERE id = $1`, [id]);
  if (before.rows.length === 0) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Event not found" } });

  await pool.query(`UPDATE weather_events SET status = 'verified', last_updated_at = now() WHERE id = $1`, [id]);
  await writeAudit(pool, {
    actor,
    action: "verify",
    targetType: "event",
    targetId: id,
    details: { previous_status: before.rows[0].status },
  });

  const updated = await pool.query(
    `SELECT e.*, l.city, l.state FROM weather_events e JOIN locations l ON l.id=e.location_id WHERE e.id=$1`,
    [id]
  );
  socketService.emitEventUpdate(updated.rows[0]);
  res.json({ event: updated.rows[0] });
});

const rejectEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const actor = req.user.email;

  const before = await pool.query(`SELECT status FROM weather_events WHERE id = $1`, [id]);
  if (before.rows.length === 0) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Event not found" } });

  await pool.query(`UPDATE weather_events SET status = 'contradicted', last_updated_at = now() WHERE id = $1`, [id]);

  // Feed the rejection back into each contributing source's rejection-rate tracking (Feature 14 hook).
  await pool.query(
    `UPDATE sources SET config = jsonb_set(
        jsonb_set(config, '{rejected_count}', (COALESCE((config->>'rejected_count')::int,0)+1)::text::jsonb),
        '{total_count}', (COALESCE((config->>'total_count')::int,0)+1)::text::jsonb)
     WHERE id IN (
        SELECT DISTINCT r.source_id FROM event_reports er JOIN reports r ON r.id = er.report_id WHERE er.event_id = $1
     )`,
    [id]
  );

  await writeAudit(pool, {
    actor,
    action: "reject",
    targetType: "event",
    targetId: id,
    details: { previous_status: before.rows[0].status },
  });

  const updated = await pool.query(
    `SELECT e.*, l.city, l.state FROM weather_events e JOIN locations l ON l.id=e.location_id WHERE e.id=$1`,
    [id]
  );
  socketService.emitEventUpdate(updated.rows[0]);
  res.json({ event: updated.rows[0] });
});

const correctEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { category, severity } = req.body;
  const actor = req.user.email;

  const before = await pool.query(`SELECT category, severity FROM weather_events WHERE id = $1`, [id]);
  if (before.rows.length === 0) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Event not found" } });

  const newCategory = category || before.rows[0].category;
  const newSeverity = severity || before.rows[0].severity;

  await pool.query(
    `UPDATE weather_events SET category = $1, severity = $2, last_updated_at = now() WHERE id = $3`,
    [newCategory, newSeverity, id]
  );

  await writeAudit(pool, {
    actor,
    action: "correct",
    targetType: "event",
    targetId: id,
    details: { before: before.rows[0], after: { category: newCategory, severity: newSeverity } },
  });

  const updated = await pool.query(
    `SELECT e.*, l.city, l.state FROM weather_events e JOIN locations l ON l.id=e.location_id WHERE e.id=$1`,
    [id]
  );
  socketService.emitEventUpdate(updated.rows[0]);
  res.json({ event: updated.rows[0] });
});

// GET /api/admin/audit-logs?targetType=&targetId=
const getAuditLogs = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.query;
  const clauses = [];
  const params = [];

  if (targetType) {
    params.push(targetType);
    clauses.push(`target_type = $${params.length}`);
  }
  if (targetId) {
    params.push(targetId);
    clauses.push(`target_id = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM audit_logs ${where} ORDER BY timestamp DESC LIMIT 200`,
    params
  );
  res.json({ logs: rows });
});

module.exports = { login, getQueue, verifyEvent, rejectEvent, correctEvent, getAuditLogs };
