import Message from "../models/Message.js";
import User from "../models/User.js";

// GET /api/messages - Lấy danh sách những người mình đã nhắn tin
export const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    // Find all unique receivers for my sent messages and senders for my received messages
    const sentTo = await Message.distinct("receiver", { sender: userId });
    const receivedFrom = await Message.distinct("sender", { receiver: userId });

    const contactIds = [...new Set([...sentTo, ...receivedFrom])];
    const contacts = await User.find({ _id: { $in: contactIds } }).select("name email role");

    res.json(contacts);
  } catch (err) { next(err); }
};

// GET /api/messages/:otherId - Lấy lịch sử chat với 1 người cụ thể
export const getConversationHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const otherId = req.params.otherId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) { next(err); }
};

// POST /api/messages - Gửi tin nhắn
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user._id;

    if (!receiverId || !content) {
      return res.status(400).json({ message: "Thiếu thông tin người nhận hoặc nội dung" });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    });

    res.status(201).json(newMessage);
  } catch (err) { next(err); }
};

// GET /api/messages/contact/:userId - Lấy thông tin cơ bản của 1 user để hiển thị trên Chat UI
export const getContactInfo = async (req, res, next) => {
  try {
    const contact = await User.findById(req.params.userId).select("name email role");
    if (!contact) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(contact);
  } catch (err) { next(err); }
};
