import Coupon from "../models/Coupon.js";

// GET /api/coupons - Lấy tất cả coupon
export const getMyCoupons = async (req, res, next) => {
  try {
    const query = {};
    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) { next(err); }
};

// POST /api/coupons - Tạo coupon mới
export const createCoupon = async (req, res, next) => {
  try {
    const { code, type, value, minOrder, usageLimit, startDate, endDate, status, showOnHome } = req.body;

    // Kiểm tra code đã tồn tại chưa
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Mã giảm giá đã tồn tại" });
    }

    const isPinned = showOnHome === true || showOnHome === "true";
    if (isPinned) {
      await Coupon.updateMany({}, { showOnHome: false });
    }

    const coupon = await Coupon.create({
      code,
      type,
      value,
      minOrder: minOrder || 0,
      usageLimit: usageLimit || null,
      startDate,
      endDate,
      status: status || "active",
      seller: req.user._id,
      showOnHome: isPinned,
    });
    res.status(201).json(coupon);
  } catch (err) { next(err); }
};

// DELETE /api/coupons/:id - Xóa coupon
export const deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Không tìm thấy coupon" });
    if (req.user.role !== 'admin' && req.user.role !== 'warehouse') {
      return res.status(403).json({ message: "Không có quyền xóa" });
    }
    await coupon.deleteOne();
    res.json({ message: "Đã xóa coupon" });
  } catch (err) { next(err); }
};

// PUT /api/coupons/:id - Cập nhật coupon
export const updateCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Không tìm thấy coupon" });
    if (req.user.role !== 'admin' && req.user.role !== 'warehouse') {
      return res.status(403).json({ message: "Không có quyền" });
    }

    const isPinned = req.body.showOnHome === true || req.body.showOnHome === "true";
    if (isPinned) {
      await Coupon.updateMany({ _id: { $ne: req.params.id } }, { showOnHome: false });
    }

    Object.assign(coupon, req.body);
    if (req.body.showOnHome !== undefined) {
      coupon.showOnHome = isPinned;
    }
    await coupon.save();
    res.json(coupon);
  } catch (err) { next(err); }
};

// POST /api/coupons/validate - Validate mã coupon từ giỏ hàng
export const validateCoupon = async (req, res, next) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) return res.status(400).json({ message: "Vui lòng nhập mã" });

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), status: "active" });
    if (!coupon) return res.status(404).json({ message: "Mã không hợp lệ hoặc đã hết hạn" });

    if (coupon.usedBy && coupon.usedBy.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: "Bạn đã sử dụng mã giảm giá này rồi" });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({ message: "Mã chưa đến thời gian sử dụng" });
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return res.status(400).json({ message: "Mã đã hết hạn" });
    }
    if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Mã đã đạt giới hạn sử dụng" });
    }
    if (subtotal < coupon.minOrder) {
      return res.status(400).json({
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(coupon.minOrder)} để dùng mã này`,
      });
    }

    // Tính số tiền giảm
    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = (subtotal * coupon.value) / 100;
    } else if (coupon.type === "fixed") {
      discountAmount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === "shipping") {
      discountAmount = 0; // Free shipping — xử lý ở FE
    }

    res.json({
      valid: true,
      coupon: {
        _id: coupon._id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discountAmount,
      freeShipping: coupon.type === "shipping",
    });
  } catch (err) { next(err); }
};

export const getPinnedCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findOne({ showOnHome: true, status: "active" });
    res.json(coupon || null);
  } catch (err) { next(err); }
};
