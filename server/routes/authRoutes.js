const express = require("express");
const router = express.Router();

// Import controller functions
const { register, login, getProfile } = require("../controllers/authController");

// Import middleware
const { protect } = require("../middleware/authMiddleware");

// ========================================
// ROUTES
// ========================================

// REGISTER - Create new account
// POST http://localhost:5000/api/auth/register
router.post("/register", register);

// LOGIN - Authenticate user
// POST http://localhost:5000/api/auth/login
router.post("/login", login);

// GET PROFILE - Get current user's profile (PROTECTED)
// GET http://localhost:5000/api/auth/profile
router.get("/profile", protect, getProfile);

module.exports = router;