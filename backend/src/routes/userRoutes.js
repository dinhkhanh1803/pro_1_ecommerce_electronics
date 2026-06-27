import express from "express";
import {
  getAllUsers,
  toggleUserLock,
  updateUserRole,
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
  getProfile,
  updateProfile,
  getShippersList,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/shippers", protect, authorize("admin", "warehouse", "seller"), getShippersList);
router.get("/", protect, authorize("admin"), getAllUsers);
router.put("/:id/lock", protect, authorize("admin"), toggleUserLock);
router.put("/:id/role", protect, authorize("admin"), updateUserRole);

// Wishlist routes (yêu cầu đăng nhập)
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, toggleWishlist);
router.delete("/wishlist/:productId", protect, removeFromWishlist);

// Profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;

