const mongoose = require("mongoose");

// Define what a Product looks like in the database
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,  // Removes whitespace from both ends
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,  // Price cannot be negative
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Clothing",
        "Books",
        "Home & Garden",
        "Sports",
        "Toys",
        "Food",
        "Other"
      ],  // Only these categories are allowed
    },
    currency: {
      type: String,
      default: "PHP",
      enum: ["PHP", "USD", "EUR", "JPY"]  // Supported currencies
    },
    stock: {
      type: Number,
      required: true,
      min: 0,  // Stock cannot be negative
      default: 0,
    },
    image: {
      type: String,
      default: "https://via.placeholder.com/300",  // Placeholder image
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,  // Automatically adds createdAt and updatedAt
  }
);

// Create the Product model from the schema
const Product = mongoose.model("Product", productSchema);

module.exports = Product;