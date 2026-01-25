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

      console.log('Protect middleware - Found user:', req.user?.name, 'isAdmin:', req.user?.isAdmin);

      if (!req.user) {
        return res.status(401).json({ message: "User not found" });
      }

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
  console.log('Admin middleware check - User:', req.user?.name, 'isAdmin:', req.user?.isAdmin);
  
  if (req.user && req.user.isAdmin === true) {
    next(); // User is admin, continue
  } else {
    console.log('Admin check FAILED - User is not admin');
    res.status(403).json({ message: "Not authorized as admin" });
  }
};

module.exports = { protect, admin };