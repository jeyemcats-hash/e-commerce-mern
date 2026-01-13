const express = require("express");
const router = express.Router();

// Import controller functions
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Import middleware
const { protect, admin } = require("../middleware/authMiddleware");

// ========================================
// ROUTES
// ========================================

// CREATE - Add new product (ADMIN ONLY)
// POST http://localhost:5000/api/products
router.post("/", protect, admin, createProduct);

// READ - Get all products (PUBLIC - anyone can view)
// GET http://localhost:5000/api/products
router.get("/", getAllProducts);

// READ - Get single product by ID (PUBLIC - anyone can view)
// GET http://localhost:5000/api/products/:id
router.get("/:id", getProductById);

// UPDATE - Update product by ID (ADMIN ONLY)
// PUT http://localhost:5000/api/products/:id
router.put("/:id", protect, admin, updateProduct);

// DELETE - Delete product by ID (ADMIN ONLY)
// DELETE http://localhost:5000/api/products/:id
router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;