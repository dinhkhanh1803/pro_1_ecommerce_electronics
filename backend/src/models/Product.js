import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String },
    images: [{ type: String }],
    variants: [
      {
        name: { type: String },
        priceAdd: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "pending", "active", "rejected"],
      default: "pending",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sales: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
