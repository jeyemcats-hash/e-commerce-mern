const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define what a User looks like in the database
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,  // Must provide a name
    },
    email: {
      type: String,
      required: true,
      unique: true,    // No two users can have the same email
      lowercase: true, // Convert to lowercase automatically
    },
    password: {
      type: String,
      required: true,
      minlength: 6,    // Password must be at least 6 characters
    },
    isAdmin: {
      type: Boolean,
      default: false,  // By default, users are NOT admins
    },
  },
  {
    timestamps: true,  // Automatically adds createdAt and updatedAt fields
  }
);

// MIDDLEWARE: Hash password before saving to database
userSchema.pre("save", async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified("password")) {
    return next();
  }

  // Generate salt and hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// METHOD: Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User model from the schema
const User = mongoose.model("User", userSchema);

module.exports = User;