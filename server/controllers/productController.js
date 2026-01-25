const Product = require("../models/Product");

// ========================================
// CREATE - Add a new product
// ========================================
const createProduct = async (req, res) => {
  try {
    // Get data from request body
    const { name, description, price, category, stock, image, images = [] } = req.body;

    // Normalize images array and primary image
    const normalizedImages = Array.isArray(images)
      ? images.filter(Boolean)
      : typeof images === "string"
        ? images.split(/\r?\n|,/).map((url) => url.trim()).filter(Boolean)
        : [];
    const coverImage = image || normalizedImages[0];

    // Create new product (auto-approve because only admins can reach here)
    const product = await Product.create({
      name,
      description,
      price: Number(price),
      category,
      stock,
      image: coverImage,
      images: normalizedImages,
      isApproved: true,
      createdBy: req.user?._id,
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
    // Get approved products that were created by an admin
    const products = await Product.find({ isApproved: true, createdBy: { $exists: true } });

    // Ensure all image URLs are absolute
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const productsWithAbsoluteUrls = products.map(product => {
      const productObj = product.toObject();
      
      // Ensure cover image is absolute URL
      if (productObj.image && !productObj.image.startsWith('http')) {
        productObj.image = `${baseUrl}${productObj.image}`;
      }
      
      // Ensure product images are absolute URLs
      if (productObj.images && Array.isArray(productObj.images)) {
        productObj.images = productObj.images.map(img => 
          img.startsWith('http') ? img : `${baseUrl}${img}`
        );
      }
      
      return productObj;
    });

    res.status(200).json({
      count: productsWithAbsoluteUrls.length,
      products: productsWithAbsoluteUrls,
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
    const { name, description, price, category, stock, image, images, inStock } = req.body;

    // Normalize images if provided
    const normalizedImages =
      images === undefined
        ? undefined
        : Array.isArray(images)
          ? images.filter(Boolean)
          : typeof images === "string"
            ? images.split(/\r?\n|,/).map((url) => url.trim()).filter(Boolean)
            : [];

    // Find product and update
    const product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price: price !== undefined ? Number(price) : undefined,
        category,
        stock,
        image,
        images: normalizedImages,
        inStock,
      },
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