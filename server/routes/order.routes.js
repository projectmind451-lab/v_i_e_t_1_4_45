import express from "express";
import { authSeller } from "../middlewares/authSeller.js";
import authUser from "../middlewares/authUser.js";
import Order from "../models/order.model.js";
import {
  placeOrderCOD,
  placeOrderStripe,
  getUserOrders,
  getAllOrders,
  cancelOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from "../controller/order.controller.js";

const router = express.Router();

// PUBLIC USER ENDPOINTS
// Place order - Cash on Delivery
router.post("/cod", placeOrderCOD);

// Place order - Stripe Checkout
router.post("/stripe", authUser, placeOrderStripe);

// Get current user's orders
router.get("/user", authUser, getUserOrders);

// Cancel an order (user)
router.put("/cancel/:orderId", authUser, cancelOrder);

// GET all orders for seller with pagination, search, and filter
router.get("/seller", authSeller, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "" } = req.query;

    const query = {};

    // Search by customer name or product name
    if (search) {
      query.$or = [
        { "address.firstName": { $regex: search, $options: "i" } },
        { "address.lastName": { $regex: search, $options: "i" } },
        { "items.product.name": { $regex: search, $options: "i" } },
      ];
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("items.product address")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      orders,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE order status (sends email notification)
router.put("/:orderId/status", authSeller, updateOrderStatus);

// Update payment status (seller)
router.put("/:orderId/payment", authSeller, updatePaymentStatus);

// Admin/Seller: Get all orders
router.get("/all", authSeller, getAllOrders);

export default router;
