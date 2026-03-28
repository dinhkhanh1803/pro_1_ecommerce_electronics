import express from "express";
import authRoutes from "./authRoutes.js"; // import auth routes

const router = express.Router();

// Test route
router.get("/", (req, res) => {
  res.json({ message: "API running..." });
});

// Auth routes
router.use("/auth", authRoutes);

export default router;
