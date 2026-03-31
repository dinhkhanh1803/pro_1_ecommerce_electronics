import express from "express";
import {
  getMyConversations,
  getConversationHistory,
  sendMessage,
  getContactInfo,
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/messages - Lấy danh sách liên lạc
router.get("/", protect, getMyConversations);

// GET /api/messages/:otherId - Lấy lịch sử chat với người đó
router.get("/:otherId", protect, getConversationHistory);

// GET /api/messages/contact/:userId - Lấy thông tin user
router.get("/contact/:userId", protect, getContactInfo);

// POST /api/messages - Gửi tin nhắn
router.post("/", protect, sendMessage);

export default router;
