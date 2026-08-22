const jwt = require("jsonwebtoken");
const env = require("../config/env");

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing bearer token" } });
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    if (payload.role !== "admin") {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Admin role required" } });
    }
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });
  }
}

module.exports = { requireAdmin };
