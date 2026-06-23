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
  Area,
  PieChart,
  Pie,
  Cell } from
'recharts';
import { ADMIN_SIDEBAR } from '../../constants/sidebar';
import { formatVND } from '../../utils/format';
import { exportAdminDashboardToExcel } from '../../utils/excelExport';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const STATUS_COLORS: { [key: string]: string } = {
  "Hoàn thành": "#10b981", // Green
  "Đang giao": "#3b82f6",   // Blue
  "Đang xử lý": "#6366f1",  // Indigo
  "Chờ xử lý": "#f59e0b",   // Amber
  "Đã hủy": "#ef4444",      // Red
  "Đã trả hàng": "#8b5cf6"  // Purple
};
const COLOR_PALETTE = ["#10b981", "#3b82f6", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"];

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
  const { settings } = useSiteSettings();
  const [stats, setStats] = useState<any>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topProductsRange, setTopProductsRange] = useState('month');

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    const url = `${import.meta.env.VITE_API_URL}/api/dashboard/top-products?range=${topProductsRange}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTopProducts(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [topProductsRange]);

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
      await exportAdminDashboardToExcel(fullStats, settings.siteName);
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
        filename: `Bao_cao_tong_quan_${settings.siteName}_${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      const pdfBlob = await html2pdf().from(element).set(opt).outputPdf('blob');
      const url = window.URL.createObjectURL(pdfBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `Bao_cao_tong_quan_${settings.siteName}_${new Date().toISOString().split('T')[0]}.pdf`;
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

  const orderStatusData = stats.orderStatusData || [];
  const totalOrderStatusCount = orderStatusData.reduce((sum: number, item: any) => sum + item.value, 0);
  
  const chartData = orderStatusData.map((item: any, index: number) => ({
    name: item.name,
    value: item.value,
    percent: totalOrderStatusCount > 0 ? ((item.value / totalOrderStatusCount) * 100).toFixed(1) + '%' : '0%',
    color: STATUS_COLORS[item.name] || COLOR_PALETTE[index % COLOR_PALETTE.length]
  }));

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
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Tỷ lệ trạng thái đơn hàng
            </h3>
          </div>
          <div className="flex-grow flex flex-col items-center justify-center">
            {chartData.length === 0 ? (
              <p className="text-sm text-gray-500 py-10">Không có dữ liệu đơn hàng.</p>
            ) : (
              <>
                <div className="h-48 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {chartData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        formatter={(value: number, name: string, props: any) => {
                          return [`${value} đơn (${props.payload.percent})`, 'Số lượng'];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full space-y-2.5">
                  {chartData.map((item: any) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center min-w-0">
                        <span
                          className="w-3 h-3 rounded-full mr-2.5 shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span className="text-gray-600 font-medium truncate whitespace-nowrap">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                        <span className="font-bold text-gray-900">
                          {item.value} đơn
                        </span>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg">
                          {item.percent}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Selling Products Chart */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Sản phẩm đặt hàng nhiều nhất
              </h3>
              <p className="text-sm text-gray-500 mt-1">Thống kê sản phẩm bán chạy theo số lượng order.</p>
            </div>
            <select
              value={topProductsRange}
              onChange={(e) => setTopProductsRange(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 pl-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="day">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="year">Năm nay</option>
            </select>
          </div>

          <div className="h-80 flex-grow">
            {topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Không có dữ liệu sản phẩm trong khoảng thời gian này.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topProducts}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 20,
                    bottom: 10
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    width={150}
                    tickFormatter={(val) => val.length > 22 ? val.substring(0, 20) + '...' : val}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} sản phẩm (Doanh thu: ${formatVND(props.payload.revenue)})`,
                      'Đã bán'
                    ]}
                  />
                  <Bar dataKey="quantity" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
      </div>
    </DashboardLayout>);

}
