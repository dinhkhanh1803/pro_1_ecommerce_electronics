import express from "express";
import {
  getMyOrders,
  getSellerOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getShipperOrders,
  remitCodOrders,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/orders/my-orders - Customer gets their order history
router.get("/my-orders", protect, getMyOrders);

// GET /api/orders/:id - Get specific order by id
router.get("/:id", protect, getOrderById);

// GET /api/orders/seller - Seller gets received orders
router.get("/seller", protect, authorize("seller", "admin"), getSellerOrders);

// POST /api/orders - Submit a new order
router.post("/", protect, createOrder);

// GET /api/orders/shipper - Shipper gets assigned orders
router.get("/shipper", protect, authorize("shipper", "admin"), getShipperOrders);

// PUT /api/orders/cod-remit - Shipper remits COD to platform
router.put("/cod-remit", protect, authorize("shipper", "admin"), remitCodOrders);

// PUT /api/orders/:id/cancel - Customer cancels pending/processing order
router.put("/:id/cancel", protect, cancelOrder);

// PUT /api/orders/:id/status - Update order status (Seller/Admin/Shipper)
router.put("/:id/status", protect, authorize("seller", "admin", "shipper"), updateOrderStatus);

export default router;
