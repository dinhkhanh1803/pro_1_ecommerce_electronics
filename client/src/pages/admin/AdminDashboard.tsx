import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  UsersIcon,
  PackageIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  TrendingUpIcon,
  ActivityIcon,
  ShieldCheckIcon } from
'lucide-react';
import {
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
import { ADMIN_SIDEBAR } from '../../constants/sidebar';
import { formatVND } from '../../utils/format';

// Mapped directly from API now

const getTimeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Vừa mới đây';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

const getIconForActivity = (type: string) => {
  switch (type) {
    case 'user': return { icon: UsersIcon, color: 'text-blue-500', bg: 'bg-blue-100' };
    case 'product': return { icon: PackageIcon, color: 'text-indigo-500', bg: 'bg-indigo-100' };
    case 'order': return { icon: ShoppingBagIcon, color: 'text-green-500', bg: 'bg-green-100' };
    default: return { icon: ActivityIcon, color: 'text-gray-500', bg: 'bg-gray-100' };
  }
};

export function AdminDashboard() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);
  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Tổng quan Quản trị"
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
            Tổng người dùng
          </h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
          <p className="text-xs text-gray-500 mt-2">
            {stats.totalSellers || 0} Người bán • {(stats.totalUsers || 0) - (stats.totalSellers || 0)} Khách hàng
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
            Tổng sản phẩm
          </h3>
          <p className="text-2xl font-bold text-gray-900">{(stats.activeProducts || 0) + (stats.pendingProducts || 0)}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.pendingProducts || 0} đang chờ duyệt</p>
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
            Doanh thu hệ thống
          </h3>
          <p className="text-2xl font-bold text-gray-900">{formatVND(stats.revenue || 0)}</p>
          <p className="text-xs text-gray-500 mt-2">
            Tháng này (5% hoa hồng)
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
            Tổng đơn hàng
          </h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
          <p className="text-xs text-gray-500 mt-2">{stats.totalOrders || 0} đơn hàng đang hoạt động</p>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Xu hướng doanh thu
            </h3>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Tuần này</option>
              <option>Tuần trước</option>
              <option>Tháng này</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.revenueData || []}
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
                  tickFormatter={(value) => formatVND(value)} />
                
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number) => [formatVND(value), 'Doanh thu']} />
                
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
              Lượng đơn hàng
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.ordersData || []}
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
              Hoạt động gần đây
            </h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Xem tất cả
            </button>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute top-0 bottom-0 left-6 w-px bg-gray-200" />

            <div className="space-y-6 relative">
              {stats.activities?.map((activity: any) => {
                const style = getIconForActivity(activity.type);
                return (
                  <div key={activity.id} className="flex items-start">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-white ${style.bg} ${style.color}`}>
                      <style.icon className="h-5 w-5" />
                    </div>
                    <div className="ml-4 mt-1">
                      <p className="text-sm text-gray-900 line-clamp-2">
                        <span className="font-semibold">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(activity.time)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {(!stats.activities || stats.activities.length === 0) && (
                <p className="text-center text-gray-500 py-4">Chưa có hoạt động nào gần đây.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Thao tác nhanh
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mr-3 group-hover:text-indigo-600">
                  <ShieldCheckIcon className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-900">
                  Duyệt sản phẩm chờ
                </span>
              </div>
              {stats.pendingProducts > 0 &&
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  {stats.pendingProducts}
                </span>
              }
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-colors group">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mr-3 group-hover:text-indigo-600">
                  <UsersIcon className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-900">
                  Quản lý yêu cầu người bán
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
                  Xử lý thanh toán
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>);

}