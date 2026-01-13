const mongoose = require("mongoose");

// Define what an Order looks like in the database
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  // Links to User model
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",  // Links to Product model
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        currency: {
          type: String,
          default: "PHP",
        },
      },
    ],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: "Philippines" },
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Cash on Delivery", "Credit Card", "PayPal", "GCash"],
      default: "Cash on Delivery",
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,  // Adds createdAt and updatedAt
  }
);

// Create the Order model from the schema
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;