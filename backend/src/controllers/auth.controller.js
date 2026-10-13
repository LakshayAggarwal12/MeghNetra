/**
 * Auth controller — registration, login, /me, logout.
 *
 * Architecture notes:
 * - JWT is stored client-side (localStorage / Authorization header).
 * - We keep a server-side token-revocation blocklist in memory so that
 *   /logout immediately invalidates a token without requiring a refresh-
 *   token infrastructure.  This is appropriate for a hackathon prototype
 *   where the team size is small and pod restarts clear the blocklist
 *   naturally.
 * - bcryptjs (already a dep) is used for password hashing.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const env = require("../config/env");
const { asyncHandler } = require("../middleware/error.middleware");

// ─── Token blocklist (in-memory; cleared on restart) ─────────────────────────
const revokedTokens = new Set();

function revokeToken(token) {
  revokedTokens.add(token);
}

function isRevoked(token) {
  return revokedTokens.has(token);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: "12h" }
  );
}

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: { code: "VALIDATION_ERROR", message: "name, email, and password are required" } });
  }
  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: { code: "VALIDATION_ERROR", message: "Password must be at least 8 characters" } });
  }

  // Only allow citizen self-registration; admins must be created separately.
  const assignedRole = "citizen";

  const existing = await pool.query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    return res
      .status(409)
      .json({ error: { code: "CONFLICT", message: "An account with this email already exists" } });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
    [name.trim(), email.toLowerCase().trim(), passwordHash, assignedRole]
  );

  const user = rows[0];
  const token = signToken(user);

  res.status(201).json({ token, user: safeUser(user) });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ error: { code: "VALIDATION_ERROR", message: "Email and password required" } });
  }

  const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1`, [email.toLowerCase()]);
  if (rows.length === 0) {
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Invalid credentials" } });
  }

  const token = signToken(user);
  res.json({ token, user: safeUser(user) });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
const me = asyncHandler(async (req, res) => {
  // req.user is set by requireAuth middleware
  const { rows } = await pool.query(
    `SELECT id, name, email, role, created_at FROM users WHERE id = $1`,
    [req.user.sub]
  );
  if (rows.length === 0) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
  }
  res.json({ user: safeUser(rows[0]) });
});

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) revokeToken(token);
  res.json({ message: "Logged out successfully" });
});

module.exports = { register, login, me, logout, isRevoked };
