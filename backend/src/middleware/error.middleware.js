const logger = require("../utils/logger");

// Wrap async route handlers so rejected promises reach this middleware
// instead of crashing the process.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} ->`, err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: status === 500 ? "Something went wrong. Please try again." : err.message,
    },
  });
}

function notFoundMiddleware(req, res) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "Route not found" } });
}

module.exports = { asyncHandler, errorMiddleware, notFoundMiddleware };
