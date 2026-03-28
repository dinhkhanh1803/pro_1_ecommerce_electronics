import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  PackageIcon,
  ShoppingBagIcon,
  BarChart2Icon,
  TagIcon,
  StarIcon,
  MessageSquareIcon,
  SearchIcon,
  FilterIcon,
  EyeIcon,
  ChevronDownIcon } from
'lucide-react';
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
const MOCK_ORDERS = [
{
  id: 'ORD-2023-1042',
  customer: 'John Doe',
  date: 'Oct 24, 2023, 10:30 AM',
  itemsCount: 2,
  total: 129.99,
  status: 'processing',
  paymentMethod: 'Credit Card'
},
{
  id: 'ORD-2023-1041',
  customer: 'Jane Smith',
  date: 'Oct 23, 2023, 2:15 PM',
  itemsCount: 1,
  total: 89.5,
  status: 'pending',
  paymentMethod: 'PayPal'
},
{
  id: 'ORD-2023-1040',
  customer: 'Alice Johnson',
  date: 'Oct 22, 2023, 9:00 AM',
  itemsCount: 3,
  total: 245.0,
  status: 'shipping',
  paymentMethod: 'COD'
},
{
  id: 'ORD-2023-1039',
  customer: 'Bob Brown',
  date: 'Oct 20, 2023, 4:45 PM',
  itemsCount: 1,
  total: 45.0,
  status: 'delivered',
  paymentMethod: 'Credit Card'
},
{
  id: 'ORD-2023-1038',
  customer: 'Charlie Davis',
  date: 'Oct 19, 2023, 11:30 AM',
  itemsCount: 2,
  total: 150.0,
  status: 'cancelled',
  paymentMethod: 'Credit Card'
}];

export function SellerOrders() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const tabs = [
  {
    id: 'all',
    label: 'All Orders'
  },
  {
    id: 'pending',
    label: 'Pending'
  },
  {
    id: 'processing',
    label: 'Processing'
  },
  {
    id: 'shipping',
    label: 'Shipping'
  },
  {
    id: 'delivered',
    label: 'Delivered'
  },
  {
    id: 'cancelled',
    label: 'Cancelled'
  }];

  const filteredOrders =
  activeTab === 'all' ?
  MOCK_ORDERS :
  MOCK_ORDERS.filter((order) => order.status === activeTab);
  const handleStatusChange = (orderId: string, newStatus: string) => {
    console.log(`Update order ${orderId} to ${newStatus}`);
    setOpenDropdownId(null);
    // In a real app, this would trigger an API call to update the order status
  };
  return (
    <DashboardLayout sidebarItems={SELLER_SIDEBAR} title="Orders" role="Seller">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders (ID, Customer)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            
          </div>
          <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>

        <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium w-full sm:w-auto">
          Export Orders
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-t-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-4 px-6 font-medium text-sm transition-colors relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            
              {tab.label}
              {activeTab === tab.id &&
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
            }
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ?
              filteredOrders.map((order) =>
              <tr
                key={order.id}
                className="hover:bg-gray-50 transition-colors">
                
                    <td className="p-4">
                      <Link
                    to={`/seller/orders/${order.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    
                        {order.id}
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{order.date}</td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.paymentMethod}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.itemsCount} items
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={order.status as any} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Status Update Dropdown */}
                        <div className="relative">
                          <button
                        onClick={() =>
                        setOpenDropdownId(
                          openDropdownId === order.id ? null : order.id
                        )
                        }
                        className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        
                            <span>Update</span>
                            <ChevronDownIcon className="h-4 w-4" />
                          </button>

                          {openDropdownId === order.id &&
                      <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-10">
                              {[
                        'pending',
                        'processing',
                        'shipping',
                        'delivered',
                        'cancelled'].
                        map((status) =>
                        <button
                          key={status}
                          onClick={() =>
                          handleStatusChange(order.id, status)
                          }
                          className={`block w-full text-left px-4 py-2 text-sm capitalize hover:bg-gray-50 ${order.status === status ? 'text-indigo-600 font-medium bg-indigo-50/50' : 'text-gray-700'}`}>
                          
                                  {status}
                                </button>
                        )}
                            </div>
                      }
                        </div>

                        <Link
                      to={`/seller/orders/${order.id}`}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="View Details">
                      
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
              ) :

              <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No orders found matching the selected criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 &&
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">1</span> to{' '}
              <span className="font-medium text-gray-900">
                {filteredOrders.length}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-900">
                {filteredOrders.length}
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