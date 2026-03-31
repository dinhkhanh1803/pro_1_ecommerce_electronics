import User from "../models/User.js";
import Product from "../models/Product.js";

export const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    let filter = {};
    if (role && role !== "all") filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    
    // We map over users to add a mock "orders" count for simplicity since we don't have an extensive order history built out yet.
    const mappedUsers = users.map(u => {
      const uObj = u.toObject();
      uObj.orders = Math.floor(Math.random() * 20); // mock orders
      return uObj;
    });

    res.json(mappedUsers);
  } catch (err) { next(err); }
};

export const toggleUserLock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.status = user.status === "active" ? "locked" : "active";
    await user.save();
    res.json(user);
  } catch (err) { next(err); }
};

// GET /api/users/wishlist — lấy danh sách wishlist của user đang đăng nhập
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      populate: { path: "category", select: "name slug" },
    });
    res.json(user.wishlist || []);
  } catch (err) { next(err); }
};

// POST /api/users/wishlist/:productId — toggle thêm/xóa khỏi wishlist
export const toggleWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

    const exists = user.wishlist.some(id => id.toString() === productId);
    if (exists) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }
    await user.save();
    res.json({ wishlisted: !exists, wishlist: user.wishlist });
  } catch (err) { next(err); }
};

// DELETE /api/users/wishlist/:productId — xóa 1 sản phẩm khỏi wishlist
export const removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();
    res.json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (err) { next(err); }
};

// GET /api/users/profile - Lấy thông tin cá nhân của user đang đăng nhập
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { next(err); }
};

// PUT /api/users/profile - Cập nhật thông tin cá nhân của user
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) {
      if (!user.addresses.includes(address)) {
        user.addresses.push(address);
      }
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user: { id: user._id, name: user.name, phone: user.phone, addresses: user.addresses } });
  } catch (err) { next(err); }
};
