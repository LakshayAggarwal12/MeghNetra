let ioInstance = null;

function init(io) {
  ioInstance = io;
}

function emitEventUpdate(event) {
  if (!ioInstance) return;
  ioInstance.emit("event:update", event);
  if (["unverified", "suspicious"].includes(event.status)) {
    ioInstance.emit("admin:queue-update", event);
  }
}

function emitReportStatus(reportId, status) {
  if (!ioInstance) return;
  ioInstance.emit("report:status", { reportId, status });
}

module.exports = { init, emitEventUpdate, emitReportStatus };
