import express from "express";
import { getBanners, addBanner, updateBanner, deleteBanner, getSettings, updateSettings } from "../controllers/cmsController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Banners
router.get("/banners", getBanners);
router.post("/banners", protect, authorize("admin"), addBanner);
router.put("/banners/:id", protect, authorize("admin"), updateBanner);
router.delete("/banners/:id", protect, authorize("admin"), deleteBanner);

// Settings
router.get("/settings", getSettings);
router.put("/settings", protect, authorize("admin"), updateSettings);

export default router;
