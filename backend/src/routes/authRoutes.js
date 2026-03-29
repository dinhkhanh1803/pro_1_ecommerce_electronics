import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  verifyOtp,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser); // Bước 1: gửi OTP
router.post("/register/verify-otp", verifyOtp); // Bước 2: xác thực OTP

router.post("/login", loginUser);
router.get("/profile", protect, getProfile);

export default router;
