const express = require("express");
const { searchCity } = require("../controllers/search.controller");

const router = express.Router();

router.post("/city", searchCity);

module.exports = router;
