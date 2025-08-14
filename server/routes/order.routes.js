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
  deleteOrder,
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
    console.log("Seller orders request:", { page, limit, search, status });

    // Base query to only show valid orders (COD or paid online orders)
    let query = {
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    };

    // Filter by status first
    if (status) {
      query.status = status;
    }

    console.log("Base query:", JSON.stringify(query));

    // Get total count first
    const total = await Order.countDocuments(query);
    console.log("Total orders found:", total);

    // Get orders without population first to avoid ObjectId cast errors
    let orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    console.log("Orders fetched:", orders.length);

    // Manually populate with error handling
    const mongoose = await import('mongoose');
    const Address = (await import('../models/address.model.js')).default;
    const Product = (await import('../models/product.model.js')).default;

    for (let order of orders) {
      // Safely populate address
      try {
        if (order.address && mongoose.Types.ObjectId.isValid(order.address)) {
          const address = await Address.findById(order.address).lean();
          order.address = address || {
            firstName: 'Unknown',
            lastName: 'Customer',
            email: 'unknown@email.com',
            phone: 'N/A',
            street: 'N/A',
            city: 'N/A',
            state: 'N/A',
            zipCode: 'N/A',
            country: 'N/A'
          };
        } else {
          console.warn(`Invalid address ID for order ${order._id}:`, order.address);
          order.address = {
            firstName: 'Unknown',
            lastName: 'Customer',
            email: 'unknown@email.com',
            phone: 'N/A',
            street: 'N/A',
            city: 'N/A',
            state: 'N/A',
            zipCode: 'N/A',
            country: 'N/A'
          };
        }
      } catch (addressError) {
        console.error(`Error populating address for order ${order._id}:`, addressError);
        order.address = {
          firstName: 'Unknown',
          lastName: 'Customer',
          email: 'unknown@email.com',
          phone: 'N/A',
          street: 'N/A',
          city: 'N/A',
          state: 'N/A',
          zipCode: 'N/A',
          country: 'N/A'
        };
      }

      // Safely populate products
      if (order.items && Array.isArray(order.items)) {
        for (let item of order.items) {
          try {
            if (item.product && mongoose.Types.ObjectId.isValid(item.product)) {
              const product = await Product.findById(item.product).select('name image offerPrice').lean();
              item.product = product || {
                name: 'Unknown Product',
                image: [],
                offerPrice: 0
              };
            } else {
              console.warn(`Invalid product ID for order ${order._id}:`, item.product);
              item.product = {
                name: 'Unknown Product',
                image: [],
                offerPrice: 0
              };
            }
          } catch (productError) {
            console.error(`Error populating product for order ${order._id}:`, productError);
            item.product = {
              name: 'Unknown Product',
              image: [],
              offerPrice: 0
            };
          }
        }
      }
    }

    console.log("Orders after population:", orders.length);

    // Apply search filter after population
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      orders = orders.filter(order => {
        // Search in customer name
        const customerMatch = 
          (order.address?.firstName && searchRegex.test(order.address.firstName)) ||
          (order.address?.lastName && searchRegex.test(order.address.lastName)) ||
          (order.address?.email && searchRegex.test(order.address.email));

        // Search in product names
        const productMatch = order.items?.some(item => 
          item.product?.name && searchRegex.test(item.product.name)
        );

        return customerMatch || productMatch;
      });
    }

    console.log("Orders after search filter:", orders.length);

    res.json({
      success: true,
      orders,
      total: search ? orders.length : total,
      page: Number(page),
      pages: Math.ceil((search ? orders.length : total) / limit),
    });
  } catch (error) {
    console.error("Seller orders error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE order status (sends email notification)
router.put("/:orderId/status", authSeller, updateOrderStatus);

// Update payment status (seller)
router.put("/:orderId/payment", authSeller, updatePaymentStatus);

// Delete an order (seller)
router.delete("/:orderId", authSeller, deleteOrder);

// Admin/Seller: Get all orders
router.get("/all", authSeller, getAllOrders);

export default router;
