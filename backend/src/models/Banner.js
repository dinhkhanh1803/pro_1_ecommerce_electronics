import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: { type: String }, // NEW
    image: { type: String, required: true },
    link: { type: String, default: "/" },
    cta: { type: String, default: "Shop Now" }, // NEW
    status: { type: String, enum: ["active", "draft"], default: "active" },
    type: { type: String, enum: ["hero", "promo_mid", "promo_bottom"], default: "hero" }, // NEW
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);
