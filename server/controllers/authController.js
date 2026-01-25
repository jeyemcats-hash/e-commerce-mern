const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ========================================
// HELPER: Generate JWT Token
// ========================================
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token expires in 30 days
  });
};

// ========================================
// ADMIN LOGIN - Authenticate admin only
// ========================================
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Validate credentials and admin flag
    const isValid = user && (await user.comparePassword(password));
    if (!isValid || !user.isAdmin) {
      return res.status(401).json({ message: "Invalid credentials or not authorized" });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Admin login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// REGISTER - Create new user account
// ========================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user (password will be hashed automatically by pre-save middleware)
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id);

    // Send success response with token
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// LOGIN - Authenticate user (regular users only)
// ========================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists and password is correct
    if (user && (await user.comparePassword(password))) {
      // Reject if user is admin
      if (user.isAdmin) {
        return res.status(403).json({ 
          message: "Admins must use the admin portal. Please visit /admin-login" 
        });
      }

      // Generate token
      const token = generateToken(user._id);

      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// GET PROFILE - Get current user's profile
// ========================================
const getProfile = async (req, res) => {
  try {
    // req.user is set by auth middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user in consistent format with login endpoints
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  register,
  login,
  adminLogin,
  getProfile,
};