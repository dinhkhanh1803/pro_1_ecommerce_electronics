import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        variantName: { type: String, default: "Default" },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ["Credit Card", "PayPal", "COD", "Bank Transfer", "VNPay", "MoMo"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "pending",
    },
    codRemitted: { type: Boolean, default: false },
    inventoryApplied: { type: Boolean, default: false },
    coupon: { type: String },
    vnpTxnRef: { type: String, index: true }, // Mã giao dịch VNPay để tra cứu khi callback
    momoOrderId: { type: String, index: true },
    momoRequestId: { type: String, index: true },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
