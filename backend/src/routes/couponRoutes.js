import express from "express";
import {
  getMyCoupons,
  createCoupon,
  deleteCoupon,
  updateCoupon,
  validateCoupon,
} from "../controllers/couponController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: validate mã giảm giá (người mua sử dụng)
router.post("/validate", protect, validateCoupon);

// Seller/Admin: quản lý mã giảm giá
router.get("/", protect, authorize("seller", "admin"), getMyCoupons);
router.post("/", protect, authorize("seller", "admin"), createCoupon);
router.put("/:id", protect, authorize("seller", "admin"), updateCoupon);
router.delete("/:id", protect, authorize("seller", "admin"), deleteCoupon);

export default router;
