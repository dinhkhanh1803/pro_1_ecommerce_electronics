import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    type: { type: String, enum: ["payment", "payout", "refund"], required: true },
    amount: { type: Number, required: true },
    fee: { type: Number, default: 0 },
    net: { type: Number, required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "processing", "completed", "failed"], default: "completed" },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
