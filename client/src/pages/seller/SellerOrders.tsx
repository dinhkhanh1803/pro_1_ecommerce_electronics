import React, { useState } from 'react';
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

// Replaced mock data with real data fetch

export function SellerOrders() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_API_URL}/api/orders/seller?page=${page}&limit=5&status=${activeTab}&search=${searchQuery}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotalOrders(data.totalOrders || 0);
    } catch (error) {
      console.error("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Luôn reset về trang 1 khi thay đổi bộ lọc hoặc từ khóa tìm kiếm
    setPage(1);
  }, [activeTab, searchQuery]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300); // Debounce search request
    return () => clearTimeout(timer);
  }, [page, activeTab, searchQuery]);

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
    id: 'shipped',
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

  // Local filtering is removed in favor of backend filtering

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setOrders(orders.map(order => order._id === orderId ? { ...order, orderStatus: newStatus } : order));
      }
    } catch (error) {
      console.error("Error updating status", error);
    }
    setOpenDropdownId(null);
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
        <div className="overflow-x-auto relative z-10 min-h-[300px]">
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading orders...</td>
                </tr>
              ) : orders.length > 0 ?
              orders.map((order) =>
              <tr
                key={order._id}
                className="hover:bg-gray-50 transition-colors">
                
                    <td className="p-4">
                      <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                    
                        {order._id.substring(0, 10)}...
                      </button>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer?.name || "Unknown Customer"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.paymentMethod}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.products?.reduce((sum: number, p: any) => sum + p.quantity, 0) || 0} items
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount || 0)}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={order.orderStatus as any} />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Status Update Dropdown */}
                        {!(order.orderStatus === 'delivered' || order.orderStatus === 'cancelled' || order.orderStatus === 'returned') && (
                          <div className="relative">
                            <button
                          onClick={() =>
                          setOpenDropdownId(
                            openDropdownId === order._id ? null : order._id
                          )
                          }
                          className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                          
                              <span>Update</span>
                              <ChevronDownIcon className="h-4 w-4" />
                            </button>

                            {openDropdownId === order._id &&
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-10">
                                {[
                          'pending',
                          'processing',
                          'shipped',
                          'cancelled'].
                          map((status) =>
                          <button
                            key={status}
                            onClick={() =>
                            handleStatusChange(order._id, status)
                            }
                            className={`block w-full text-left px-4 py-2 text-sm capitalize hover:bg-gray-50 ${order.orderStatus === status ? 'text-indigo-600 font-medium bg-indigo-50/50' : 'text-gray-700'}`}>
                            
                                    {status}
                                  </button>
                          )}
                              </div>
                        }
                          </div>
                        )}

                        <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="View Details">
                      
                          <EyeIcon className="h-5 w-5" />
                        </button>
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
        {!loading && orders.length > 0 &&
        <div className="relative z-0 px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{(page - 1) * 5 + 1}</span> to{' '}
              <span className="font-medium text-gray-900">
                {Math.min(page * 5, totalOrders)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-900">
                {totalOrders}
              </span>{' '}
              results
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm">
                Previous
              </button>
              
              <div className="flex items-center px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 shadow-inner">
                {page} / {totalPages}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm">
                Next
              </button>
            </div>
          </div>
        }
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl">
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Order Info</h3>
                  <div className="space-y-1">
                    <p className="text-sm"><span className="text-gray-500">ID:</span> <span className="font-medium">{selectedOrder._id}</span></p>
                    <p className="text-sm"><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString()}</span></p>
                    <p className="text-sm"><span className="text-gray-500">Status:</span> <span className="font-medium capitalize text-indigo-600">{selectedOrder.orderStatus}</span></p>
                    <p className="text-sm"><span className="text-gray-500">Payment:</span> <span className="font-medium">{selectedOrder.paymentMethod}</span></p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Customer Info</h3>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{selectedOrder.customer?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customer?.email}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customer?.phone}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2" title={selectedOrder.shippingAddress}>
                      <span className="text-gray-500">Address:</span> {selectedOrder.shippingAddress}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium text-center">Qty</th>
                        <th className="px-4 py-3 font-medium text-right">Price</th>
                        <th className="px-4 py-3 font-medium text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.products?.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 flex items-center space-x-3">
                            <img src={item.product?.images?.[0] || 'https://via.placeholder.com/40'} alt="product" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                            <span className="font-medium text-gray-900 line-clamp-1">{item.product?.name || 'Product'}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-gray-600">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex justify-between items-center rounded-b-2xl">
              <span className="font-medium text-gray-500 uppercase tracking-wider text-sm">Total Amount</span>
              <span className="text-2xl font-bold text-indigo-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedOrder.totalAmount || 0)}
              </span>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>);

}