import express from "express";
import {
  getAllUsers,
  toggleUserLock,
  getWishlist,
  toggleWishlist,
  removeFromWishlist,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getAllUsers);
router.put("/:id/lock", protect, authorize("admin"), toggleUserLock);

// Wishlist routes (yêu cầu đăng nhập)
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/:productId", protect, toggleWishlist);
router.delete("/wishlist/:productId", protect, removeFromWishlist);

export default router;

