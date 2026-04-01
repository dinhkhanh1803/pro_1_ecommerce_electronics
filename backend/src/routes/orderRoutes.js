import express from "express";
import {
  getMyOrders,
  getSellerOrders,
  createOrder,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/orders/my-orders - Customer gets their order history
router.get("/my-orders", protect, getMyOrders);

// GET /api/orders/seller - Seller gets received orders
router.get("/seller", protect, authorize("seller", "admin"), getSellerOrders);

// POST /api/orders - Submit a new order
router.post("/", protect, createOrder);

// PUT /api/orders/:id/status - Update order status (Seller/Admin)
router.put("/:id/status", protect, authorize("seller", "admin"), updateOrderStatus);

export default router;
