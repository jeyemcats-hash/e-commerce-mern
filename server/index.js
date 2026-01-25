const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public/uploads directory
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// ========================================
// ROUTES
// ========================================

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

// Use routes
//ALL routes in userRoutes will be prefixed with /api/auth
app.use("/api/auth", authRoutes);

// All routes in userRoutes will be prefixed with /api/users
app.use("/api/users", userRoutes);
// All routes in productRoutes will be prefixed with /api/products
app.use("/api/products", productRoutes);
// All routes in orderRoutes will be prefixed with /api/orders
app.use("/api/orders", orderRoutes);
// All routes in uploadRoutes will be prefixed with /api/upload
app.use("/api/upload", uploadRoutes);

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});