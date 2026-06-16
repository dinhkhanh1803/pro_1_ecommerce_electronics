import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  UsersIcon,
  PackageIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  TrendingUpIcon,
  ActivityIcon,
  ShieldCheckIcon,
  FileSpreadsheetIcon
} from 'lucide-react';
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
import { exportAdminDashboardToExcel } from '../../utils/excelExport';

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
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    let url = `${import.meta.env.VITE_API_URL}/api/dashboard/stats`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryStr = params.toString();
    if (queryStr) url += `?${queryStr}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, [startDate, endDate]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");
      let url = `${import.meta.env.VITE_API_URL}/api/dashboard/stats?export=true`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const fullStats = await res.json();
      await exportAdminDashboardToExcel(fullStats);
    } catch (error) {
      console.error('Lỗi khi xuất excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const html2pdf = await new Promise<any>((resolve, reject) => {
        if ((window as any).html2pdf) {
          resolve((window as any).html2pdf);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => resolve((window as any).html2pdf);
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
      });

      const element = document.getElementById('admin-dashboard-content');
      if (!element) return;

      const opt = {
        margin: 10,
        filename: `Bao_cao_tong_quan_ShopHub_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      const pdfBlob = await html2pdf().from(element).set(opt).outputPdf('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Bao_cao_tong_quan_ShopHub_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi khi xuất PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Tổng quan Quản trị"
      role="Admin">
      
      {/* Top action header */}
      <div data-html2canvas-ignore="true" className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-8 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Báo cáo & Thống kê hệ thống</h2>
          <p className="text-sm text-gray-500 mt-1">Xem phân tích dữ liệu hoạt động và xuất báo cáo PDF/Excel.</p>
        </div>
        
        {/* Actions wrapper */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
          {/* Date filters */}
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 p-2 rounded-xl text-sm shrink-0">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 font-medium px-1">Từ</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent border-0 text-gray-700 font-medium focus:ring-0 focus:outline-none w-32"
              />
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-400 font-medium px-1">Đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent border-0 text-gray-700 font-medium focus:ring-0 focus:outline-none w-32"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-50 rounded-lg ml-1 hover:bg-red-100 transition-colors"
                title="Xóa bộ lọc"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Excel export */}
            <button
              onClick={handleExport}
              disabled={isExporting || isExportingPDF}
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-95 disabled:pointer-events-none"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang tải...
                </>
              ) : (
                <>
                  <FileSpreadsheetIcon className="h-4 w-4" />
                  Xuất Excel
                </>
              )}
            </button>

            {/* PDF export */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting || isExportingPDF}
              className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-95 disabled:pointer-events-none"
            >
              {isExportingPDF ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang tạo PDF...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Xuất PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div id="admin-dashboard-content" className="space-y-6">

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
                  }}
                  formatter={(value: number) => [value, 'Đơn hàng']} />
                
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
      </div>
    </DashboardLayout>);

}
