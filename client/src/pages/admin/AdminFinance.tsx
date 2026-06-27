import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  DollarSignIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  TrendingUpIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon } from
'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell } from
'recharts';
import { ADMIN_SIDEBAR } from '../../constants/sidebar';
import { formatVND } from '../../utils/format';

export function AdminFinance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [overview, setOverview] = useState<any>({ revenueData: [], metrics: {}, paymentMethods: [] });
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${import.meta.env.VITE_API_URL}/api/finance/overview`, { headers })
      .then(res => res.json())
      .then(data => setOverview(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${import.meta.env.VITE_API_URL}/api/finance/transactions?type=${typeFilter}`, { headers })
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(console.error);
  }, [typeFilter]);

  const filteredTransactions = transactions.filter((trx) => {
    const matchesType = typeFilter === 'all' || trx.type === typeFilter;
    const fromName = trx.fromUser?.name || 'Hệ thống';
    const toName = trx.toUser?.name || 'Hệ thống';
    const matchesSearch =
      trx._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fromName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      toName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const { revenueData = [], metrics = {}, paymentMethods = [] } = overview;
  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Quản lý tài chính"
      role="Admin">

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <DollarSignIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              +12.5%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Tổng khối lượng giao dịch
          </h3>
          <p className="text-2xl font-bold text-gray-900">{formatVND(metrics.totalVolume || 0)}</p>
          <p className="text-xs text-gray-500 mt-2">30 ngày qua</p>
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
            Giao dịch hoàn tất
          </h3>
          <p className="text-2xl font-bold text-gray-900">{metrics.completedTransactions || 0}</p>
          <p className="text-xs text-gray-500 mt-2">30 ngày qua</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ArrowUpRightIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Thanh toán đang chờ
          </h3>
          <p className="text-2xl font-bold text-gray-900">{metrics.pendingPayments || 0}</p>
          <p className="text-xs text-gray-500 mt-2">Đơn chưa hoàn tất thanh toán</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
              <ArrowDownRightIcon className="h-6 w-6 text-red-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg">
              <TrendingUpIcon className="h-4 w-4 mr-1 rotate-180" />
              -1.2%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Hoàn tiền</h3>
          <p className="text-2xl font-bold text-gray-900">{formatVND(metrics.refunds || 0)}</p>
          <p className="text-xs text-gray-500 mt-2">30 ngày qua</p>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Phân tích doanh thu
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                <span className="text-sm text-gray-600">Tổng khối lượng</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm text-gray-600">Hoàn tiền</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
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
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                  tickFormatter={(value) => `${Math.round(value / 1000).toLocaleString("vi-VN")}K`} />

                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                  tickFormatter={(value) => `${Math.round(value / 1000).toLocaleString("vi-VN")}K`} />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                  formatVND(value),
                  name === 'revenue' ? 'Tổng khối lượng' : 'Hoàn tiền']
                  } />

                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6
                  }} />

                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="refunds"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{
                    r: 6
                  }} />

              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Phương thức thanh toán
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-48 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethods}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value">

                    {paymentMethods.map((entry: any, index: number) =>
                    <Cell key={`cell-${index}`} fill={entry.color} />
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Tỷ lệ sử dụng']} />

                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3">
              {paymentMethods.map((method: any) =>
              <div
                key={method.name}
                className="flex items-center justify-between">

                  <div className="flex items-center">
                    <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{
                      backgroundColor: method.color
                    }}>
                  </span>
                    <span className="text-sm text-gray-700">{method.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {method.value}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Giao dịch gần đây
          </h3>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm giao dịch..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />

            </div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">

                <option value="all">Tất cả loại</option>
                <option value="payment">Thanh toán</option>
                <option value="payout">Rút tiền</option>
                <option value="refund">Hoàn tiền</option>
              </select>
              <FilterIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              <DownloadIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mã giao dịch
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Từ / Đến
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Thực nhận
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length > 0 ?
              filteredTransactions.map((trx) =>
              <tr
                key={trx._id}
                className="hover:bg-gray-50 transition-colors">

                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {trx._id}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(trx.createdAt).toLocaleString("vi-VN")}</div>
                    </td>
                    <td className="p-4">
                      <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${trx.type === 'payment' ? 'bg-blue-100 text-blue-800' : trx.type === 'payout' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'}`}>

                        {trx.type === 'payment' ? 'Thanh toán' : trx.type === 'payout' ? 'Rút tiền' : 'Hoàn tiền'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">
                        <span className="text-gray-500">Từ:</span> {trx.fromUser?.name || 'Hệ thống'}
                      </div>
                      <div className="text-sm text-gray-900">
                        <span className="text-gray-500">Đến:</span> {trx.toUser?.name || 'Hệ thống'}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {formatVND(trx.amount || 0)}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      {formatVND(trx.net || 0)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={trx.status as any} />
                    </td>
                  </tr>
              ) :

              <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Không tìm thấy giao dịch nào phù hợp với tiêu chí đã chọn.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredTransactions.length > 0 &&
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Hiển thị từ <span className="font-medium text-gray-900">1</span> đến{' '}
              <span className="font-medium text-gray-900">
                {filteredTransactions.length}
              </span>{' '}
              trên{' '}
              <span className="font-medium text-gray-900">
                {filteredTransactions.length}
              </span>{' '}
              kết quả
            </p>
            <div className="flex space-x-2">
              <button
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled>

                Trước
              </button>
              <button
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled>

                Sau
              </button>
            </div>
          </div>
        }
      </div>
    </DashboardLayout>);

}
