import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    password: { type: String, required: false }, // sửa ở đây
    googleId: { type: String }, // thêm field này

    role: {
      type: String,
      enum: ["customer", "seller", "admin", "shipper"],
      default: "customer",
    },

    verified: { type: Boolean, default: false },
    addresses: [{ type: String }],

    otp: { type: String },
    otpExpire: { type: Date },
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
