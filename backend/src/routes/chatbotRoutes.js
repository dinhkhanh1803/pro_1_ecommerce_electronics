import express from "express";
import jwt from "jsonwebtoken";
import {
  getChatbotHistory,
  handoffChatbot,
  replyToChatbot,
} from "../controllers/chatbotController.js";
import env from "../config/env.js";
import User from "../models/User.js";

const router = express.Router();

const optionalProtect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
  } catch (error) {
    req.user = null;
  }
  next();
};

router.get("/history", optionalProtect, getChatbotHistory);
router.post("/handoff", optionalProtect, handoffChatbot);
router.post("/", optionalProtect, replyToChatbot);

export default router;
