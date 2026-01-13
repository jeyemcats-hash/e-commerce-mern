const User = require("../models/User");

// ========================================
// CREATE - Register a new user
// ========================================
const createUser = async (req, res) => {
  try {
    // Get data from request body
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // In production, you should hash this!
    });

    // Send success response
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// READ - Get all users
// ========================================
const getAllUsers = async (req, res) => {
  try {
    // Get all users from database (excluding passwords)
    const users = await User.find().select("-password");

    res.status(200).json({
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// READ - Get single user by ID
// ========================================
const getUserById = async (req, res) => {
  try {
    // Get user ID from URL parameters
    const { id } = req.params;

    // Find user by ID (excluding password)
    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// UPDATE - Update user by ID
// ========================================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, isAdmin } = req.body;

    // Find user and update
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, isAdmin },
      { new: true, runValidators: true } // Return updated user & validate data
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// DELETE - Delete user by ID
// ========================================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export all functions
module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};