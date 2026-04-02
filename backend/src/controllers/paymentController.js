import crypto from "crypto";
import qs from "qs";
import Order from "../models/Order.js";

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
  return date.getFullYear() +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    ("0" + date.getDate()).slice(-2) +
    ("0" + date.getHours()).slice(-2) +
    ("0" + date.getMinutes()).slice(-2) +
    ("0" + date.getSeconds()).slice(-2);
}

export const createPaymentUrl = async (req, res, next) => {
  try {
    const { amount, orderInfo, orderIds } = req.body;
    
    let tmnCode = process.env.VNPAY_TMN_CODE || "DUMMY_TMN";
    let secretKey = process.env.VNPAY_HASH_SECRET || "DUMMY_SECRET";
    let vnpUrl = process.env.VNPAY_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    let returnUrl = process.env.VNPAY_RETURN_URL || "http://localhost:5173/payment-return";

    let date = new Date();
    let createDate = getVNPayDate(date);
    date.setMinutes(date.getMinutes() + 15);
    let expireDate = getVNPayDate(date);

    let ipAddr = req.headers['x-forwarded-for'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress || 
                 req.connection.socket.remoteAddress;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    // VNPay expects amount in smallest currency unit (VND * 100)
    // Lưu orderIds vào TxnRef để có thể truy xuất khi VNPay callback
    // Format: orderId1-orderId2-..._timestamp
    const txnRef = orderIds.join('-') + '_' + Date.now();
    vnp_Params['vnp_TxnRef'] = txnRef;
    vnp_Params['vnp_OrderInfo'] = orderInfo || `Thanh toan don hang`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    // ReturnUrl phải khớp chính xác URL đã đăng ký trên VNPay merchant portal (KHÔNG thêm tham số)
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = typeof ipAddr === 'string' ? ipAddr.split(',')[0] : '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = expireDate;

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    // Lưu txnRef vào từng order để tra cứu khi callback
    for (const id of orderIds) {
      await Order.findByIdAndUpdate(id, { paymentMethod: "VNPay", vnpTxnRef: txnRef });
    }

    res.json({ paymentUrl: vnpUrl });
  } catch (err) {
    next(err);
  }
};

export const vnpayReturn = async (req, res, next) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Sao chép query params vào object mới để tránh mutation trên req.query
    let vnp_Params = { ...req.query };

    let secureHash = vnp_Params['vnp_SecureHash'];
    let txnRef = vnp_Params['vnp_TxnRef']; // Lấy txnRef trước khi sort

    // Xóa các tham số không tham gia vào việc tính hash
    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);

    let secretKey = process.env.VNPAY_HASH_SECRET || "DUMMY_SECRET";

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
      // Chữ ký hợp lệ - tra cứu orders theo vnpTxnRef
      const orders = txnRef ? await Order.find({ vnpTxnRef: txnRef }) : [];
      const responseCode = vnp_Params['vnp_ResponseCode'];

      if (responseCode === '00') {
        // Thanh toán thành công
        for (const order of orders) {
          order.paymentStatus = 'completed';
          await order.save();
        }
        return res.redirect(
          `${frontendUrl}/payment-return?success=true&message=${encodeURIComponent('Giao dịch thành công')}`
        );
      } else {
        // Thanh toán thất bại hoặc bị hủy
        for (const order of orders) {
          order.paymentStatus = 'failed';
          order.orderStatus = 'cancelled';
          await order.save();
        }
        return res.redirect(
          `${frontendUrl}/payment-return?success=false&message=${encodeURIComponent('Giao dịch không thành công hoặc bị hủy')}`
        );
      }
    } else {
      // Chữ ký không hợp lệ - có thể bị giả mạo
      if (txnRef) {
        await Order.updateMany(
          { vnpTxnRef: txnRef, paymentStatus: 'pending' },
          { $set: { paymentStatus: 'failed', orderStatus: 'cancelled' } }
        );
      }
      return res.redirect(
        `${frontendUrl}/payment-return?success=false&message=${encodeURIComponent('Chữ ký VNPay không hợp lệ')}`
      );
    }
  } catch (err) {
    next(err);
  }
};
