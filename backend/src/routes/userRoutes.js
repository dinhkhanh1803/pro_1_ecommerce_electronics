import express from "express";
import { getAllUsers, toggleUserLock } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin"), getAllUsers);
router.put("/:id/lock", protect, authorize("admin"), toggleUserLock);

export default router;
