import mongoose from "mongoose";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import { applyOrderInventory, restoreOrderInventory } from "../utils/orderInventory.js";

const getErrorStatusCode = (err) => {
  if (err?.statusCode || err?.status) return err.statusCode || err.status;
  if (err?.name === "CastError" || err?.name === "ValidationError") return 400;
  return 500;
};

const handleCreateOrderError = (err, res, next) => {
  if (typeof next === "function") {
    return next(err);
  }

  const statusCode = getErrorStatusCode(err);
  return res.status(statusCode).json({
    message: err?.message || "Failed to create order",
    stack: process.env.NODE_ENV === "production" ? null : err?.stack,
  });
};

// GET /api/orders/my-orders - Lấy đơn hàng của người mua hiện tại
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
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

    let query = {};

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
      .populate("products.product", "name images");
      
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Ensure customer, admin, shipper, seller or warehouse
    if (order.customer._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin' && req.user.role !== 'shipper' &&
        req.user.role !== 'warehouse' && req.user.role !== 'seller') {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    
    res.json(order);
  } catch (err) { next(err); }
};

// POST /api/orders - Tạo đơn hàng mới (từ Checkout)
export const createOrder = async (req, res, next) => {
  try {
    const { products, totalAmount, shippingAddress, paymentMethod, couponCode } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "Order must include at least one product" });
    }

    const validatedProducts = [];
    // Validate stock and variants before creating the order. Online payments apply
    // inventory only after the payment gateway confirms success.
    for (const item of products) {
      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: "Invalid product id in order" });
      }

      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) return res.status(404).json({ message: "Product not found" });

      const variantName = String(item.variantName || "Default");
      const variantIndex = Array.isArray(dbProduct.variants)
        ? dbProduct.variants.findIndex((v) => String(v.name) === variantName)
        : -1;

      if (variantIndex < 0) {
        return res.status(400).json({ message: `Variant '${variantName}' not found for product ${dbProduct.name}` });
      }

      const available = Math.max(0, Number(dbProduct.variants[variantIndex].stock) || 0);
      const requested = Math.max(1, Number(item.quantity) || 1);

      if (requested > available) {
        return res.status(400).json({
          message: `Insufficient stock for ${dbProduct.name} - ${variantName}. Available: ${available}`,
        });
      }

      validatedProducts.push({
        product: item.product,
        variantName,
        quantity: requested,
        price: Number(item.price) || dbProduct.price + (Number(dbProduct.variants[variantIndex].priceAdd) || 0),
      });
    }
    
    // In a real app, products should be validated with DB prices
    const orderData = {
      customer: req.user._id,
      products: validatedProducts,
      totalAmount: Number(totalAmount) || 0,
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

    const order = new Order(orderData);
    if (order.paymentMethod === "COD") {
      await applyOrderInventory(order);
    }
    await order.save();

    res.status(201).json(order);
  } catch (err) { return handleCreateOrderError(err, res, next); }
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
    if (req.user.role === 'seller' || req.user.role === 'warehouse') {
       // Trạng thái đã giao và trả hàng phải do Shipper cập nhật
       if (['delivered', 'returned'].includes(status)) {
         return res.status(403).json({ message: "Quyền này thuộc về Shipper. Không thể cập nhật trạng thái đã giao hoặc trả hàng." });
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

    if (status === 'cancelled') {
      await restoreOrderInventory(order);
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
    await restoreOrderInventory(order);
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
