import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["percentage", "fixed", "shipping"],
      required: true,
    },
    value: {
      type: Number,
      default: 0, // 0 nghĩa là miễn phí ship (chỉ dùng cho type='shipping')
    },
    minOrder: {
      type: Number,
      default: 0,
    },
    usageLimit: {
      type: Number,
      default: null, // null = không giới hạn
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["active", "draft", "cancelled"],
      default: "active",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showOnHome: {
      type: Boolean,
      default: false,
    },
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
