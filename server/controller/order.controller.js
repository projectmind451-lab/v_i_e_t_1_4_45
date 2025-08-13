import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import stripe from "stripe";
import Address from "../models/address.model.js";
import { sendOrderConfirmation, sendOrderUpdate, sendNewOrderNotificationToSeller } from "../services/mailer.js";

// Place order COD: /api/order/place
export const placeOrderCOD = async (req, res) => {
  try {
    let userId = req.user; // may be undefined for guests
    const { items, address } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ message: "No items provided", success: false });
    }

    // Normalize address id (support sending object or id)
    const addressId =
      typeof address === "object" && address !== null
        ? address._id || address.id
        : address;

    if (!addressId || typeof addressId !== "string") {
      return res
        .status(400)
        .json({ message: "Invalid address", success: false });
    }

    // If not authenticated, derive a deterministic guest userId from the address email
    let addrDoc = await Address.findById(addressId).lean();
    if (!addrDoc) {
      return res.status(400).json({ message: "Address not found", success: false });
    }
    if (!userId) {
      userId = `guest:${addrDoc.email}`;
    }
    // calculate amount using items (batch fetch products to avoid N+1 queries)
    const productIds = items.map((it) => it.product);
    const products = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(products.map((p) => [String(p._id), p]));
    let amount = 0;
    for (const item of items) {
      if (!item?.product || !item?.quantity) {
        return res.status(400).json({ message: "Invalid item in cart", success: false });
      }
      const product = productMap.get(String(item.product));
      if (!product) {
        return res.status(400).json({ message: "Product not found", success: false });
      }
      amount += Number(product.offerPrice) * Number(item.quantity);
    }

    // Add tex charfe 2%
    amount += Math.floor((amount * 2) / 100);
    const orderDoc = await Order.create({
      userId,
      items,
      address: addressId,
      amount,
      paymentType: "COD",
      isPaid: false,
    });
    // Send confirmation email (best-effort, non-blocking)
    const addr = addrDoc; // reuse fetched address
    if (addr?.email) {
      sendOrderConfirmation({
        to: addr.email,
        orderId: orderDoc._id.toString(),
        amount,
        name: `${addr.firstName || ""} ${addr.lastName || ""}`.trim(),
      }).catch((e) => console.error("Failed to send order confirmation (COD):", e.message));
    }
    // Notify seller/admin (best-effort)
    sendNewOrderNotificationToSeller({
      orderId: orderDoc._id.toString(),
      amount,
      itemsCount: items.length,
      customerName: `${addrDoc.firstName || ""} ${addrDoc.lastName || ""}`.trim(),
      customerEmail: addrDoc.email,
      paymentType: "COD",
    }).catch((e) => console.error("Failed to notify seller about new COD order:", e.message));
    res
      .status(201)
      .json({ message: "Order placed successfully", success: true });
  } catch (error) {
    console.error("placeOrderCOD error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.user;
    const { items, address } = req.body;
    const {origin} = req.headers;
    if (!address || !items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid order details", success: false });
    }

    // Batch fetch products
    const pIds = items.map((it) => it.product);
    const pDocs = await Product.find({ _id: { $in: pIds } }).lean();
    const pMap = new Map(pDocs.map((p) => [String(p._id), p]));
    const productData = [];
    let amount = 0;
    for (const it of items) {
      const p = pMap.get(String(it.product));
      if (!p) {
        return res.status(400).json({ message: "Product not found", success: false });
      }
      productData.push({ name: p.name, price: Number(p.offerPrice), quantity: Number(it.quantity) });
      amount += Number(p.offerPrice) * Number(it.quantity);
    }

    // Add tex charfe 2%
    amount += Math.floor((amount * 2) / 100);
    const order = await Order.create({
      userId,
      items,
      address,
      amount,
      paymentType: "Online",
      isPaid: true,
    });

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map((item)=>{
      return{
        price_data:{
          currency:"usd",
          product_data:{
            name:item.name
          },
          unit_amount:Math.floor(item.price * item.price * 0.02)* 100,
        },
        quantity:item.quantity
      };
    });

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode:"payment",
      success_url:`${origin}/loader?next=/my-orders`,
      cancel_url:`${origin}/cart`,
      metadata:{
        orderId:order._id.toString(),
        userId,
      },
    });

    // Send confirmation email
    Address.findById(address).lean().then((addr) => {
      if (addr?.email) {
        sendOrderConfirmation({
          to: addr.email,
          orderId: order._id.toString(),
          amount,
          name: `${addr.firstName || ""} ${addr.lastName || ""}`.trim(),
        }).catch((e) => console.error("Failed to send order confirmation (Stripe):", e.message));
      }
    }).catch((e) => console.error("Address fetch failed (Stripe):", e.message));

    // Notify seller/admin (best-effort)
    Address.findById(address).lean().then((addr) => {
      sendNewOrderNotificationToSeller({
        orderId: order._id.toString(),
        amount,
        itemsCount: items.length,
        customerName: `${addr?.firstName || ""} ${addr?.lastName || ""}`.trim(),
        customerEmail: addr?.email,
        paymentType: "Online",
      }).catch((e) => console.error("Failed to notify seller about new Online order:", e.message));
    }).catch((e) => console.error("Address fetch failed (seller notify):", e.message));

    res
      .status(201)
      .json({ message: "Order placed successfully", success: true, url: session.url, });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// oredr details for individual user :/api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// get all orders for admin :/api/order/all
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// cancel order by user: /api/order/cancel/:orderId
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user;
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const notCancellable = ["Shipped", "Delivered", "Cancelled"];
    if (order.status && notCancellable.includes(order.status)) {
      return res
        .status(400)
        .json({ success: false, message: `Order cannot be cancelled in ${order.status} status` });
    }

    order.status = "Cancelled";
    await order.save();

    // Notify user
    try {
      const addr = await Address.findById(order.address);
      if (addr?.email) {
        await sendOrderUpdate({
          to: addr.email,
          orderId: order._id.toString(),
          status: "Cancelled",
          name: `${addr.firstName || ""} ${addr.lastName || ""}`.trim(),
        });
      }
    } catch (e) {
      console.error("Failed to send order cancellation email:", e.message);
    }

    return res.json({ success: true, message: "Order cancelled", order });
  } catch (error) {
    console.error("cancelOrder error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// seller: update order status and notify customer via email
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found", success: false });
    }

    // Check if the order belongs to the seller
    // Note: This assumes the order has a seller reference. Adjust according to your schema.
    // if (String(order.seller) !== String(req.user._id)) {
    //   return res.status(403).json({ message: "Not authorized", success: false });
    // }

    order.status = status;
    await order.save();

    // Get the address to get the customer's email
    const address = await Address.findById(order.address);
    
    // Send email notification to customer if we have their email
    if (address && address.email) {
      try {
        await sendOrderUpdate({
          to: address.email,
          orderId: order._id.toString(),
          status: status,
          name: `${address.firstName || ''} ${address.lastName || ''}`.trim() || 'Customer'
        });
        console.log(`Order status update email sent to ${address.email}`);
      } catch (error) {
        console.error('Failed to send order status update email:', error);
        // Don't fail the request if email sending fails
      }
    } else {
      console.log('No email address found for order notification');
    }

    res.status(200).json({
      message: "Order status updated successfully",
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: error.message, success: false });
  }
};

// Update payment status: /api/order/:orderId/payment
export const updatePaymentStatus = async (req, res) => {
  try {
    const { isPaid } = req.body;
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found", success: false });
    }

    // Update payment status
    order.isPaid = isPaid;
    
    // If marking as paid, set payment date to now
    if (isPaid && !order.paidAt) {
      order.paidAt = new Date();
    }
    
    await order.save();

    res.status(200).json({
      message: `Payment status updated to ${isPaid ? 'Paid' : 'Pending'}`,
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: error.message, success: false });
  }
};
