import crypto from "crypto";
import qs from "qs";
import Order from "../models/Order.js";
import {
  applyOrderInventory,
  restoreOrderInventory,
} from "../utils/orderInventory.js";
import { recordOrderPaymentTransaction } from "../utils/finance.js";

const isProduction = process.env.NODE_ENV === "production";

const requireEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const getFrontendUrl = () => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    if (isProduction) {
      throw new Error("Missing required environment variable: FRONTEND_URL");
    }
    return "http://localhost:5173";
  }
  return frontendUrl;
};

const getPaymentConfig = () => {
  const tmnCode = requireEnv("VNPAY_TMN_CODE");
  const secretKey = requireEnv("VNPAY_HASH_SECRET");
  const vnpUrl =
    process.env.VNPAY_URL ||
    "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  const returnUrl = requireEnv("VNPAY_RETURN_URL");

  if (isProduction && returnUrl.includes("localhost")) {
    throw new Error(
      "Invalid VNPAY_RETURN_URL in production: localhost is not allowed.",
    );
  }

  return { tmnCode, secretKey, vnpUrl, returnUrl };
};

const createHttpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const updateOrdersFromMomoResult = async (params) => {
  const momoOrderId = params.orderId;
  if (!momoOrderId) {
    return { success: false, orders: [] };
  }

  const orders = await Order.find({ momoOrderId });
  const success = String(params.resultCode) === "0";

  for (const order of orders) {
    if (success) {
      await applyOrderInventory(order);
      order.paymentStatus = "completed";
    } else {
      await restoreOrderInventory(order);
      order.paymentStatus = "failed";
      order.orderStatus = "cancelled";
    }
    await order.save();
    if (success) {
      await recordOrderPaymentTransaction(order);
    }
  }

  return { success, orders };
};

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

function getVNPayDate(date) {
  return (
    date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2)
  );
}

function normalizeVNPayOrderInfo(orderInfo) {
  return String(orderInfo || "Thanh toan don hang")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 255);
}

