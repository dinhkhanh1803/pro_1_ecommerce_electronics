import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const pendingProducts = await Product.countDocuments({ status: "pending" });
    const activeProducts = await Product.countDocuments({ status: "active" });
    const totalOrders = await Order.countDocuments();
    
    res.json({
      totalUsers,
      totalSellers,
      pendingProducts,
      activeProducts,
      totalOrders,
      revenue: 120500 // Mocked overall revenue
    });
  } catch(error) { next(error); }
};

export const getSellerDashboardStats = async (req, res, next) => {
  try {
    const sellerId = req.user._id;
    const { dateRange } = req.query; // 'today', 'last7', 'last30', 'thisMonth', 'lastMonth', 'year'

    // Determine Date Filter
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    let endDate = new Date(); // now

    if (dateRange === 'today') {
      // Do nothing, already set to today's start
    } else if (dateRange === 'last7') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (dateRange === 'last30' || !dateRange) { // default 30
      startDate.setDate(startDate.getDate() - 30);
    } else if (dateRange === 'thisMonth') {
      startDate.setDate(1); // 1st of this month
    } else if (dateRange === 'lastMonth') {
      startDate.setMonth(startDate.getMonth() - 1);
      startDate.setDate(1);
      endDate = new Date();
      endDate.setMonth(endDate.getMonth());
      endDate.setDate(0); // last day of last month
      endDate.setHours(23, 59, 59, 999);
    } else if (dateRange === 'year') {
      startDate.setMonth(0);
      startDate.setDate(1);
    }

    const matchDateFilter = {
      seller: sellerId,
      createdAt: { $gte: startDate, $lte: endDate }
    };

    // We fetch all orders within this date range for metrics
    const ordersRange = await Order.find(matchDateFilter).populate("customer", "name email");

    // "Successful" orders - for Revenue / Avg Order Value
    const successfulOrders = ordersRange.filter(o => o.orderStatus === 'delivered' || o.paymentStatus === 'completed');
    
    const totalOrdersCount = ordersRange.length;
    const totalRevenue = successfulOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const avgOrderValue = successfulOrders.length > 0 ? (totalRevenue / successfulOrders.length) : 0;
    
    // Unique Customers logic
    const uniqueCustomersMap = {};
    ordersRange.forEach(o => {
      if(o.customer && o.customer._id) {
         uniqueCustomersMap[o.customer._id.toString()] = true;
      }
    });
    const uniqueCustomers = Object.keys(uniqueCustomersMap).length;

    // Daily Revenue Data using Aggregation
    const revenueDataPipeline = [
      {
        $match: {
           seller: sellerId,
           createdAt: { $gte: startDate, $lte: endDate },
           $or: [{ orderStatus: 'delivered' }, { paymentStatus: 'completed' }]
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ];

    const aggregatedData = await Order.aggregate(revenueDataPipeline);
    
    // Format for Recharts
    const revenueData = aggregatedData.map(item => {
      // Create a nice date string like 'Oct 24'
      const dateObj = new Date(item._id);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: formattedDate,
        revenue: item.revenue,
        orders: item.orders
      };
    });

    // Recent Transactions (Limit 10)
    const recentTransactions = ordersRange.slice(0, 10).map(o => ({
      id: o._id.toString().substring(0, 10).toUpperCase(),
      date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: o.totalAmount,
      status: o.paymentStatus === 'completed' || o.orderStatus === 'delivered' ? 'completed' : 'pending',
      method: o.paymentMethod || 'COD'
    }));

    res.json({
      totalRevenue,
      totalOrders: totalOrdersCount,
      avgOrderValue,
      uniqueCustomers,
      revenueData,
      recentTransactions
    });

  } catch(error) { next(error); }
};

