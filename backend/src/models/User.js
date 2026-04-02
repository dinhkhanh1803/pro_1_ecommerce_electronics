import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },

    password: { type: String, required: false },
    googleId: { type: String },

    role: {
      type: String,
      enum: ["customer", "seller", "admin", "shipper"],
      default: "customer",
    },

    status: {
      type: String,
      enum: ["active", "locked"],
      default: "active",
    },

    verified: { type: Boolean, default: false },
    address: { type: String },

    otp: { type: String },
    otpExpire: { type: Date },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true },
);

// Hash password trước khi lưu
userSchema.pre("save", async function () {
  if (!this.password) return;
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// So sánh password khi login
userSchema.methods.matchPassword = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
