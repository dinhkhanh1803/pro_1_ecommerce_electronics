import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  verifyOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", registerUser); // Bước 1: gửi OTP
router.post("/register/verify-otp", verifyOtp); // Bước 2: xác thực OTP

// Redirect tới Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user._id,
        name: req.user.name,
        role: req.user.role,
        email: req.user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE },
    );

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/oauth-success?token=${token}`);
  },
);

router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.get("/profile", protect, getProfile);

export default router;
