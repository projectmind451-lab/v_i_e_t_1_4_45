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

    // Get orders with only required fields to reduce payload
    let orders = await Order.find(query)
      .select('items address amount status isPaid createdAt paymentType')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    console.log("Orders fetched:", orders.length);

    // Batch populate addresses and products to avoid N+1 queries
    const mongoose = await import('mongoose');
    const Address = (await import('../models/address.model.js')).default;
    const Product = (await import('../models/product.model.js')).default;

    const addressIds = [
      ...new Set(
        orders
          .map(o => o.address)
          .filter(id => id && mongoose.Types.ObjectId.isValid(id))
          .map(id => id.toString())
      ),
    ];
    const productIds = [
      ...new Set(
        orders.flatMap(o => (o.items || [])
          .map(i => i.product)
          .filter(id => id && mongoose.Types.ObjectId.isValid(id))
          .map(id => id.toString())
        )
      ),
    ];

    const [addressDocs, productDocs] = await Promise.all([
      addressIds.length ? Address.find({ _id: { $in: addressIds } }).lean() : [],
      productIds.length ? Product.find({ _id: { $in: productIds } }).select('name image offerPrice').lean() : [],
    ]);

    const addressMap = new Map(addressDocs.map(a => [a._id.toString(), a]));
    const productMap = new Map(productDocs.map(p => [p._id.toString(), p]));

    const defaultAddress = {
      firstName: 'Unknown',
      lastName: 'Customer',
      email: 'unknown@email.com',
      phone: 'N/A',
      street: 'N/A',
      city: 'N/A',
      state: 'N/A',
      zipCode: 'N/A',
      country: 'N/A',
    };
    const defaultProduct = { name: 'Unknown Product', image: [], offerPrice: 0 };

    for (const order of orders) {
      const addrId = order.address && order.address.toString();
      order.address = (addrId && addressMap.get(addrId)) || defaultAddress;
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const pid = item.product && item.product.toString();
          item.product = (pid && productMap.get(pid)) || defaultProduct;
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
