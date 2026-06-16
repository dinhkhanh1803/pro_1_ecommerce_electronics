import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate, export: isExport } = req.query;

    let userFilter = {};
    let productFilter = {};
    let orderFilter = {};

    let start = null;
    let end = null;

    if (startDate || endDate) {
      start = startDate ? new Date(startDate) : new Date(0);
      end = endDate ? new Date(endDate) : new Date();
      if (startDate) start.setHours(0, 0, 0, 0);
      if (endDate) end.setHours(23, 59, 59, 999);

      userFilter.createdAt = { $gte: start, $lte: end };
      productFilter.createdAt = { $gte: start, $lte: end };
      orderFilter.createdAt = { $gte: start, $lte: end };
    }

    const totalUsers = await User.countDocuments(userFilter);
    const totalSellers = await User.countDocuments({ role: "seller", ...userFilter });
    const pendingProducts = await Product.countDocuments({ status: "pending", ...productFilter });
    const activeProducts = await Product.countDocuments({ status: "active", ...productFilter });
    const totalOrders = await Order.countDocuments(orderFilter);
    
    // Revenue logic: 5% of all delivered orders in the range
    const deliveredOrders = await Order.find({ orderStatus: "delivered", ...orderFilter });
    const revenue = deliveredOrders.reduce((sum, order) => sum + (order.totalAmount * 0.05), 0);

    // Trend mapping based on filter dates
    let trendStart = new Date();
    let trendEnd = new Date();
    trendEnd.setHours(23, 59, 59, 999);

    if (start && end) {
      trendStart = new Date(start);
      trendEnd = new Date(end);
    } else {
      // default last 7 days
      trendStart.setDate(trendStart.getDate() - 6);
      trendStart.setHours(0, 0, 0, 0);
    }

    const ordersInTrend = await Order.find({ createdAt: { $gte: trendStart, $lte: trendEnd } });
    
    const revenueDataMap = {};
    const ordersDataMap = {};

    // Loop through dates day-by-day
    const currentDate = new Date(trendStart);
    let iterations = 0;
    while (currentDate <= trendEnd && iterations < 366) {
      const label = currentDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      revenueDataMap[label] = 0;
      ordersDataMap[label] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
      iterations++;
    }

    ordersInTrend.forEach(o => {
      const label = new Date(o.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      if (ordersDataMap[label] !== undefined) {
        ordersDataMap[label] += 1;
        if (o.orderStatus === 'delivered') {
          revenueDataMap[label] += (o.totalAmount * 0.05);
        }
      }
    });

    const revenueData = Object.keys(revenueDataMap).map(k => ({ name: k, revenue: revenueDataMap[k] }));
    const ordersData = Object.keys(ordersDataMap).map(k => ({ name: k, orders: ordersDataMap[k] }));

    // Recent Activity (we also filter or sort latest)
    const recentUsers = await User.find(userFilter).sort({ createdAt: -1 }).limit(5);
    const recentProducts = await Product.find(productFilter).sort({ createdAt: -1 }).limit(5).populate("seller", "name");
    const recentOrders = await Order.find(orderFilter).sort({ createdAt: -1 }).limit(5).populate("customer", "name");

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
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    const responseData = {
      totalUsers,
      totalSellers,
      pendingProducts,
      activeProducts,
      totalOrders,
      revenue,
      revenueData,
      ordersData,
      activities
    };

    if (isExport === 'true') {
      const ordersList = await Order.find(orderFilter)
        .populate("customer", "name email phone role status")
        .populate("seller", "name email phone")
        .populate("products.product", "name sku price")
        .sort({ createdAt: -1 });

      const productsList = await Product.find()
        .populate("seller", "name email")
        .populate("category", "name")
        .sort({ createdAt: -1 });

      const usersList = await User.find(userFilter).sort({ createdAt: -1 });

      responseData.ordersList = ordersList;
      responseData.productsList = productsList;
      responseData.usersList = usersList;
    }

    res.json(responseData);
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

