import express from "express";
import {
  completeMomoDemoPayment,
  completeVNPayDemoPayment,
  createMomoPaymentUrl,
  createPaymentUrl,
  momoIpn,
  momoReturn,
  vnpayReturn,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create_payment_url", protect, createPaymentUrl);
router.post("/vnpay_demo_result", protect, completeVNPayDemoPayment);
router.get("/vnpay_return", vnpayReturn);
router.post("/create_momo_payment_url", protect, createMomoPaymentUrl);
router.post("/momo_demo_result", protect, completeMomoDemoPayment);
router.get("/momo_return", momoReturn);
router.post("/momo_ipn", momoIpn);

export default router;
