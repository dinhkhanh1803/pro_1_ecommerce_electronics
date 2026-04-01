import express from "express";
import {
  getProductReviews,
  getSellerReviews,
  addReview,
  replyReview,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: Get product reviews
router.get("/product/:id", getProductReviews);

// Protected: Customer adds a review
router.post("/", protect, addReview);

// Protected: Seller gets all their product reviews
router.get("/seller", protect, authorize("seller", "admin"), getSellerReviews);

// Protected: Seller replies to a review
router.put("/:id/reply", protect, authorize("seller", "admin"), replyReview);

export default router;
