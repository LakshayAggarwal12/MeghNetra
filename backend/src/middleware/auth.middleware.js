const jwt = require("jsonwebtoken");
const env = require("../config/env");

/**
 * Lazily imported to avoid circular dependency.
 * auth.controller exports `isRevoked` for blocklist checks.
 */
function getIsRevoked() {
  return require("../controllers/auth.controller").isRevoked;
}

/**
 * requireAuth — any authenticated user (citizen or admin).
 * Attaches decoded payload to req.user.
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token" } });
  }

  try {
    const isRevoked = getIsRevoked();
    if (isRevoked(token)) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Token has been revoked" } });
    }
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
  }
}

/**
 * requireAdmin — only admin-role users may pass.
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Admin role required" } });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin };
