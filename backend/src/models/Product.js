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
    // Kept for backward compatibility, always derived from total variant stock.
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
    sales: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("totalVariantStock").get(function totalVariantStock() {
  if (!Array.isArray(this.variants) || this.variants.length === 0) return 0;
  return this.variants.reduce((sum, variant) => sum + Math.max(0, Number(variant.stock) || 0), 0);
});

productSchema.virtual("isInStock").get(function isInStock() {
  return this.totalVariantStock > 0;
});

productSchema.pre("save", function syncStockFromVariants() {
  this.stock = this.totalVariantStock;
});

productSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], async function syncUpdatedStock() {
  const update = this.getUpdate() || {};
  const setPayload = update.$set || update;
  if (!setPayload || !Object.prototype.hasOwnProperty.call(setPayload, "variants")) return;

  const variants = setPayload.variants;
  const totalVariantStock = Array.isArray(variants)
    ? variants.reduce((sum, variant) => sum + Math.max(0, Number(variant?.stock) || 0), 0)
    : 0;

  if (update.$set) {
    update.$set.stock = totalVariantStock;
  } else {
    update.stock = totalVariantStock;
  }
  this.setUpdate(update);
});

export default mongoose.model("Product", productSchema);
