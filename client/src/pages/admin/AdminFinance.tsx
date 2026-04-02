import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  UsersIcon,
  PackageIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  LayoutTemplateIcon,
  ActivityIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  TrendingUpIcon,
  CreditCardIcon,
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
// {
//   icon: DollarSignIcon,
//   label: 'Finance',
//   path: '/admin/finance'
// },
{
  icon: LayoutTemplateIcon,
  label: 'CMS',
  path: '/admin/cms'
}];

// Mock Data
const REVENUE_DATA = [
{
  name: 'Jan',
  revenue: 40000,
  commission: 2000
},
{
  name: 'Feb',
  revenue: 30000,
  commission: 1500
},
{
  name: 'Mar',
  revenue: 20000,
  commission: 1000
},
{
  name: 'Apr',
  revenue: 27800,
  commission: 1390
},
{
  name: 'May',
  revenue: 18900,
  commission: 945
},
{
  name: 'Jun',
  revenue: 23900,
  commission: 1195
},
{
  name: 'Jul',
  revenue: 34900,
  commission: 1745
}];

const PAYMENT_METHODS = [
{
  name: 'Credit Card',
  value: 45,
  color: '#6366f1'
},
{
  name: 'PayPal',
  value: 25,
  color: '#10b981'
},
{
  name: 'COD',
  value: 20,
  color: '#f59e0b'
},
{
  name: 'Bank Transfer',
  value: 10,
  color: '#8b5cf6'
}];

const MOCK_TRANSACTIONS = [
{
  id: 'TRX-1042',
  date: 'Oct 24, 2023, 10:30 AM',
  type: 'payment',
  amount: 129.99,
  fee: 3.9,
  net: 126.09,
  from: 'John Doe',
  to: 'TechGadgets Official',
  status: 'completed'
},
{
  id: 'TRX-1041',
  date: 'Oct 23, 2023, 2:15 PM',
  type: 'payout',
  amount: 1500.0,
  fee: 0,
  net: 1500.0,
  from: 'System',
  to: 'Fashion Boutique',
  status: 'processing'
},
{
  id: 'TRX-1040',
  date: 'Oct 22, 2023, 9:00 AM',
  type: 'refund',
  amount: 45.0,
  fee: -1.35,
  net: -43.65,
  from: 'Home Essentials',
  to: 'Alice Johnson',
  status: 'completed'
},
{
  id: 'TRX-1039',
  date: 'Oct 20, 2023, 4:45 PM',
  type: 'payment',
  amount: 245.0,
  fee: 7.35,
  net: 237.65,
  from: 'Bob Brown',
  to: 'TechGadgets Official',
  status: 'completed'
}];

export function AdminFinance() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  const [overview, setOverview] = useState<any>({ revenueData: [], metrics: {}, paymentMethods: [] });
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    
    fetch(`http://localhost:5000/api/finance/overview`, { headers })
      .then(res => res.json())
      .then(data => setOverview(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    
    fetch(`http://localhost:5000/api/finance/transactions?type=${typeFilter}`, { headers })
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(console.error);
  }, [typeFilter]);

  const filteredTransactions = transactions.filter((trx) => {
    const matchesType = typeFilter === 'all' || trx.type === typeFilter;
    const fromName = trx.fromUser?.name || 'System';
    const toName = trx.toUser?.name || 'System';
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
      title="Financial Management"
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
            Total Processing Volume
          </h3>
          <p className="text-2xl font-bold text-gray-900">${(metrics.totalVolume || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
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
            Platform Revenue (Fees)
          </h3>
          <p className="text-2xl font-bold text-gray-900">${(metrics.platformRevenue || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ArrowUpRightIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Pending Payouts
          </h3>
          <p className="text-2xl font-bold text-gray-900">${(metrics.pendingPayouts || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">To 142 sellers</p>
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
          <h3 className="text-sm font-medium text-gray-500 mb-1">Refunds</h3>
          <p className="text-2xl font-bold text-gray-900">${(metrics.refunds || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-2">Last 30 days</p>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Analytics
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                <span className="text-sm text-gray-600">Total Volume</span>
              </div>
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                <span className="text-sm text-gray-600">Platform Fees</span>
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
                  tickFormatter={(value) => `$${value / 1000}k`} />
                
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                  tickFormatter={(value) => `$${value / 1000}k`} />
                
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                  `$${value}`,
                  name === 'revenue' ? 'Total Volume' : 'Platform Fees']
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
                  dataKey="commission"
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
            Payment Methods
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
                    formatter={(value: number) => [`${value}%`, 'Usage']} />
                  
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
            Recent Transactions
          </h3>
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              
            </div>
            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
                
                <option value="all">All Types</option>
                <option value="payment">Payments</option>
                <option value="payout">Payouts</option>
                <option value="refund">Refunds</option>
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
                  Transaction ID
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  From / To
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Fee
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Net
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
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
                      <div className="text-xs text-gray-500">{new Date(trx.createdAt).toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${trx.type === 'payment' ? 'bg-blue-100 text-blue-800' : trx.type === 'payout' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'}`}>
                    
                        {trx.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">
                        <span className="text-gray-500">From:</span> {trx.fromUser?.name || 'System'}
                      </div>
                      <div className="text-sm text-gray-900">
                        <span className="text-gray-500">To:</span> {trx.toUser?.name || 'System'}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      ${trx.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-red-600">
                      {trx.fee !== 0 ?
                  `-$${Math.abs(trx.fee).toFixed(2)}` :
                  '$0.00'}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      ${trx.net.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={trx.status as any} />
                    </td>
                  </tr>
              ) :

              <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No transactions found matching the selected criteria.
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
              Showing <span className="font-medium text-gray-900">1</span> to{' '}
              <span className="font-medium text-gray-900">
                {filteredTransactions.length}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-900">
                {filteredTransactions.length}
              </span>{' '}
              results
            </p>
            <div className="flex space-x-2">
              <button
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled>
              
                Previous
              </button>
              <button
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              disabled>
              
                Next
              </button>
            </div>
          </div>
        }
      </div>
    </DashboardLayout>);

}