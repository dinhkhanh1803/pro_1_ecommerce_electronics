import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  DollarSignIcon,
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';

import { formatVND } from '../../utils/format';

import { SHIPPER_SIDEBAR } from '../../constants/sidebar';

// Mock Data Removed

export function ShipperCOD() {
  const [activeTab, setActiveTab] = useState('pending_remittance');
  const [searchQuery, setSearchQuery] = useState('');
  const [codOrders, setCodOrders] = useState<any[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const token = localStorage.getItem('token');

  const fetchShipperOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/shipper`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Only get delivered COD orders
        const codItems = data.filter((d: any) => d.orderStatus === 'delivered' && d.paymentMethod === 'COD');
        setCodOrders(codItems);
      }
    } catch (err) { console.error(err); }
  };

  React.useEffect(() => {
    fetchShipperOrders();
  }, [token]);
  const tabs = [
  {
    id: 'pending_remittance',
    label: 'Cần nộp tiền'
  },
  {
    id: 'remitted',
    label: 'Lịch sử đã nộp'
  }];

  const filteredOrders = codOrders.filter((order) => {
    const isRemitted = activeTab === 'remitted' ? order.codRemitted : !order.codRemitted;
    const matchesSearch =
    order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return isRemitted && matchesSearch;
  });
  const totalPending = codOrders.
  filter((o) => !o.codRemitted).
  reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRemitted = codOrders.
  filter((o) => o.codRemitted).
  reduce((sum, o) => sum + o.totalAmount, 0);
  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o._id));
    }
  };
  const toggleSelectOrder = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter((orderId) => orderId !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };
  const handleRemit = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/cod-remit`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
         },
         body: JSON.stringify({ orderIds: selectedOrderIds })
      });
      if (res.ok) {
         fetchShipperOrders();
         setSelectedOrderIds([]);
         setIsConfirmModalOpen(false);
         alert("Đã nhận tiền nộp thành công.");
      } else {
         const err = await res.json();
         alert(err.message);
      }
    } catch(err) { console.error(err); }
  };
  return (
      <DashboardLayout
      sidebarItems={SHIPPER_SIDEBAR}
      title="Quản lý tiền thu hộ (COD)"
      role="Shipper">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-800 mb-1">
              Tiền COD chưa nộp
            </p>
            <p className="text-3xl font-bold text-yellow-900">
              {formatVND(totalPending)}
            </p>
            <p className="text-xs text-yellow-700 mt-2">
              Tiền mặt đã thu, cần nộp lại cho hệ thống.
            </p>
          </div>
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircleIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800 mb-1">
              Tổng tiền đã nộp
            </p>
            <p className="text-3xl font-bold text-green-900">
              {formatVND(totalRemitted)}
            </p>
            <p className="text-xs text-green-700 mt-2">
              Đã nộp thành công cho hệ thống.
            </p>
          </div>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm mã đơn nhỏ hoặc Tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            
          </div>
          <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>

        {activeTab === 'pending_remittance' && selectedOrderIds.length > 0 &&
        <button
          onClick={() => setIsConfirmModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
          
            <DollarSignIcon className="h-4 w-4 mr-2" />
            Nộp tiền các đơn chọn ({selectedOrderIds.length})
          </button>
        }
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-t-xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedOrderIds([]);
            }}
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
                {activeTab === 'pending_remittance' &&
                <th className="p-4 w-12">
                    <input
                    type="checkbox"
                    checked={
                    selectedOrderIds.length === filteredOrders.length &&
                    filteredOrders.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" />
                  
                  </th>
                }
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Mã đơn hàng
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Số tiền thu
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ngày thu
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ?
              filteredOrders.map((order) =>
              <tr
                key={order._id}
                className="hover:bg-gray-50 transition-colors">
                
                    {activeTab === 'pending_remittance' &&
                <td className="p-4">
                        <input
                    type="checkbox"
                    checked={selectedOrderIds.includes(order._id)}
                    onChange={() => toggleSelectOrder(order._id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" />
                  
                      </td>
                }
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order._id.slice(-8).toUpperCase()}
                      </div>
                      <div className="text-xs text-gray-500">{order._id}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-900">
                      {order.customer?.name}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      {formatVND(order.totalAmount || 0)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(order.updatedAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${order.codRemitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    
                        {order.codRemitted ? 'Đã nộp' : 'Chưa nộp'}
                      </span>
                    </td>
                  </tr>
              ) :

              <tr>
                  <td
                  colSpan={activeTab === 'pending_remittance' ? 6 : 5}
                  className="p-8 text-center text-gray-500">
                  
                    Không tìm thấy đơn nộp tiền nào tương ứng.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Remittance Modal */}
      {isConfirmModalOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Xác nhận nộp tiền
              </h3>
              <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
              
                <AlertCircleIcon className="h-5 w-5" />{' '}
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-gray-600 text-sm">
                Bạn đang chuẩn bị đổi trạng thái của {selectedOrderIds.length} đơn hàng 
                thành "Đã nộp". Hành động này xác nhận bạn đã nộp lại tiền mặt cho hệ thống.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Tổng tiền cần nộp:
                </span>
                <span className="text-xl font-bold text-indigo-600">
                  {formatVND(codOrders.
                filter((o) => selectedOrderIds.includes(o._id)).
                reduce((sum, o) => sum + o.totalAmount, 0))}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giao dịch (Không bắt buộc)
                </label>
                <input
                type="text"
                placeholder="e.g. TRN-987654321"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                
                  Hủy
                </button>
                <button
                onClick={handleRemit}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </DashboardLayout>);

}