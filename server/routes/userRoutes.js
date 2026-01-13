const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

// Import middleware
const { protect, admin } = require("../middleware/authMiddleware");

// ========================================
// ROUTES
// ========================================

// CREATE - Register new user (PUBLIC - for testing)
// POST http://localhost:5000/api/users
router.post("/", createUser);

// READ - Get all users (ADMIN ONLY)
// GET http://localhost:5000/api/users
router.get("/", protect, admin, getAllUsers);

// READ - Get single user by ID (PROTECTED)
// GET http://localhost:5000/api/users/:id
router.get("/:id", protect, getUserById);

// UPDATE - Update user by ID (PROTECTED)
// PUT http://localhost:5000/api/users/:id
router.put("/:id", protect, updateUser);

// DELETE - Delete user by ID (ADMIN ONLY)
// DELETE http://localhost:5000/api/users/:id
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;