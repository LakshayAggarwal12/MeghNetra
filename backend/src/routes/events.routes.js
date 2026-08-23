const express = require("express");
const { listEvents, getEventDetail, listStates, listHotspots } = require("../controllers/events.controller");

const router = express.Router();

router.get("/meta/states", listStates);
router.get("/meta/hotspots", listHotspots);
router.get("/:id", getEventDetail);
router.get("/", listEvents);

module.exports = router;
