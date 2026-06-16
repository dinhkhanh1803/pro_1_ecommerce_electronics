import authRoutes from "./authRoutes.js";
import categoryRoutes from "./categoryRoutes.js";
import productRoutes from "./productRoutes.js";
import userRoutes from "./userRoutes.js";
import financeRoutes from "./financeRoutes.js";
import cmsRoutes from "./cmsRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import couponRoutes from "./couponRoutes.js";
import orderRoutes from "./orderRoutes.js";
import messageRoutes from "./messageRoutes.js";
import reviewRoutes from "./reviewRoutes.js";
import paymentRoutes from "./paymentRoutes.js";
import cartRoutes from "./cartRoutes.js";
import express from "express";

const router = express.Router();

// Test route
router.get("/", (req, res) => {
  res.json({ message: "API running..." });
});

// Auth routes
router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/users", userRoutes);
router.use("/finance", financeRoutes);
router.use("/cms", cmsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/coupons", couponRoutes);
router.use("/orders", orderRoutes);
router.use("/messages", messageRoutes);
router.use("/reviews", reviewRoutes);
router.use("/payment", paymentRoutes);
router.use("/cart", cartRoutes);

export default router;
