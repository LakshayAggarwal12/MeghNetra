const express = require("express");
const { register, login, me, logout } = require("../controllers/auth.controller");
const { requireAuth } = require("../middleware/auth.middleware");

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected (any authenticated user)
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);

module.exports = router;
