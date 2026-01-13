const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ========================================
// PROTECT ROUTES - Check if user is authenticated
// ========================================
const protect = async (req, res, next) => {
  let token;

  // Check if token exists in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      // Format: "Bearer <token>"
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select("-password");

      next(); // Continue to next middleware/controller
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ========================================
// ADMIN ONLY - Check if user is admin
// ========================================
const admin = (req, res, next) => {
  // This middleware should be used AFTER protect middleware
  // protect middleware sets req.user
  if (req.user && req.user.isAdmin) {
    next(); // User is admin, continue
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

module.exports = { protect, admin };