import express from "express";
import { getDashboardStats, getSellerDashboardStats, getTopProducts, getNotifications } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, authorize("admin"), getDashboardStats);
router.get("/seller", protect, authorize("seller", "admin"), getSellerDashboardStats);
router.get("/top-products", protect, authorize("admin"), getTopProducts);
router.get("/notifications", protect, authorize("admin", "seller", "warehouse"), getNotifications);

export default router;
