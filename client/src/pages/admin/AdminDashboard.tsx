import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  UsersIcon,
  PackageIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  LayoutTemplateIcon,
  TrendingUpIcon,
  ActivityIcon,
  ShieldCheckIcon } from
'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area } from
'recharts';
const ADMIN_SIDEBAR = [
{
  icon: ActivityIcon,
  label: 'Dashboard',
  path: '/admin/dashboard'
},
{
  icon: UsersIcon,
  label: 'Users',
  path: '/admin/users'
},
{
  icon: PackageIcon,
  label: 'Categories',
  path: '/admin/categories'
},
{
  icon: PackageIcon,
  label: 'Products',
  path: '/admin/products'
},
{
  icon: ShoppingBagIcon,
  label: 'Orders',
  path: '/admin/orders'
},
{
  icon: DollarSignIcon,
  label: 'Finance',
  path: '/admin/finance'
},
{
  icon: LayoutTemplateIcon,
  label: 'CMS',
  path: '/admin/cms'
}];

// Mock Data
const REVENUE_DATA = [
{
  name: 'Mon',
  revenue: 4000
},
{
  name: 'Tue',
  revenue: 3000
},
{
  name: 'Wed',
  revenue: 2000
},
{
  name: 'Thu',
  revenue: 2780
},
{
  name: 'Fri',
  revenue: 1890
},
{
  name: 'Sat',
  revenue: 2390
},
{
  name: 'Sun',
  revenue: 3490
}];

const ORDERS_DATA = [
{
  name: 'Mon',
  orders: 40
},
{
  name: 'Tue',
  orders: 30
},
{
  name: 'Wed',
  orders: 20
},
{
  name: 'Thu',
  orders: 27
},
{
  name: 'Fri',
  orders: 18
},
{
  name: 'Sat',
  orders: 23
},
{
  name: 'Sun',
  orders: 34
}];

const RECENT_ACTIVITY = [
{
  id: 1,
  user: 'John Doe',
  action: 'registered as a new customer',
  time: '2 mins ago',
  icon: UsersIcon,
  color: 'text-blue-500',
  bg: 'bg-blue-100'
},
{
  id: 2,
  user: 'TechGadgets',
  action: 'added a new product',
  time: '15 mins ago',
  icon: PackageIcon,
  color: 'text-indigo-500',
  bg: 'bg-indigo-100'
},
{
  id: 3,
  user: 'System',
  action: 'processed payout for 12 sellers',
  time: '1 hour ago',
  icon: DollarSignIcon,
  color: 'text-green-500',
  bg: 'bg-green-100'
},
{
  id: 4,
  user: 'Admin User',
  action: 'updated homepage banner',
  time: '3 hours ago',
  icon: LayoutTemplateIcon,
  color: 'text-purple-500',
  bg: 'bg-purple-100'
},
{
  id: 5,
  user: 'Jane Smith',
  action: 'reported an issue with order #1042',
  time: '5 hours ago',
  icon: ShieldCheckIcon,
  color: 'text-red-500',
  bg: 'bg-red-100'
}];

export function AdminDashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:5000/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);
  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Admin Overview"
      role="Admin">
      
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              +5.2%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Users
          </h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalSellers || 0} Sellers • {(stats.totalUsers || 0) - (stats.totalSellers || 0)} Customers
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <PackageIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              +12.5%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Products
          </h3>
          <p className="text-2xl font-bold text-gray-900">{(stats.activeProducts || 0) + (stats.pendingProducts || 0)}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.pendingProducts || 0} pending approval</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <DollarSignIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              +8.4%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Platform Revenue
          </h3>
          <p className="text-2xl font-bold text-gray-900">${(stats.revenue || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">
            This month (5% commission)
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg">
              <TrendingUpIcon className="h-4 w-4 mr-1 rotate-180" />
              -2.1%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Orders
          </h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
          <p className="text-xs text-gray-500 mt-2">1,204 active deliveries</p>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Trend
            </h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={REVENUE_DATA}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0
                }}>
                
                <defs>
                  <linearGradient
                    id="colorAdminRev"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                  dy={10} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                  tickFormatter={(value) => `$${value}`} />
                
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => [`$${value}`, 'Revenue']} />
                
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorAdminRev)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Orders Volume
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ORDERS_DATA}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                  dy={10} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }} />
                
                <Tooltip
                  cursor={{
                    fill: '#f3f4f6'
                  }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }} />
                
                <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity
            </h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View All
            </button>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-0 bottom-0 left-6 w-px bg-gray-200" />

            <div className="space-y-6 relative">
              {RECENT_ACTIVITY.map((activity) =>
              <div key={activity.id} className="flex items-start">
                  <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${activity.bg} ${activity.color}`}>
                  
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="ml-4 mt-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">{activity.user}</span>{' '}
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mr-3 group-hover:text-indigo-600">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-900">
                  Review Pending Products
                </span>
              </div>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">
                12
              </span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mr-3 group-hover:text-indigo-600">
                  <UsersIcon className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-900">
                  Manage Seller Requests
                </span>
              </div>
              <span className="bg-yellow-100 text-yellow-600 text-xs font-bold px-2 py-1 rounded-full">
                5
              </span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mr-3 group-hover:text-indigo-600">
                  <DollarSignIcon className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-900">
                  Process Payouts
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>);

}