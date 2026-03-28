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
  XCircleIcon,
  NavigationIcon } from
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

// Mock Data
const MOCK_DELIVERIES = [
{
  id: 'DEL-1042',
  orderId: 'ORD-2023-1042',
  customerName: 'John Doe',
  phone: '+1 (555) 123-4567',
  address: '123 Main St, Apt 4B, San Francisco, CA 94105',
  status: 'assigned',
  codAmount: 0,
  distance: '2.4 km',
  estimatedTime: '15 mins'
},
{
  id: 'DEL-1041',
  orderId: 'ORD-2023-1041',
  customerName: 'Jane Smith',
  phone: '+1 (555) 987-6543',
  address: '456 Market St, Suite 200, San Francisco, CA 94104',
  status: 'delivering',
  codAmount: 89.5,
  distance: '1.2 km',
  estimatedTime: '8 mins'
},
{
  id: 'DEL-1040',
  orderId: 'ORD-2023-1040',
  customerName: 'Alice Johnson',
  phone: '+1 (555) 456-7890',
  address: '789 Mission St, San Francisco, CA 94103',
  status: 'completed',
  codAmount: 245.0,
  distance: '3.1 km',
  estimatedTime: 'Delivered at 10:30 AM'
},
{
  id: 'DEL-1039',
  orderId: 'ORD-2023-1039',
  customerName: 'Bob Brown',
  phone: '+1 (555) 234-5678',
  address: '321 Howard St, San Francisco, CA 94105',
  status: 'failed',
  codAmount: 45.0,
  distance: '1.8 km',
  estimatedTime: 'Failed at 9:15 AM',
  notes: 'Customer not available at address.'
}];

export function ShipperDeliveries() {
  const [activeTab, setActiveTab] = useState('assigned');
  const [deliveries, setDeliveries] = useState(MOCK_DELIVERIES);
  const tabs = [
  {
    id: 'assigned',
    label: 'New Tasks'
  },
  {
    id: 'delivering',
    label: 'In Progress'
  },
  {
    id: 'completed',
    label: 'Completed'
  },
  {
    id: 'failed',
    label: 'Failed'
  }];

  const filteredDeliveries = deliveries.filter((d) => d.status === activeTab);
  const handleAccept = (id: string) => {
    setDeliveries(
      deliveries.map((d) =>
      d.id === id ?
      {
        ...d,
        status: 'delivering'
      } :
      d
      )
    );
  };
  const handleReject = (id: string) => {
    setDeliveries(deliveries.filter((d) => d.id !== id));
  };
  return (
    <DashboardLayout
      sidebarItems={SHIPPER_SIDEBAR}
      title="My Deliveries"
      role="Shipper">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">New Tasks</p>
          <p className="text-2xl font-bold text-gray-900">
            {deliveries.filter((d) => d.status === 'assigned').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-indigo-600">
            {deliveries.filter((d) => d.status === 'delivering').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">
            Completed Today
          </p>
          <p className="text-2xl font-bold text-green-600">
            {deliveries.filter((d) => d.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">COD to Remit</p>
          <p className="text-2xl font-bold text-gray-900">
            $
            {deliveries.
            filter((d) => d.status === 'completed' && d.codAmount > 0).
            reduce((sum, d) => sum + d.codAmount, 0).
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
          key={delivery.id}
          className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
          
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">
                      {delivery.orderId}
                    </h3>
                    {delivery.codAmount > 0 &&
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        COD: ${delivery.codAmount.toFixed(2)}
                      </span>
                }
                  </div>
                  <p className="text-sm text-gray-500">
                    Task ID: {delivery.id}
                  </p>
                </div>
                <StatusBadge
              status={
              delivery.status === 'assigned' ?
              'pending' :
              delivery.status === 'delivering' ?
              'processing' :
              delivery.status as any
              } />
            
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {delivery.customerName}
                    </p>
                    <a
                  href={`tel:${delivery.phone}`}
                  className="text-sm text-indigo-600 hover:underline flex items-center mt-0.5">
                  
                      <PhoneIcon className="h-3 w-3 mr-1" />
                      {delivery.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-700">{delivery.address}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {delivery.distance}
                      </span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {delivery.estimatedTime}
                      </span>
                    </div>
                  </div>
                </div>
                {delivery.notes &&
            <div className="bg-red-50 border border-red-100 rounded-lg p-3 mt-2">
                    <p className="text-sm text-red-800">
                      <span className="font-semibold">Note:</span>{' '}
                      {delivery.notes}
                    </p>
                  </div>
            }
              </div>

              {/* Actions based on status */}
              <div className="flex items-center space-x-3 pt-4 border-t border-gray-100">
                {activeTab === 'assigned' &&
            <>
                    <button
                onClick={() => handleReject(delivery.id)}
                className="flex-1 px-4 py-2 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center">
                
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject
                    </button>
                    <button
                onClick={() => handleAccept(delivery.id)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center">
                
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Accept Task
                    </button>
                  </>
            }

                {activeTab === 'delivering' &&
            <>
                    <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                      <NavigationIcon className="h-5 w-5 mr-2" />
                      Navigate
                    </button>
                    <Link
                to={`/shipper/deliveries/${delivery.id}`}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center text-center">
                
                      Update Status
                    </Link>
                  </>
            }

                {(activeTab === 'completed' || activeTab === 'failed') &&
            <Link
              to={`/shipper/deliveries/${delivery.id}`}
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