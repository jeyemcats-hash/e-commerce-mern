const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

// Import middleware
const { protect, admin } = require("../middleware/authMiddleware");

// ========================================
// ROUTES
// ========================================

// CREATE - Place new order (PROTECTED - must be logged in)
// POST http://localhost:5000/api/orders
router.post("/", protect, createOrder);

// READ - Get all orders (ADMIN ONLY)
// GET http://localhost:5000/api/orders
router.get("/", protect, admin, getAllOrders);

// READ - Get single order by ID (PROTECTED - must be logged in)
// GET http://localhost:5000/api/orders/:id
router.get("/:id", protect, getOrderById);

// READ - Get all orders by a specific user (PROTECTED - must be logged in)
// GET http://localhost:5000/api/orders/user/:userId
router.get("/user/:userId", protect, getOrdersByUser);

// UPDATE - Update order status (ADMIN ONLY)
// PUT http://localhost:5000/api/orders/:id
router.put("/:id", protect, admin, updateOrderStatus);

// DELETE - Cancel/Delete order (ADMIN ONLY)
// DELETE http://localhost:5000/api/orders/:id
router.delete("/:id", protect, admin, deleteOrder);

module.exports = router;