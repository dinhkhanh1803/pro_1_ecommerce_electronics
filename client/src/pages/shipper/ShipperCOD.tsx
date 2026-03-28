import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  TruckIcon,
  DollarSignIcon,
  UserIcon,
  SearchIcon,
  FilterIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  DownloadIcon } from
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
const MOCK_COD_ORDERS = [
{
  id: 'COD-1042',
  orderId: 'ORD-2023-1042',
  customerName: 'John Doe',
  amount: 129.99,
  dateCollected: 'Oct 24, 2023, 11:30 AM',
  status: 'pending_remittance' // pending_remittance, remitted
},
{
  id: 'COD-1041',
  orderId: 'ORD-2023-1041',
  customerName: 'Jane Smith',
  amount: 89.5,
  dateCollected: 'Oct 23, 2023, 2:15 PM',
  status: 'remitted'
},
{
  id: 'COD-1040',
  orderId: 'ORD-2023-1040',
  customerName: 'Alice Johnson',
  amount: 245.0,
  dateCollected: 'Oct 22, 2023, 9:00 AM',
  status: 'remitted'
},
{
  id: 'COD-1039',
  orderId: 'ORD-2023-1039',
  customerName: 'Bob Brown',
  amount: 45.0,
  dateCollected: 'Oct 20, 2023, 4:45 PM',
  status: 'remitted'
}];

export function ShipperCOD() {
  const [activeTab, setActiveTab] = useState('pending_remittance');
  const [searchQuery, setSearchQuery] = useState('');
  const [codOrders, setCodOrders] = useState(MOCK_COD_ORDERS);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const tabs = [
  {
    id: 'pending_remittance',
    label: 'To Remit'
  },
  {
    id: 'remitted',
    label: 'Remitted History'
  }];

  const filteredOrders = codOrders.filter((order) => {
    const matchesTab = order.status === activeTab;
    const matchesSearch =
    order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  const totalPending = codOrders.
  filter((o) => o.status === 'pending_remittance').
  reduce((sum, o) => sum + o.amount, 0);
  const totalRemitted = codOrders.
  filter((o) => o.status === 'remitted').
  reduce((sum, o) => sum + o.amount, 0);
  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((o) => o.id));
    }
  };
  const toggleSelectOrder = (id: string) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter((orderId) => orderId !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };
  const handleRemit = () => {
    setCodOrders(
      codOrders.map((o) =>
      selectedOrderIds.includes(o.id) ?
      {
        ...o,
        status: 'remitted'
      } :
      o
      )
    );
    setSelectedOrderIds([]);
    setIsConfirmModalOpen(false);
  };
  return (
    <DashboardLayout
      sidebarItems={SHIPPER_SIDEBAR}
      title="COD Collection"
      role="Shipper">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-yellow-800 mb-1">
              Pending Remittance
            </p>
            <p className="text-3xl font-bold text-yellow-900">
              ${totalPending.toFixed(2)}
            </p>
            <p className="text-xs text-yellow-700 mt-2">
              Cash collected, needs to be transferred to platform.
            </p>
          </div>
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <AlertCircleIcon className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800 mb-1">
              Total Remitted
            </p>
            <p className="text-3xl font-bold text-green-900">
              ${totalRemitted.toFixed(2)}
            </p>
            <p className="text-xs text-green-700 mt-2">
              Successfully transferred to platform.
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
              placeholder="Search COD orders..."
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
            Remit Selected ({selectedOrderIds.length})
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
                  Order ID
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Amount Collected
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Date Collected
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ?
              filteredOrders.map((order) =>
              <tr
                key={order.id}
                className="hover:bg-gray-50 transition-colors">
                
                    {activeTab === 'pending_remittance' &&
                <td className="p-4">
                        <input
                    type="checkbox"
                    checked={selectedOrderIds.includes(order.id)}
                    onChange={() => toggleSelectOrder(order.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" />
                  
                      </td>
                }
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderId}
                      </div>
                      <div className="text-xs text-gray-500">{order.id}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      ${order.amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {order.dateCollected}
                    </td>
                    <td className="p-4">
                      <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${order.status === 'remitted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
              ) :

              <tr>
                  <td
                  colSpan={activeTab === 'pending_remittance' ? 6 : 5}
                  className="p-8 text-center text-gray-500">
                  
                    No COD records found matching the selected criteria.
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
                Confirm Remittance
              </h3>
              <button
              onClick={() => setIsConfirmModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
              
                <AlertCircleIcon className="h-5 w-5" />{' '}
                {/* Placeholder for XIcon */}
              </button>
            </div>

            <div className="space-y-6">
              <p className="text-gray-600 text-sm">
                You are about to mark {selectedOrderIds.length} COD order(s) as
                remitted. This action confirms that you have transferred the
                collected cash to the platform.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Total Amount to Remit:
                </span>
                <span className="text-xl font-bold text-indigo-600">
                  $
                  {codOrders.
                filter((o) => selectedOrderIds.includes(o.id)).
                reduce((sum, o) => sum + o.amount, 0).
                toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Reference Number (Optional)
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
                
                  Cancel
                </button>
                <button
                onClick={handleRemit}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
                
                  Confirm Remittance
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </DashboardLayout>);

}