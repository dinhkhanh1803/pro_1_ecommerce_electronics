import express from "express";
import { getFinanceOverview, getTransactions } from "../controllers/financeController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/overview", protect, authorize("admin"), getFinanceOverview);
router.get("/transactions", protect, authorize("admin"), getTransactions);

export default router;
