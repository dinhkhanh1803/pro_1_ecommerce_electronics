import mongoose from "mongoose";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";

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

// GET /api/orders - Lấy tất cả đơn hàng (Dành cho Admin)
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({})
      .populate("customer", "name email phone")
      .populate("seller", "name email")
      .populate("products.product", "name images")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

// GET /api/orders/seller - Lấy đơn hàng của người bán hiện tại (với phân trang và lọc)
export const getSellerOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 5, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { seller: req.user._id };

    // Lọc theo trạng thái
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    // Tìm kiếm theo ID đơn hàng hoặc tên khách hàng
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        query._id = search;
      } else {
        // Tìm khách hàng có tên khớp với search
        const customers = await mongoose.model("User").find({
          name: { $regex: search, $options: "i" }
        }).select("_id");
        
        const customerIds = customers.map(c => c._id);
        query.customer = { $in: customerIds };
      }
    }

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("customer", "name email phone")
      .populate("products.product", "name images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      orders,
      totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) { next(err); }
};

// GET /api/orders/:id - Lấy chi tiết đơn hàng
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("seller", "name email phone")
      .populate("products.product", "name images");
      
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure customer, seller, admin or shipper
    if (order.customer._id.toString() !== req.user._id.toString() &&
        order.seller._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' && req.user.role !== 'shipper') {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    
    res.json(order);
  } catch (err) { next(err); }
};

// POST /api/orders - Tạo đơn hàng mới (từ Checkout)
export const createOrder = async (req, res, next) => {
  try {
    const { products, totalAmount, shippingAddress, paymentMethod, seller, couponCode } = req.body;
    
    // In a real app, products should be validated with DB prices
    const orderData = {
      customer: req.user._id,
      seller,
      products,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || "COD",
    };

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), status: "active" });
      if (coupon) {
        // Tăng lượt sử dụng khi đặt hàng thành công
        coupon.usageCount += 1;
        await coupon.save();
        orderData.coupon = couponCode.toUpperCase();
      }
    }

    const order = await Order.create(orderData);
    
    res.status(201).json(order);
  } catch (err) { next(err); }
};

// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Dành cho Seller/Admin)
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Role-based status transition logic
    if (req.user.role === 'seller') {
       if (order.seller.toString() !== req.user._id.toString()) {
         return res.status(403).json({ message: "Not authorized to update this order" });
       }
       // Trạng thái đã giao và trả hàng phải do Shipper cập nhật
       if (['delivered', 'returned'].includes(status)) {
         return res.status(403).json({ message: "Quyền này thuộc về Shipper. Người bán không thể cập nhật trạng thái đã giao hoặc trả hàng." });
       }
    } else if (req.user.role === 'shipper') {
       if (!['shipped', 'delivered', 'returned'].includes(status)) {
         return res.status(403).json({ message: "Shipper can only update to delivered or returned." });
       }
       if (order.orderStatus !== 'shipped' && order.orderStatus !== 'delivered' && order.orderStatus !== 'returned') {
         return res.status(403).json({ message: "Order is not ready for shipping." });
       }
    } else if (req.user.role !== 'admin') {
       return res.status(403).json({ message: "Not authorized" });
    }

    order.orderStatus = status;

    if (status === 'delivered' && order.paymentMethod === 'COD') {
       order.paymentStatus = 'completed';
    }

    await order.save();
    
    res.json(order);
  } catch (err) { next(err); }
};

// GET /api/orders/shipper
export const getShipperOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ orderStatus: { $in: ['shipped', 'delivered', 'returned'] } })
      .populate("customer", "name email phone")
      .populate("seller", "name email phone")
      .populate("products.product", "name images")
      .sort({ updatedAt: -1 });
    res.json(orders);
  } catch (err) { next(err); }
};

// PUT /api/orders/:id/cancel
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.customer.toString() !== req.user._id.toString()) {
       return res.status(403).json({ message: "Not authorized to cancel this order" });
    }
    if (!['pending', 'processing'].includes(order.orderStatus)) {
       return res.status(400).json({ message: "Cannot cancel order at this stage" });
    }

    order.orderStatus = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) { next(err); }
};

// PUT /api/orders/cod-remit
export const remitCodOrders = async (req, res, next) => {
  try {
    const { orderIds } = req.body;
    if (!orderIds || !Array.isArray(orderIds)) {
       return res.status(400).json({ message: "Invalid orderIds array" });
    }
    await Order.updateMany(
      { _id: { $in: orderIds }, paymentMethod: 'COD', orderStatus: 'delivered' },
      { $set: { codRemitted: true } }
    );
    res.json({ message: "COD orders remitted successfully" });
  } catch(err) { next(err); }
};
