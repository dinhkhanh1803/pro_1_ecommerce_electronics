import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Tạo token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Đăng ký user
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email đã tồn tại" });

    user = await User.create({ name, email, password, role });
    const token = generateToken(user);

    res.status(201).json({ token, user: { id: user._id, name, email, role } });
  } catch (error) {
    next(error); // phải gọi next với lỗi
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "Email hoặc password không đúng" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Email hoặc password không đúng" });

    const token = generateToken(user);
    res.status(201).json({
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
