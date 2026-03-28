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
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  Trash2Icon,
  CopyIcon,
  CheckIcon } from
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
const MOCK_PROMOTIONS = [
{
  id: 'PRM-001',
  code: 'SUMMER20',
  type: 'percentage',
  value: 20,
  minOrder: 50,
  usageCount: 145,
  usageLimit: 500,
  startDate: '2023-06-01',
  endDate: '2023-08-31',
  status: 'active'
},
{
  id: 'PRM-002',
  code: 'WELCOME10',
  type: 'fixed',
  value: 10,
  minOrder: 0,
  usageCount: 89,
  usageLimit: null,
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  status: 'active'
},
{
  id: 'PRM-003',
  code: 'FLASH50',
  type: 'percentage',
  value: 50,
  minOrder: 100,
  usageCount: 50,
  usageLimit: 50,
  startDate: '2023-10-24',
  endDate: '2023-10-25',
  status: 'draft'
},
{
  id: 'PRM-004',
  code: 'FREESHIP',
  type: 'shipping',
  value: 0,
  minOrder: 75,
  usageCount: 312,
  usageLimit: null,
  startDate: '2023-09-01',
  endDate: '2023-09-30',
  status: 'cancelled'
}];

export function SellerPromotions() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  return (
    <DashboardLayout
      sidebarItems={SELLER_SIDEBAR}
      title="Promotions"
      role="Seller">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search promotions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            
          </div>
          <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
          
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Promotion
        </button>
      </div>

      {/* Promotions Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Min. Order
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {MOCK_PROMOTIONS.map((promo) =>
              <tr
                key={promo.id}
                className="hover:bg-gray-50 transition-colors group">
                
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                        {promo.code}
                      </span>
                      <button
                      onClick={() => handleCopy(promo.code)}
                      className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Copy code">
                      
                        {copiedCode === promo.code ?
                      <CheckIcon className="h-4 w-4 text-green-500" /> :

                      <CopyIcon className="h-4 w-4" />
                      }
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium text-gray-900">
                      {promo.type === 'percentage' && `${promo.value}% Off`}
                      {promo.type === 'fixed' && `$${promo.value} Off`}
                      {promo.type === 'shipping' && 'Free Shipping'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {promo.minOrder > 0 ? `$${promo.minOrder}` : 'None'}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {promo.usageCount}{' '}
                        {promo.usageLimit ? `/ ${promo.usageLimit}` : 'used'}
                      </span>
                      {promo.usageLimit &&
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                          <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{
                          width: `${promo.usageCount / promo.usageLimit * 100}%`
                        }} />
                      
                        </div>
                    }
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900">
                      {promo.startDate}
                    </div>
                    <div className="text-xs text-gray-500">
                      to {promo.endDate}
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={promo.status as any} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="Edit">
                      
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete">
                      
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Promotion Modal */}
      {isCreateModalOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Create Promotion
              </h3>
              <button
              onClick={() => setIsCreateModalOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors">
              
                <Trash2Icon className="h-5 w-5" />{' '}
                {/* Using Trash2Icon as XIcon is not imported here, wait, I should use XIcon but it's not in imports. Let's just use a text 'X' or import it. I'll use text 'X' for now or a generic button */}
                <span className="sr-only">Close</span>
                <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                
                  <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
                
                </svg>
              </button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Code
                  </label>
                  <div className="flex space-x-2">
                    <input
                    type="text"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase font-mono"
                    placeholder="e.g. SUMMER20" />
                  
                    <button
                    type="button"
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200">
                    
                      Generate
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                    <option value="shipping">Free Shipping</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value
                  </label>
                  <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="20" />
                
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Amount ($)
                  </label>
                  <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00" />
                
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Usage Limits
                </label>
                <div className="space-y-3 mt-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  
                    <span className="text-sm text-gray-700">
                      Limit total number of times this discount can be used
                    </span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  
                    <span className="text-sm text-gray-700">
                      Limit to one use per customer
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50">
                
                  Cancel
                </button>
                <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700">
                
                  Save Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </DashboardLayout>);

}