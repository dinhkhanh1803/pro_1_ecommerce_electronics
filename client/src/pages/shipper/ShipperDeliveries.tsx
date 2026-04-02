import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  TruckIcon,
  DollarSignIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon } from
'lucide-react';
const SHIPPER_SIDEBAR = [
{
  icon: TruckIcon,
  label: 'Deliveries',
  path: '/shipper/deliveries'
},
{
  icon: DollarSignIcon,
  label: 'COD Collection',
  path: '/shipper/cod'
},
{
  icon: UserIcon,
  label: 'Profile',
  path: '/shipper/profile'
}];

// Mock Data Removed

export function ShipperDeliveries() {
  const [activeTab, setActiveTab] = useState('shipped');
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const token = localStorage.getItem('token');

  const fetchShipperOrders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/orders/shipper", {
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
    label: 'In Progress'
  },
  {
    id: 'delivered',
    label: 'Completed'
  },
  {
    id: 'returned',
    label: 'Failed'
  }];

  const filteredDeliveries = deliveries.filter((d) => d.orderStatus === activeTab);
  
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
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
      title="My Deliveries"
      role="Shipper">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-indigo-600">
            {deliveries.filter((d) => d.orderStatus === 'shipped').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Completed
          </p>
          <p className="text-2xl font-bold text-green-600">
            {deliveries.filter((d) => d.orderStatus === 'delivered').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Failed
          </p>
          <p className="text-2xl font-bold text-red-600">
            {deliveries.filter((d) => d.orderStatus === 'returned').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">COD Pending</p>
          <p className="text-2xl font-bold text-gray-900">
            $
            {deliveries.
            filter((d) => d.orderStatus === 'delivered' && d.paymentMethod === 'COD' && !d.codRemitted).
            reduce((sum, d) => sum + d.totalAmount, 0).
            toFixed(2)}
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
                        COD: ${delivery.totalAmount?.toFixed(2)}
                      </span>
                }
                  </div>
                  <p className="text-sm text-gray-500">
                    Order ID: {delivery._id}
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
                      {delivery.customer?.phone || 'No phone'}
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

                {(activeTab === 'delivered' || activeTab === 'returned') &&
            <Link
              to={`/orders/${delivery._id}`}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center text-center">
              
                    View Details
                  </Link>
            }
              </div>
            </div>
        ) :

        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
              <TruckIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No deliveries found
            </h3>
            <p className="text-gray-500">
              You don't have any deliveries in this status.
            </p>
          </div>
        }
      </div>
    </DashboardLayout>);

}