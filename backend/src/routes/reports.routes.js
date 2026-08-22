const express = require("express");
const { body } = require("express-validator");
const { validate } = require("../middleware/validate.middleware");
const { submitReport, getReport } = require("../controllers/reports.controller");

const router = express.Router();

router.post(
  "/",
  [body("text").isString().trim().isLength({ min: 5 }).withMessage("text must be at least 5 characters")],
  validate,
  submitReport
);

router.get("/:id", getReport);

module.exports = router;
