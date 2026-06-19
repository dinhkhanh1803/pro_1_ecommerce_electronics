import mongoose from "mongoose";

const chatbotLogSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    role: {
      type: String,
      enum: ["user", "bot", "system"],
      required: true,
    },
    content: { type: String, required: true },
    intent: { type: String, default: "unknown" },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String },
        price: { type: Number },
      },
    ],
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    escalated: { type: Boolean, default: false },
    staffReceiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

export default mongoose.model("ChatbotLog", chatbotLogSchema);
