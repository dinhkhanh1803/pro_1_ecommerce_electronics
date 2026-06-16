import express from "express";
import { getDashboardStats, getSellerDashboardStats, getTopProducts } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, authorize("admin"), getDashboardStats);
router.get("/seller", protect, authorize("seller", "admin"), getSellerDashboardStats);
router.get("/top-products", protect, authorize("admin"), getTopProducts);

export default router;
