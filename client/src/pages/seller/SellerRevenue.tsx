import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  PackageIcon,
  ShoppingBagIcon,
  BarChart2Icon,
  TagIcon,
  StarIcon,
  MessageSquareIcon,
  TrendingUpIcon,
  DollarSignIcon,
  CreditCardIcon,
  UsersIcon,
  CalendarIcon,
  DownloadIcon } from
'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area } from
'recharts';
const SELLER_SIDEBAR = [
{
  icon: BarChart2Icon,
  label: 'Dashboard',
  path: '/seller/dashboard'
},
{
  icon: PackageIcon,
  label: 'Products',
  path: '/seller/products'
},
{
  icon: ShoppingBagIcon,
  label: 'Orders',
  path: '/seller/orders'
},
{
  icon: TagIcon,
  label: 'Promotions',
  path: '/seller/promotions'
},
{
  icon: StarIcon,
  label: 'Reviews',
  path: '/seller/reviews'
},
{
  icon: MessageSquareIcon,
  label: 'Messages',
  path: '/seller/messages'
}];

// Mock Data
const REVENUE_DATA = [
{
  date: 'Oct 1',
  revenue: 1200,
  orders: 15
},
{
  date: 'Oct 5',
  revenue: 1800,
  orders: 22
},
{
  date: 'Oct 10',
  revenue: 1500,
  orders: 18
},
{
  date: 'Oct 15',
  revenue: 2400,
  orders: 30
},
{
  date: 'Oct 20',
  revenue: 2100,
  orders: 25
},
{
  date: 'Oct 25',
  revenue: 3200,
  orders: 40
},
{
  date: 'Oct 30',
  revenue: 2800,
  orders: 35
}];

const RECENT_TRANSACTIONS = [
{
  id: 'TRX-1042',
  date: 'Oct 24, 2023',
  amount: 129.99,
  status: 'completed',
  method: 'Credit Card'
},
{
  id: 'TRX-1041',
  date: 'Oct 23, 2023',
  amount: 89.5,
  status: 'completed',
  method: 'PayPal'
},
{
  id: 'TRX-1040',
  date: 'Oct 22, 2023',
  amount: 245.0,
  status: 'pending',
  method: 'Bank Transfer'
},
{
  id: 'TRX-1039',
  date: 'Oct 20, 2023',
  amount: 45.0,
  status: 'completed',
  method: 'Credit Card'
}];

export function SellerRevenue() {
  const [dateRange, setDateRange] = useState('last30');
  return (
    <DashboardLayout
      sidebarItems={SELLER_SIDEBAR}
      title="Revenue Dashboard"
      role="Seller">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium">
              
              <option value="today">Today</option>
              <option value="last7">Last 7 Days</option>
              <option value="last30">Last 30 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="year">This Year</option>
            </select>
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

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
            Total Revenue
          </h3>
          <p className="text-2xl font-bold text-gray-900">$15,000.00</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              +8.2%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Total Orders
          </h3>
          <p className="text-2xl font-bold text-gray-900">185</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-green-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg">
              <TrendingUpIcon className="h-4 w-4 mr-1 rotate-180" />
              -2.4%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Avg. Order Value
          </h3>
          <p className="text-2xl font-bold text-gray-900">$81.08</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
            <span className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              +15.3%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Unique Customers
          </h3>
          <p className="text-2xl font-bold text-gray-900">142</p>
        </div>
      </div>

      {/* Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Revenue Overview
            </h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
            </div>
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
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e5e7eb" />
                
                <XAxis
                  dataKey="date"
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
                  stroke="#6366f1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)" />
                
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h3>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View All
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {RECENT_TRANSACTIONS.map((trx) =>
            <div
              key={trx.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
              
                <div className="flex items-center space-x-3">
                  <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.status === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  
                    <DollarSignIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {trx.id}
                    </p>
                    <p className="text-xs text-gray-500">{trx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">
                    +${trx.amount.toFixed(2)}
                  </p>
                  <p
                  className={`text-xs font-medium capitalize ${trx.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                  
                    {trx.status}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>);

}