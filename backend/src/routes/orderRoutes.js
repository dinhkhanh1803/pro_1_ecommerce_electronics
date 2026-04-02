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
  getAllOrders,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ SPECIFIC routes must come BEFORE dynamic /:id route

// GET /api/orders/my-orders - Customer gets their order history
router.get("/my-orders", protect, getMyOrders);

// GET /api/orders/all - Admin gets all orders
router.get("/all", protect, authorize("admin"), getAllOrders);

// GET /api/orders/seller - Seller gets received orders
router.get("/seller", protect, authorize("seller", "admin"), getSellerOrders);

// GET /api/orders/shipper - Shipper gets assigned orders
router.get("/shipper", protect, authorize("shipper", "admin"), getShipperOrders);

// PUT /api/orders/cod-remit - Shipper remits COD to platform
router.put("/cod-remit", protect, authorize("shipper", "admin"), remitCodOrders);

// POST /api/orders - Submit a new order
router.post("/", protect, createOrder);

// PUT /api/orders/:id/cancel - Customer cancels pending/processing order
router.put("/:id/cancel", protect, cancelOrder);

// PUT /api/orders/:id/status - Update order status (Seller/Admin/Shipper)
router.put("/:id/status", protect, authorize("seller", "admin", "shipper"), updateOrderStatus);

// GET /api/orders/:id - Get specific order by id (must be LAST among GET routes)
router.get("/:id", protect, getOrderById);

export default router;
