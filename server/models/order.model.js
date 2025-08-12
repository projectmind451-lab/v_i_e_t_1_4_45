import mongoose from "mongoose";
const orderSchema = new mongoose.Schema(
  {
    // Use String to support both registered users (ObjectId as string) and guests (guest:<email>)
    userId: { type: String, required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
        quantity: { type: Number, required: true },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Address" },
    status: { type: String, default: "Order Placed" },
    paymentType: { type: String, required: true },
    isPaid: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);
const Order = mongoose.model("Order", orderSchema);
export default Order;