export const createPaymentUrl = async (req, res, next) => {
  try {
    const { amount, orderInfo, orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw createHttpError(400, "Missing orderIds for VNPay demo payment.");
    }

    const vnpayAmount = Math.round(Number(amount));
    if (!Number.isFinite(vnpayAmount)) {
      throw createHttpError(400, "Invalid VNPay demo payment amount.");
    }
    if (vnpayAmount < 1000) {
      throw createHttpError(
        400,
        "VNPay demo amount must be at least 1,000 VND.",
      );
    }

    const demoTxnRef = `VNP${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const safeOrderInfo = normalizeVNPayOrderInfo(orderInfo);

    for (const id of orderIds) {
      await Order.findByIdAndUpdate(id, {
        paymentMethod: "VNPay",
        vnpTxnRef: demoTxnRef,
      });
    }

    const demoPaymentUrl = `${getFrontendUrl()}/vnpay-demo-pay?${qs.stringify(
      {
        txnRef: demoTxnRef,
        amount: vnpayAmount,
        orderInfo: safeOrderInfo,
      },
      { encode: true },
    )}`;

    return res.json({
      paymentUrl: demoPaymentUrl,
      txnRef: demoTxnRef,
      provider: "vnpay-demo",
    });

    const { tmnCode, secretKey, vnpUrl, returnUrl } = getPaymentConfig();

    let date = new Date();
    let createDate = getVNPayDate(date);
    date.setMinutes(date.getMinutes() + 15);
    let expireDate = getVNPayDate(date);

    let ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;

    let vnp_Params = {};
    vnp_Params["vnp_Version"] = "2.1.0";
    vnp_Params["vnp_Command"] = "pay";
    vnp_Params["vnp_TmnCode"] = tmnCode;
    vnp_Params["vnp_Locale"] = "vn";
    vnp_Params["vnp_CurrCode"] = "VND";
    // VNPay expects amount in smallest currency unit (VND * 100)
    // Lưu orderIds vào TxnRef để có thể truy xuất khi VNPay callback
    // Format: orderId1-orderId2-..._timestamp
    const txnRef = `VNP${Date.now()}${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    vnp_Params["vnp_TxnRef"] = txnRef;
    vnp_Params["vnp_OrderInfo"] = normalizeVNPayOrderInfo(orderInfo);
    vnp_Params["vnp_OrderType"] = "other";
    vnp_Params["vnp_Amount"] = Math.round(Number(amount)) * 100;
    vnp_Params["vnp_ReturnUrl"] = returnUrl;

    // Normalize IP Address: Use IPv4 127.0.0.1 if local loopback (::1) detected
    let finalIp =
      typeof ipAddr === "string" ? ipAddr.split(",")[0].trim() : "127.0.0.1";
    if (finalIp === "::1" || finalIp === "::ffff:127.0.0.1") {
      finalIp = "127.0.0.1";
    }
    vnp_Params["vnp_IpAddr"] = finalIp;

    vnp_Params["vnp_CreateDate"] = createDate;
    vnp_Params["vnp_ExpireDate"] = expireDate;

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;

    const paymentUrl = `${vnpUrl}?${qs.stringify(vnp_Params, { encode: false })}`;

    // Lưu txnRef vào từng order để tra cứu khi callback
    for (const id of orderIds) {
      await Order.findByIdAndUpdate(id, {
        paymentMethod: "VNPay",
        vnpTxnRef: txnRef,
      });
    }

    res.json({ paymentUrl });
  } catch (err) {
    next(err);
  }
};

export const completeVNPayDemoPayment = async (req, res, next) => {
  try {
    const { txnRef, success } = req.body;
    if (!txnRef) {
      throw createHttpError(400, "Missing VNPay demo transaction reference.");
    }

    const orders = await Order.find({
      vnpTxnRef: txnRef,
      customer: req.user._id,
    });
    if (orders.length === 0) {
      throw createHttpError(404, "VNPay demo transaction not found.");
    }

    const isSuccess = success === true || success === "true";
    for (const order of orders) {
      if (isSuccess) {
        await applyOrderInventory(order);
        order.paymentStatus = "completed";
      } else {
        await restoreOrderInventory(order);
        order.paymentStatus = "failed";
        order.orderStatus = "cancelled";
      }
      await order.save();
      if (isSuccess) {
        await recordOrderPaymentTransaction(order);
      }
    }

    const message = isSuccess
      ? "Thanh toán VNPay demo thành công"
      : "Thanh toán VNPay demo đã bị huỷ";

    res.json({
      success: isSuccess,
      redirectUrl: `${getFrontendUrl()}/payment-return?success=${isSuccess}&message=${encodeURIComponent(message)}`,
    });
  } catch (err) {
    next(err);
  }
};

export const vnpayReturn = async (req, res, next) => {
  try {
    const frontendUrl = getFrontendUrl();
    const demoTxnRef = req.query.vnp_TxnRef || req.query.txnRef;
    const demoSuccess = String(req.query.vnp_ResponseCode || "24") === "00";

    if (demoTxnRef) {
      const orders = await Order.find({ vnpTxnRef: demoTxnRef });
      for (const order of orders) {
        if (demoSuccess) {
          await applyOrderInventory(order);
          order.paymentStatus = "completed";
        } else {
          await restoreOrderInventory(order);
          order.paymentStatus = "failed";
          order.orderStatus = "cancelled";
        }
        await order.save();
        if (demoSuccess) {
          await recordOrderPaymentTransaction(order);
        }
      }
    }

    return res.redirect(
      `${frontendUrl}/payment-return?success=${demoSuccess}&message=${encodeURIComponent(
        demoSuccess
          ? "Thanh toan VNPay demo thanh cong"
          : "Thanh toan VNPay demo khong thanh cong",
      )}`,
    );

    const secretKey = requireEnv("VNPAY_HASH_SECRET");

    // Sao chép query params vào object mới để tránh mutation trên req.query
    let vnp_Params = { ...req.query };

    let secureHash = vnp_Params["vnp_SecureHash"];
    let txnRef = vnp_Params["vnp_TxnRef"]; // Lấy txnRef trước khi sort

    // Xóa các tham số không tham gia vào việc tính hash
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      // Chữ ký hợp lệ - tra cứu orders theo vnpTxnRef
      const orders = txnRef ? await Order.find({ vnpTxnRef: txnRef }) : [];
      const responseCode = vnp_Params["vnp_ResponseCode"];

      if (responseCode === "00") {
        // Thanh toán thành công
        for (const order of orders) {
          await applyOrderInventory(order);
          order.paymentStatus = "completed";
          await order.save();
          await recordOrderPaymentTransaction(order);
        }
        return res.redirect(
          `${frontendUrl}/payment-return?success=true&message=${encodeURIComponent("Giao dịch thành công")}`,
        );
      } else {
        // Thanh toán thất bại hoặc bị hủy
        for (const order of orders) {
          await restoreOrderInventory(order);
          order.paymentStatus = "failed";
          order.orderStatus = "cancelled";
          await order.save();
        }
        return res.redirect(
          `${frontendUrl}/payment-return?success=false&message=${encodeURIComponent("Giao dịch không thành công hoặc bị hủy")}`,
        );
      }
    } else {
      // Chữ ký không hợp lệ - có thể bị giả mạo
      if (txnRef) {
        const pendingOrders = await Order.find({
          vnpTxnRef: txnRef,
          paymentStatus: "pending",
        });
        for (const order of pendingOrders) {
          await restoreOrderInventory(order);
          order.paymentStatus = "failed";
          order.orderStatus = "cancelled";
          await order.save();
        }
      }
      return res.redirect(
        `${frontendUrl}/payment-return?success=false&message=${encodeURIComponent("Chữ ký VNPay không hợp lệ")}`,
      );
    }
  } catch (err) {
    next(err);
  }
};

