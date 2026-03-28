import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerLayout } from '../../components/CustomerLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { ChevronRightIcon, PackageIcon } from 'lucide-react';
// Mock Data
const MOCK_ORDERS = [
{
  id: 'ORD-2023-1042',
  date: 'Oct 24, 2023',
  total: 129.99,
  status: 'delivered',
  items: [
  {
    id: '1',
    name: 'Wireless Noise-Cancelling Headphones Pro',
    image:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
    qty: 1
  },
  {
    id: '2',
    name: 'Premium Leather Case',
    image:
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&q=80',
    qty: 1
  }]

},
{
  id: 'ORD-2023-1041',
  date: 'Oct 20, 2023',
  total: 89.5,
  status: 'processing',
  items: [
  {
    id: '3',
    name: 'Smart Watch Series 7',
    image:
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&q=80',
    qty: 1
  }]

},
{
  id: 'ORD-2023-1040',
  date: 'Oct 15, 2023',
  total: 45.0,
  status: 'cancelled',
  items: [
  {
    id: '4',
    name: 'Minimalist Desk Lamp',
    image:
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150&q=80',
    qty: 2
  }]

}];

export function OrderHistory() {
  const [activeTab, setActiveTab] = useState('all');
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
  return (
    <CustomerLayout title="Order History">
      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-1 border-b border-gray-200 mb-6 pb-px scrollbar-hide">
        {tabs.map((tab) =>
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
          
            {tab.label}
          </button>
        )}
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ?
      <div className="space-y-6">
          {filteredOrders.map((order) =>
        <div
          key={order.id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Order ID
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Date Placed
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.date}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Amount
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <StatusBadge status={order.status as any} />
                  <Link
                to={`/orders/${order.id}`}
                className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                
                    View Details
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-6">
                <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                  {order.items.map((item, index) =>
              <div key={index} className="relative shrink-0 group">
                      <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                
                      <div className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                        {item.qty}
                      </div>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {item.name}
                      </div>
                    </div>
              )}
                  {order.items.length > 3 &&
              <div className="w-20 h-20 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0">
                      <span className="text-sm font-medium text-gray-500">
                        +{order.items.length - 3} more
                      </span>
                    </div>
              }
                </div>
              </div>
            </div>
        )}
        </div> :

      <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <PackageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            We couldn't find any orders matching the selected status. Try
            changing the filter or start shopping.
          </p>
          <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
          
            Start Shopping
          </Link>
        </div>
      }
    </CustomerLayout>);

}