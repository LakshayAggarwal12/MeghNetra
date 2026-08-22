const express = require("express");
const { requireAdmin } = require("../middleware/auth.middleware");
const {
  getQueue,
  verifyEvent,
  rejectEvent,
  correctEvent,
  getAuditLogs,
} = require("../controllers/admin.controller");

const router = express.Router();

router.use(requireAdmin);

router.get("/queue", getQueue);
router.get("/audit-logs", getAuditLogs);
router.post("/events/:id/verify", verifyEvent);
router.post("/events/:id/reject", rejectEvent);
router.post("/events/:id/correct", correctEvent);

module.exports = router;
