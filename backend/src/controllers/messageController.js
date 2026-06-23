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
    let query = {};
    if (req.user.role === 'customer') {
      query = { _id: { $in: contactIds, $ne: userId }, role: 'seller' };
    } else if (req.user.role === 'admin') {
      query = { _id: { $in: contactIds, $ne: userId }, role: { $ne: 'customer' } };
    } else if (req.user.role === 'seller') {
      query = {
        _id: { $ne: userId },
        $or: [
          { role: { $in: ['admin', 'warehouse', 'shipper'] } },
          { _id: { $in: contactIds }, role: 'customer' }
        ]
      };
    } else if (req.user.role === 'warehouse') {
      query = {
        _id: { $ne: userId },
        role: { $in: ['seller', 'admin', 'shipper'] }
      };
    } else if (req.user.role === 'shipper') {
      query = {
        _id: { $ne: userId },
        role: { $in: ['seller', 'admin', 'warehouse'] }
      };
    }
    const contacts = await User.find(query).select("name email role");

    res.json(contacts);
  } catch (err) { next(err); }
};

// GET /api/messages/:otherId - Lấy lịch sử chat với 1 người cụ thể
export const getConversationHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const otherId = req.params.otherId;

    // Mark messages from other user as read
    await Message.updateMany(
      { sender: otherId, receiver: userId, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId },
      ],
    })
      .populate({
        path: "order",
        populate: {
          path: "products.product",
          select: "name images price"
        }
      })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) { next(err); }
};

// POST /api/messages - Gửi tin nhắn
export const sendMessage = async (req, res, next) => {
  try {
    const receiverId = req.body.receiverId || req.body.recipientId;
    const content = req.body.content || req.body.text || "";
    const image = req.body.image || null;
    const orderId = req.body.orderId || req.body.order;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "Thiếu thông tin người nhận" });
    }
    if (!content && !image) {
      return res.status(400).json({ message: "Nội dung tin nhắn hoặc hình ảnh không được để trống" });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Không tìm thấy người nhận" });
    }

    if (req.user.role === "customer" && receiver.role !== "seller") {
      return res.status(403).json({ message: "Khách hàng chỉ được phép nhắn tin với người bán hàng." });
    }

    if (req.user.role === "admin" && receiver.role === "customer") {
      return res.status(403).json({ message: "Quản trị viên không được phép nhắn tin trực tiếp với khách hàng." });
    }

    if (req.user.role === "seller" && !["customer", "shipper", "admin", "warehouse"].includes(receiver.role)) {
      return res.status(403).json({ message: "Người bán hàng chỉ được phép nhắn tin với khách hàng, người vận chuyển, quản trị viên hoặc quản lý kho." });
    }

    if (req.user.role === "warehouse" && !["seller", "admin", "shipper"].includes(receiver.role)) {
      return res.status(403).json({ message: "Quản lý kho chỉ được phép nhắn tin với người bán hàng, quản trị viên hoặc người vận chuyển." });
    }

    if (req.user.role === "shipper" && !["seller", "admin", "warehouse"].includes(receiver.role)) {
      return res.status(403).json({ message: "Nhân viên giao hàng chỉ được phép nhắn tin với người bán hàng, quản trị viên hoặc quản lý kho." });
    }

    const newMessage = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
      image,
      order: orderId || null,
    });

    const populatedMessage = await Message.findById(newMessage._id).populate({
      path: "order",
      populate: {
        path: "products.product",
        select: "name images price"
      }
    });

    res.status(201).json(populatedMessage);
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

// GET /api/messages/default-seller - Lấy người bán mặc định cho khách hàng
export const getDefaultSeller = async (req, res, next) => {
  try {
    const seller = await User.findOne({ role: "seller", status: "active" }).select("name email role");
    if (!seller) {
      return res.status(404).json({ message: "Không tìm thấy người bán hoạt động" });
    }
    res.json(seller);
  } catch (err) { next(err); }
};
