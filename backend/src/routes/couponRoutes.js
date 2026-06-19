import express from "express";
import {
  getMyCoupons,
  createCoupon,
  deleteCoupon,
  updateCoupon,
  validateCoupon,
  getPinnedCoupon,
} from "../controllers/couponController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: lấy mã giảm giá được ghim lên trang chủ
router.get("/pinned", getPinnedCoupon);

// Public: validate mã giảm giá (người mua sử dụng)
router.post("/validate", protect, validateCoupon);

// Admin/Warehouse: quản lý mã giảm giá
router.get("/", protect, authorize("admin", "warehouse"), getMyCoupons);
router.post("/", protect, authorize("admin", "warehouse"), createCoupon);
router.put("/:id", protect, authorize("admin", "warehouse"), updateCoupon);
router.delete("/:id", protect, authorize("admin", "warehouse"), deleteCoupon);

export default router;
