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
    vnp_Params['vnp_TxnRef'] = orderIds.join('_') + '_' + date.getTime(); // Ensure unique
    vnp_Params['vnp_OrderInfo'] = orderInfo || `Thanh toan don hang ${orderIds.join('_')}`;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100;
    vnp_Params['vnp_ReturnUrl'] = `${returnUrl}?orderIds=${orderIds.join(',')}`;
    vnp_Params['vnp_IpAddr'] = typeof ipAddr === 'string' ? ipAddr.split(',')[0] : '127.0.0.1';
    vnp_Params['vnp_CreateDate'] = createDate;
    vnp_Params['vnp_ExpireDate'] = expireDate;

    vnp_Params = sortObject(vnp_Params);

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;

    vnpUrl += '?' + qs.stringify(vnp_Params, { encode: false });

    // Mark these DB orders as VNPay payment method
    for (const id of orderIds) {
      await Order.findByIdAndUpdate(id, { paymentMethod: "VNPay" });
    }

    res.json({ paymentUrl: vnpUrl });
  } catch (err) {
    next(err);
  }
};

export const vnpayReturn = async (req, res, next) => {
  try {
    let vnp_Params = req.query;

    let secureHash = vnp_Params['vnp_SecureHash'];
    let orderIdsStr = vnp_Params['orderIds']; // extracted since we appended it on return url manually above

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];
    delete vnp_Params['orderIds'];

    vnp_Params = sortObject(vnp_Params);

    let tmnCode = process.env.VNPAY_TMN_CODE || "DUMMY_TMN";
    let secretKey = process.env.VNPAY_HASH_SECRET || "DUMMY_SECRET";

    let signData = qs.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");     

    if(secureHash === signed){
        // Verified Success
        if (vnp_Params['vnp_ResponseCode'] === '00' && orderIdsStr) {
          const ids = orderIdsStr.split(',');
          for (const id of ids) {
             await Order.findByIdAndUpdate(id, { paymentStatus: 'completed' });
          }
          res.json({ success: true, message: 'Giao dịch thành công' });
        } else {
          if (orderIdsStr) {
            const ids = orderIdsStr.split(',');
            for (const id of ids) {
               await Order.findByIdAndUpdate(id, { paymentStatus: 'failed', orderStatus: 'cancelled' });
            }
          }
          res.json({ success: false, message: 'Giao dịch không thành công hoặc bị hủy' });
        }
    } else {
        res.status(400).json({ success: false, message: 'Chữ ký VNPay không hợp lệ (Sai tham số hoặc Dummy Key)' });
    }
  } catch (err) {
    next(err);
  }
};
