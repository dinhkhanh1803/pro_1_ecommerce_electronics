import Order from "../models/Order.js";
import Transaction from "../models/Transaction.js";

const paymentMethodColors = ["#6366f1", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export const getFinanceOverview = async (req, res, next) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);

    const transactions = await Transaction.find({ createdAt: { $gte: startDate } });
    const paymentTransactions = transactions.filter((trx) => trx.type === "payment" && trx.status === "completed");
    const refundTransactions = transactions.filter((trx) => trx.type === "refund" && trx.status === "completed");

    const dailyMap = {};
    for (let i = 0; i < 30; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const label = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      dailyMap[label] = { name: label, revenue: 0, refunds: 0 };
    }

    paymentTransactions.forEach((trx) => {
      const label = new Date(trx.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      if (dailyMap[label]) dailyMap[label].revenue += trx.amount || 0;
    });

    refundTransactions.forEach((trx) => {
      const label = new Date(trx.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
      if (dailyMap[label]) dailyMap[label].refunds += trx.amount || 0;
    });

    const paymentMethodStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: "completed",
        },
      },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const totalPaymentMethodCount = paymentMethodStats.reduce((sum, item) => sum + item.count, 0);
    const paymentMethods = paymentMethodStats.map((item, index) => ({
      name: item._id || "Unknown",
      value: totalPaymentMethodCount > 0 ? Math.round((item.count / totalPaymentMethodCount) * 100) : 0,
      color: paymentMethodColors[index % paymentMethodColors.length],
    }));

    const pendingPayments = await Order.countDocuments({
      createdAt: { $gte: startDate },
      paymentStatus: "pending",
    });

    const totalVolume = paymentTransactions.reduce((sum, trx) => sum + (trx.amount || 0), 0);
    const refunds = refundTransactions.reduce((sum, trx) => sum + (trx.amount || 0), 0);

    res.json({
      revenueData: Object.values(dailyMap),
      metrics: {
        totalVolume,
        completedTransactions: paymentTransactions.length,
        pendingPayments,
        refunds,
      },
      paymentMethods,
    });
  } catch (err) { next(err); }
};

export const getTransactions = async (req, res, next) => {
  try {
    const { type } = req.query;
    let filter = {};
    if (type && type !== "all") filter.type = type;

    const transactions = await Transaction.find(filter)
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) { next(err); }
};