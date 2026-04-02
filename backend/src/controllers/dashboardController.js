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
    
    // Revenue logic: 5% of all delivered orders
    const deliveredOrders = await Order.find({ orderStatus: "delivered" });
    const revenue = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount * 0.05), 0);

    // Trend mapping (last 7 days)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 6);
    last7Days.setHours(0, 0, 0, 0);

    const orders7Days = await Order.find({ createdAt: { $gte: last7Days, $lte: today } });
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const revenueDataMap = {};
    const ordersDataMap = {};

    for (let i = 0; i < 7; i++) {
      const d = new Date(last7Days);
      d.setDate(d.getDate() + i);
      const label = dayNames[d.getDay()];
      revenueDataMap[label] = 0;
      ordersDataMap[label] = 0;
    }

    orders7Days.forEach(o => {
      const dayLabel = dayNames[o.createdAt.getDay()];
      if (ordersDataMap[dayLabel] !== undefined) {
        ordersDataMap[dayLabel] += 1;
        if (o.orderStatus === 'delivered') {
          revenueDataMap[dayLabel] += (o.totalAmount * 0.05);
        }
      }
    });

    const revenueData = Object.keys(revenueDataMap).map(k => ({ name: k, revenue: revenueDataMap[k] }));
    const ordersData = Object.keys(ordersDataMap).map(k => ({ name: k, orders: ordersDataMap[k] }));

    // Recent Activity
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5).populate("seller", "name");
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate("customer", "name");

    const activities = [
      ...recentUsers.map(u => ({
        id: `user-${u._id}`,
        user: u.name,
        action: 'vừa đăng ký tài khoản mới',
        time: u.createdAt,
        type: 'user'
      })),
      ...recentProducts.map(p => ({
        id: `product-${p._id}`,
        user: p.seller?.name || 'Seller',
        action: `vừa đăng sản phẩm mới: ${p.name}`,
        time: p.createdAt,
        type: 'product'
      })),
      ...recentOrders.map(o => ({
        id: `order-${o._id}`,
        user: o.customer?.name || 'Khách hàng',
        action: `vừa đặt đơn hàng mới #${o._id.toString().slice(-6).toUpperCase()}`,
        time: o.createdAt,
        type: 'order'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    res.json({
      totalUsers,
      totalSellers,
      pendingProducts,
      activeProducts,
      totalOrders,
      revenue,
      revenueData,
      ordersData,
      activities
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

