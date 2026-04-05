import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendEmail } from "../utils/sendEmail.js";
import { otpStore } from "../utils/tmpOtpStore.js";
import crypto from "crypto";

// Tạo token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Bước 1: đăng ký → gửi OTP
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email đã tồn tại" });

    // Tạo OTP 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpire = Date.now() + parseInt(process.env.OTP_EXPIRE || "300000"); // 5 phút

    // Lưu tạm vào memory
    otpStore[email] = { name, email, password, role, otp, otpExpire };

    // Gửi OTP qua email
    await sendEmail(email, "ShopHub OTP Verification", `Your OTP is: ${otp}`);

    res.status(201).json({ message: "OTP đã được gửi đến email của bạn" });
  } catch (error) {
    next(error);
  }
};

// Bước 2: xác thực OTP
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const data = otpStore[email];
    if (!data)
      return res.status(400).json({ message: "Email chưa đăng ký OTP" });

    if (data.otp !== otp)
      return res.status(400).json({ message: "OTP không đúng" });
    if (Date.now() > data.otpExpire)
      return res.status(400).json({ message: "OTP đã hết hạn" });

    // Tạo user thật
    const user = await User.create({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      verified: true,
    });

    // Xóa khỏi tạm thời
    delete otpStore[email];

    // Tạo token JWT
    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.verified)
      return res
        .status(400)
        .json({ message: "Email chưa xác thực hoặc không tồn tại" });

    if (user.status === "locked") {
      return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Email hoặc password không đúng" });

    const token = generateToken(user);
    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get profile
export const getProfile = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Chưa đăng nhập" });
  res.json({ user: req.user });
};

// Gửi link reset password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Không tiết lộ email có tồn tại hay không
    if (!user) {
      return res.json({
        message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
      });
    }

    // Tạo token ngẫu nhiên
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token trước khi lưu DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 phút

    await user.save();

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail(
      user.email,
      "ShopHub Reset Password",
      `Click vào link để đặt lại mật khẩu: ${resetUrl}`,
    );

    res.json({
      message: "Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.",
    });
  } catch (error) {
    next(error);
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }

    // Hash mật khẩu mới
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    next(error);
  }
};
