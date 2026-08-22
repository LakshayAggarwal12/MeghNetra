const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const env = require("./config/env");
const logger = require("./utils/logger");
const { errorMiddleware, notFoundMiddleware } = require("./middleware/error.middleware");
const socketService = require("./services/socket.service");
const { startSchedulers } = require("./ingestion/scheduler");

const authRoutes = require("./routes/auth.routes");
const reportsRoutes = require("./routes/reports.routes");
const eventsRoutes = require("./routes/events.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const adminRoutes = require("./routes/admin.routes");
const sourcesRoutes = require("./routes/sources.routes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: env.CORS_ORIGIN } });

socketService.init(io);

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "meghnetra-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/sources", sourcesRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

io.on("connection", (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => logger.info(`Socket disconnected: ${socket.id}`));
});

server.listen(env.PORT, () => {
  logger.info(`MEGHNETRA backend listening on port ${env.PORT}`);
  startSchedulers();
});

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception:", err);
});
