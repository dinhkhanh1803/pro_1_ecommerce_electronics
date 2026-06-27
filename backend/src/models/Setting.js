import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
  {
    siteName: { type: String, default: "ShopHub" },
    supportEmail: { type: String, default: "support@shophub.com" },
    siteDescription: { type: String },
    primaryLogo: { type: String },
    favicon: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
