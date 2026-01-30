const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

// ========================================
// CREATE - Place a new order
// ========================================
const createOrder = async (req, res) => {
  try {
    const {
      user,
      orderItems,
      shippingAddress,
      paymentMethod,
    } = req.body;

    // Validate that order has items
    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No order items provided" });
    }

    // Enrich orderItems with product names from the database
    let totalPrice = 0;
    const enrichedOrderItems = [];
    
    for (let item of orderItems) {
      // Fetch product details to get the name
      const product = await Product.findById(item.product);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.product}` });
      }

      enrichedOrderItems.push({
        product: item.product,
        name: product.name,  // Get the name from the product
        quantity: item.quantity,
        price: item.price,
        currency: item.currency || "PHP",
      });

      totalPrice += item.price * item.quantity;
    }

    // Create the order with enriched items
    const order = await Order.create({
      user,
      orderItems: enrichedOrderItems,
      shippingAddress,
      paymentMethod,
      totalPrice,
    });

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// READ - Get all orders
// ========================================
const getAllOrders = async (req, res) => {
  try {
    // Get all orders and populate user and product details
    const orders = await Order.find()
      .populate("user", "name email")  // Get user's name and email
      .populate("orderItems.product", "name price");  // Get product details

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// READ - Get single order by ID
// ========================================
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find order and populate related data
    const order = await Order.findById(id)
      .populate("user", "name email")
      .populate("orderItems.product", "name price category");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// READ - Get orders by user ID
// ========================================
const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all orders for this user
    const orders = await Order.find({ user: userId })
      .populate("orderItems.product", "name price");

    res.status(200).json({
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// UPDATE - Update order status
// ========================================
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    // Find and update order
    const order = await Order.findByIdAndUpdate(
      id,
      { 
        orderStatus, 
        paymentStatus,
        // If delivered, set deliveredAt date
        ...(orderStatus === "Delivered" && { deliveredAt: Date.now() })
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ========================================
// DELETE - Cancel/Delete order
// ========================================
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Export all functions
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
};