export const createMomoPaymentUrl = async (req, res, next) => {
  try {
    const { amount, orderInfo, orderIds } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw createHttpError(400, "Missing orderIds for MoMo payment.");
    }

    const momoAmount = Math.round(Number(amount));
    if (!Number.isFinite(momoAmount)) {
      throw createHttpError(400, "Invalid MoMo payment amount.");
    }
    if (momoAmount < 1000 || momoAmount > 50000000) {
      throw createHttpError(
        400,
        "MoMo amount must be between 1,000 and 50,000,000 VND.",
      );
    }

    const createdAt = Date.now();
    const orderId = `MOMO_DEMO_${createdAt}_${crypto.randomBytes(4).toString("hex")}`;
    const requestId = `${orderId}_${crypto.randomBytes(4).toString("hex")}`;
    const safeOrderInfo = orderInfo || "Thanh toan don hang";

    for (const id of orderIds) {
      await Order.findByIdAndUpdate(id, {
        paymentMethod: "MoMo",
        momoOrderId: orderId,
        momoRequestId: requestId,
      });
    }

    const paymentUrl = `${getFrontendUrl()}/momo-demo-pay?${qs.stringify(
      {
        orderId,
        requestId,
        amount: momoAmount,
        orderInfo: safeOrderInfo,
      },
      { encode: true },
    )}`;

    res.json({
      paymentUrl,
      orderId,
      requestId,
      provider: "momo-demo",
    });
  } catch (err) {
    next(err);
  }
};

export const completeMomoDemoPayment = async (req, res, next) => {
  try {
    const { orderId, success } = req.body;
    if (!orderId) {
      throw createHttpError(400, "Missing MoMo demo orderId.");
    }

    const orders = await Order.find({
      momoOrderId: orderId,
      customer: req.user._id,
    });
    if (orders.length === 0) {
      throw createHttpError(404, "MoMo demo order not found.");
    }

    const isSuccess = success === true || success === "true";
    const resultCode = isSuccess ? "0" : "1006";
    await updateOrdersFromMomoResult({ orderId, resultCode });

    const message = isSuccess
      ? "Thanh toán MoMo demo thành công"
      : "Thanh toán MoMo demo đã bị huỷ";

    res.json({
      success: isSuccess,
      redirectUrl: `${getFrontendUrl()}/payment-return?success=${isSuccess}&message=${encodeURIComponent(message)}`,
    });
  } catch (err) {
    next(err);
  }
};

export const momoReturn = async (req, res, next) => {
  try {
    const frontendUrl = getFrontendUrl();
    const momoParams = { ...req.query };
    const { success } = await updateOrdersFromMomoResult(momoParams);
    const message = success
      ? "Thanh toan MoMo thanh cong"
      : momoParams.message || "Thanh toan MoMo khong thanh cong";

    return res.redirect(
      `${frontendUrl}/payment-return?success=${success}&message=${encodeURIComponent(message)}`,
    );
  } catch (err) {
    next(err);
  }
};

export const momoIpn = async (req, res, next) => {
  try {
    const momoParams = { ...req.body };
    await updateOrdersFromMomoResult(momoParams);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
