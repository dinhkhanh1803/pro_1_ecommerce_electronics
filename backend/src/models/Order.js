import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
    paymentMethod: { type: String, enum: ["Credit Card", "PayPal", "COD", "Bank Transfer", "VNPay"], default: "COD" },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed", "refunded"], default: "pending" },
    orderStatus: { type: String, enum: ["pending", "processing", "shipped", "delivered", "cancelled", "returned"], default: "pending" },
    codRemitted: { type: Boolean, default: false },
    coupon: { type: String },
    vnpTxnRef: { type: String, index: true }, // Mã giao dịch VNPay để tra cứu khi callback
  },
  { timestamps: true }
);

orderSchema.pre("save", async function () {
  if (this.isModified("orderStatus") && this.orderStatus === "cancelled") {
    // 1. Hoàn kho cho sản phẩm/biến thể
    for (const item of this.products) {
      if (item.product) {
        const product = await mongoose.model("Product").findById(item.product);
        if (product) {
          const variantName = String(item.variantName || "Default");
          const variantIndex = Array.isArray(product.variants)
            ? product.variants.findIndex((v) => String(v.name) === variantName)
            : -1;

          if (variantIndex >= 0) {
            product.variants[variantIndex].stock = (product.variants[variantIndex].stock || 0) + item.quantity;
            await product.save();
          }
        }
      }
    }

    // 2. Hoàn lượt sử dụng coupon
    if (this.coupon) {
      const coupon = await mongoose.model("Coupon").findOne({ code: this.coupon.toUpperCase() });
      if (coupon) {
        coupon.usageCount = Math.max(0, coupon.usageCount - 1);
        await coupon.save();
      }
    }
  }
});

export default mongoose.model("Order", orderSchema);
