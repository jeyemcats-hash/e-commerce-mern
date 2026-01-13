const Product = require("../models/Product");

// ========================================
// CREATE - Add a new product
// ========================================
const createProduct = async (req, res) => {
  try {
    // Get data from request body
    const { name, description, price, category, stock, image } = req.body;

    // Create new product
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image,
    });

    // Send success response
    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// READ - Get all products
// ========================================
const getAllProducts = async (req, res) => {
  try {
    // Get all products from database
    const products = await Product.find();

    res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// READ - Get single product by ID
// ========================================
const getProductById = async (req, res) => {
  try {
    // Get product ID from URL parameters
    const { id } = req.params;

    // Find product by ID
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// UPDATE - Update product by ID
// ========================================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock, image, inStock } = req.body;

    // Find product and update
    const product = await Product.findByIdAndUpdate(
      id,
      { name, description, price, category, stock, image, inStock },
      { new: true, runValidators: true } // Return updated product & validate data
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// DELETE - Delete product by ID
// ========================================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete product
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export all functions
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};