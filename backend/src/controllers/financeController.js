import Transaction from "../models/Transaction.js";

export const getFinanceOverview = async (req, res, next) => {
  try {
    // Hardcoded mock revenue data tailored for chart format
    const revenueData = [
      { name: "Jan", revenue: 40000, commission: 2000 },
      { name: "Feb", revenue: 30000, commission: 1500 },
      { name: "Mar", revenue: 20000, commission: 1000 },
      { name: "Apr", revenue: 27800, commission: 1390 },
      { name: "May", revenue: 18900, commission: 945 },
      { name: "Jun", revenue: 23900, commission: 1195 },
      { name: "Jul", revenue: 34900, commission: 1745 }
    ];
    const metrics = {
      totalVolume: 2400000,
      platformRevenue: 120000,
      pendingPayouts: 45200,
      refunds: 3400
    };
    // Mock Payment Methods mapping 
    const paymentMethods = [
      { name: "Credit Card", value: 45, color: "#6366f1" },
      { name: "PayPal", value: 25, color: "#10b981" },
      { name: "COD", value: 20, color: "#f59e0b" },
      { name: "Bank Transfer", value: 10, color: "#8b5cf6" }
    ];

    res.json({ revenueData, metrics, paymentMethods });
  } catch (err) { next(err); }
};

export const getTransactions = async (req, res, next) => {
  try {
    const { type, search } = req.query;
    let filter = {};
    if (type && type !== "all") filter.type = type;
    
    // In a real scenario we'd query by populated fromUser/toUser for search, but for now we return all matching types
    const transactions = await Transaction.find(filter)
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) { next(err); }
};
