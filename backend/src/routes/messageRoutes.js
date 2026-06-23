import express from "express";
import {
  getMyConversations,
  getConversationHistory,
  sendMessage,
  getContactInfo,
  getDefaultSeller,
} from "../controllers/messageController.js";
import { uploadMessageImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// GET /api/messages - Lấy danh sách liên lạc
router.get("/", protect, getMyConversations);

// GET /api/messages/default-seller - Lấy người bán mặc định
router.get("/default-seller", protect, getDefaultSeller);

// GET /api/messages/:otherId - Lấy lịch sử chat với người đó
router.get("/:otherId", protect, getConversationHistory);

// GET /api/messages/contact/:userId - Lấy thông tin user
router.get("/contact/:userId", protect, getContactInfo);

// POST /api/messages - Gửi tin nhắn
router.post("/", protect, sendMessage);

// POST /api/messages/upload-image - Upload hình ảnh tin nhắn
router.post("/upload-image", protect, upload.single("image"), uploadMessageImage);

export default router;
