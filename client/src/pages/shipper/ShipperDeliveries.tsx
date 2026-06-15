import React, { useState } from 'react';

import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  TruckIcon,
  DollarSignIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  PackageIcon
} from 'lucide-react';


import { formatVND } from '../../utils/format';

import { SHIPPER_SIDEBAR } from '../../constants/sidebar';

// Mock Data Removed

export function ShipperDeliveries() {
  const [activeTab, setActiveTab] = useState('shipped');
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedDelivery, setSelectedDelivery] = useState<any>(null);
  const token = localStorage.getItem('token');

  const fetchShipperOrders = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/shipper`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data);
      }
    } catch (err) { console.error(err); }
  };

  React.useEffect(() => {
    fetchShipperOrders();
  }, [token]);

  const tabs = [
  {
    id: 'shipped',
    label: 'Đang giao'
  },
  {
    id: 'delivered',
    label: 'Giao thành công'
  },
  {
    id: 'returned',
    label: 'Giao thất bại'
  }];

  const filteredDeliveries = deliveries.filter((d) => d.orderStatus === activeTab);
  
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
           "Content-Type": "application/json",
           Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchShipperOrders();
      else {
        const err = await res.json();
        alert(err.message);
      }
    } catch(err) { console.error(err); }
  };
  return (
    <DashboardLayout
      sidebarItems={SHIPPER_SIDEBAR}
      title="Đơn giao hàng của tôi"
      role="Shipper">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Đang giao</p>
          <p className="text-2xl font-bold text-indigo-600">
            {deliveries.filter((d) => d.orderStatus === 'shipped').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Giao thành công
          </p>

          <p className="text-2xl font-bold text-green-600">
            {deliveries.filter((d) => d.orderStatus === 'delivered').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Giao thất bại
          </p>
          <p className="text-2xl font-bold text-red-600">
            {deliveries.filter((d) => d.orderStatus === 'returned').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Tiền COD chưa nộp</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatVND(deliveries.
            filter((d) => d.orderStatus === 'delivered' && d.paymentMethod === 'COD' && !d.codRemitted).
            reduce((sum, d) => sum + d.totalAmount, 0))}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-4 px-6 font-medium text-sm transition-colors relative flex-1 text-center ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            
              {tab.label}
              {activeTab === tab.id &&
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
            }
            </button>
          )}
        </div>
      </div>

      {/* Delivery List */}
      <div className="space-y-4">
        {filteredDeliveries.length > 0 ?
        filteredDeliveries.map((delivery) =>
        <div
          key={delivery._id}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {delivery._id.slice(-8).toUpperCase()}
                    </h3>
                    {delivery.paymentMethod === 'COD' &&
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        COD: {formatVND(delivery.totalAmount || 0)}
                      </span>
                }
                  </div>
                  <p className="text-sm text-gray-500">
                    Mã đơn: {delivery._id}
                  </p>
                </div>
                <StatusBadge status={delivery.orderStatus as any} />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {delivery.customer?.name}
                    </p>
                    <a
                  href={`tel:${delivery.customer?.phone}`}
                  className="text-sm text-indigo-600 hover:underline flex items-center mt-0.5">
                  
                      <PhoneIcon className="h-3 w-3 mr-1" />
                      {delivery.customer?.phone || 'Không có sđt'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">{delivery.shippingAddress}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {new Date(delivery.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions based on status */}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-100">

                {activeTab === 'shipped' &&
            <>
                    <button 
                       onClick={() => updateStatus(delivery._id, 'returned')}
                       className="w-full sm:flex-1 px-4 py-2 border border-ref-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition-colors flex items-center justify-center">
                       <XCircleIcon className="h-5 w-5 mr-2" />
                       Giao thất bại
                    </button>
                    <button
                       onClick={() => updateStatus(delivery._id, 'delivered')}
                       className="w-full sm:flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center">
                       <CheckCircleIcon className="h-5 w-5 mr-2" />
                       Giao thành công
                    </button>
                  </>
            }

                {(activeTab === 'delivered' || activeTab === 'returned' || activeTab === 'shipped') &&
            <button
              onClick={() => setSelectedDelivery(delivery)}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center text-center">
              
                    Chi tiết đơn
                  </button>
            }
              </div>
            </div>
        ) :

        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <TruckIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Không có đơn hàng nào
            </h3>
            <p className="text-gray-500">
              Bạn không có đơn giao hàng nào ở trạng thái này.
            </p>
          </div>
        }
      </div>

      {/* Modal View Details */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Chi tiết đơn hàng</h3>
                <p className="text-sm text-gray-500">Mã đơn: {selectedDelivery._id}</p>
              </div>
              <button
                onClick={() => setSelectedDelivery(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Thông tin khách hàng</h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900">{selectedDelivery.customer?.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-700">{selectedDelivery.customer?.phone || 'Chưa cập nhật'}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                    <span className="text-gray-700">{selectedDelivery.shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Sản phẩm</h4>
                <div className="space-y-3">
                  {selectedDelivery.products?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3 bg-white border border-gray-100 rounded-xl p-3">
                      <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <PackageIcon className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name || 'Sản phẩm không rõ'}</p>
                        <p className="text-xs text-gray-500">
                          {formatVND(item.price)} x {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-gray-900 pl-2">
                        {formatVND(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Thanh toán</h4>
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 inline-flex items-center">
                      <DollarSignIcon className="h-4 w-4 mr-1 text-indigo-400" /> Hình thức
                    </span>
                    <span className="font-semibold text-gray-900">
                      {selectedDelivery.paymentMethod}
                    </span>
                  </div>
                  <div className="border-t border-indigo-100 pt-3 flex justify-between items-center">
                    <span className="font-medium text-gray-900">Tổng thu</span>
                    <span className="text-xl font-bold text-indigo-700">{formatVND(selectedDelivery.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>);

}