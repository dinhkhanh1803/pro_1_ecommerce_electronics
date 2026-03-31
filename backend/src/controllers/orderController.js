import Order from "../models/Order.js";

// GET /api/orders/my-orders - Lấy đơn hàng của người mua hiện tại
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("seller", "name email")
      .populate("products.product", "name images")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

// GET /api/orders/seller - Lấy đơn hàng của người bán hiện tại
export const getSellerOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ seller: req.user._id })
      .populate("customer", "name email phone")
      .populate("products.product", "name images")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

// POST /api/orders - Tạo đơn hàng mới (từ Checkout)
export const createOrder = async (req, res, next) => {
  try {
    const { products, totalAmount, shippingAddress, paymentMethod, seller } = req.body;
    
    // In a real app, products should be validated with DB prices
    const order = await Order.create({
      customer: req.user._id,
      seller,
      products,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
    });
    
    res.status(201).json(order);
  } catch (err) { next(err); }
};
