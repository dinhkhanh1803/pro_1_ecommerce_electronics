import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const pendingProducts = await Product.countDocuments({ status: "pending" });
    const activeProducts = await Product.countDocuments({ status: "active" });
    const totalOrders = await Order.countDocuments();
    
    res.json({
      totalUsers,
      totalSellers,
      pendingProducts,
      activeProducts,
      totalOrders,
      revenue: 120500 // Mocked overall revenue
    });
  } catch(error) { next(error); }
};
