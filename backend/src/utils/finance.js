import Transaction from "../models/Transaction.js";

export const recordOrderPaymentTransaction = async (order) => {
  if (!order?._id) return null;

  const amount = Math.max(0, Number(order.totalAmount) || 0);

  return Transaction.findOneAndUpdate(
    { order: order._id, type: "payment" },
    {
      order: order._id,
      type: "payment",
      amount,
      fee: 0,
      net: amount,
      fromUser: order.customer,
      toUser: order.seller,
      status: "completed",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

export const recordOrderRefundTransaction = async (order) => {
  if (!order?._id) return null;

  const amount = Math.max(0, Number(order.totalAmount) || 0);

  return Transaction.findOneAndUpdate(
    { order: order._id, type: "refund" },
    {
      order: order._id,
      type: "refund",
      amount,
      fee: 0,
      net: -amount,
      fromUser: order.seller,
      toUser: order.customer,
      status: "completed",
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};