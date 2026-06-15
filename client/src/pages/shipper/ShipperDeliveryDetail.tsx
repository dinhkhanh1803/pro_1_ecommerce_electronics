import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  DollarSignIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  ChevronLeftIcon,
  MessageSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  CameraIcon,
  AlertCircleIcon } from
'lucide-react';
import { SHIPPER_SIDEBAR } from '../../constants/sidebar';

// Mock Data
const MOCK_DELIVERY = {
  id: 'DEL-1041',
  orderId: 'ORD-2023-1041',
  customerName: 'Jane Smith',
  phone: '+1 (555) 987-6543',
  address: '456 Market St, Suite 200, San Francisco, CA 94104',
  status: 'delivering',
  codAmount: 89.5,
  distance: '1.2 km',
  estimatedTime: '8 mins',
  items: [
  {
    name: 'Smart Watch Series 7',
    qty: 1,
    price: 89.5
  }],

  notes: 'Please call when you arrive at the lobby.'
};
export function ShipperDeliveryDetail() {
  const [deliveryStatus, setDeliveryStatus] = useState(MOCK_DELIVERY.status);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateType, setUpdateType] = useState<'delivered' | 'failed' | null>(
    null
  );
  const [failureReason, setFailureReason] = useState('');
  const handleStatusUpdate = () => {
    if (updateType) {
      setDeliveryStatus(updateType);
      setIsUpdateModalOpen(false);
      // In a real app, this would trigger an API call
    }
  };
  return (
    <DashboardLayout
      sidebarItems={SHIPPER_SIDEBAR}
      title="Delivery Details"
      role="Shipper">
      
      <div className="mb-6">
        <Link
          to="/shipper/deliveries"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back to Deliveries
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {MOCK_DELIVERY.orderId}
              </h2>
              <p className="text-sm text-gray-500">
                Task ID: {MOCK_DELIVERY.id}
              </p>
            </div>
            <StatusBadge
              status={
              deliveryStatus === 'assigned' ?
              'pending' :
              deliveryStatus === 'delivering' ?
              'processing' :
              deliveryStatus as any
              } />
            
          </div>

          {/* Customer Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {MOCK_DELIVERY.customerName}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                <div>
                  <a
                    href={`tel:${MOCK_DELIVERY.phone}`}
                    className="text-sm font-medium text-indigo-600 hover:underline">
                    
                    {MOCK_DELIVERY.phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-700">
                    {MOCK_DELIVERY.address}
                  </p>
                  <div className="mt-2 h-32 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <span className="text-gray-400 text-sm">
                      Map Placeholder
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex space-x-3">
              <a
                href={`tel:${MOCK_DELIVERY.phone}`}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
                
                <PhoneIcon className="h-4 w-4 mr-2" />
                Call
              </a>
              <button className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
                <MessageSquareIcon className="h-4 w-4 mr-2" />
                Message
              </button>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h3>
            <ul className="divide-y divide-gray-200">
              {MOCK_DELIVERY.items.map((item, index) =>
              <li
                key={index}
                className="py-3 flex justify-between items-center">
                
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* COD Card */}
          {MOCK_DELIVERY.codAmount > 0 &&
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                  <DollarSignIcon className="h-5 w-5 mr-1" />
                  Collect COD
                </h3>
              </div>
              <p className="text-3xl font-bold text-yellow-900">
                ${MOCK_DELIVERY.codAmount.toFixed(2)}
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Please collect exact amount upon delivery.
              </p>
            </div>
          }

          {/* Notes Card */}
          {MOCK_DELIVERY.notes &&
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <AlertCircleIcon className="h-4 w-4 mr-1" />
                Delivery Notes
              </h3>
              <p className="text-sm text-blue-900">{MOCK_DELIVERY.notes}</p>
            </div>
          }

          {/* Action Buttons */}
          {deliveryStatus === 'delivering' &&
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Update Status
              </h3>
              <button
              onClick={() => {
                setUpdateType('delivered');
                setIsUpdateModalOpen(true);
              }}
              className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors">
              
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Mark as Delivered
              </button>
              <button
              onClick={() => {
                setUpdateType('failed');
                setIsUpdateModalOpen(true);
              }}
              className="w-full flex items-center justify-center px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-medium hover:bg-red-100 transition-colors">
              
                <XCircleIcon className="h-5 w-5 mr-2" />
                Mark as Failed
              </button>
            </div>
          }
        </div>
      </div>

      {/* Update Modal */}
      {isUpdateModalOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3
              className={`text-xl font-bold ${updateType === 'delivered' ? 'text-green-600' : 'text-red-600'}`}>
              
                {updateType === 'delivered' ?
              'Confirm Delivery' :
              'Report Failure'}
              </h3>
              <button
              onClick={() => setIsUpdateModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
              
                <XCircleIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {updateType === 'delivered' && MOCK_DELIVERY.codAmount > 0 &&
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-yellow-800">
                    COD Collected:
                  </span>
                  <span className="text-lg font-bold text-yellow-900">
                    ${MOCK_DELIVERY.codAmount.toFixed(2)}
                  </span>
                </div>
            }

              {updateType === 'delivered' &&
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proof of Delivery (Optional)
                  </label>
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer bg-gray-50">
                    <CameraIcon className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Take Photo</span>
                  </div>
                </div>
            }

              {updateType === 'failed' &&
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Failure
                  </label>
                  <select
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white mb-3">
                
                    <option value="">Select a reason</option>
                    <option value="not_home">Customer not home</option>
                    <option value="wrong_address">Address not found</option>
                    <option value="refused">Customer refused delivery</option>
                    <option value="other">Other</option>
                  </select>
                  <textarea
                placeholder="Additional notes..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" />
              
                </div>
            }

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                
                  Cancel
                </button>
                <button
                onClick={handleStatusUpdate}
                disabled={updateType === 'failed' && !failureReason}
                className={`px-6 py-2 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${updateType === 'delivered' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </DashboardLayout>);

}