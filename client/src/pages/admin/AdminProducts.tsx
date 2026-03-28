import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  UsersIcon,
  PackageIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  LayoutTemplateIcon,
  ActivityIcon,
  SearchIcon,
  FilterIcon,
  CheckIcon,
  XIcon,
  EyeIcon } from
'lucide-react';
const ADMIN_SIDEBAR = [
{
  icon: ActivityIcon,
  label: 'Dashboard',
  path: '/admin/dashboard'
},
{
  icon: UsersIcon,
  label: 'Users',
  path: '/admin/users'
},
{
  icon: PackageIcon,
  label: 'Products',
  path: '/admin/products'
},
{
  icon: ShoppingBagIcon,
  label: 'Orders',
  path: '/admin/orders'
},
{
  icon: DollarSignIcon,
  label: 'Finance',
  path: '/admin/finance'
},
{
  icon: LayoutTemplateIcon,
  label: 'CMS',
  path: '/admin/cms'
}];

// Mock Data
const MOCK_PRODUCTS = [
{
  id: 'PRD-1042',
  name: 'Wireless Noise-Cancelling Headphones Pro',
  seller: 'TechGadgets Official',
  category: 'Electronics',
  price: 299.99,
  status: 'pending',
  image:
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
  submittedAt: 'Oct 24, 2023'
},
{
  id: 'PRD-1041',
  name: 'Smart Watch Series 7',
  seller: 'TechGadgets Official',
  category: 'Wearables',
  price: 399.0,
  status: 'active',
  image:
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&q=80',
  submittedAt: 'Oct 23, 2023'
},
{
  id: 'PRD-1040',
  name: 'Premium Leather Backpack',
  seller: 'Fashion Boutique',
  category: 'Accessories',
  price: 129.5,
  status: 'pending',
  image:
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&q=80',
  submittedAt: 'Oct 22, 2023'
},
{
  id: 'PRD-1039',
  name: 'Minimalist Desk Lamp',
  seller: 'Home Essentials',
  category: 'Home',
  price: 89.99,
  status: 'rejected',
  image:
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150&q=80',
  submittedAt: 'Oct 20, 2023'
}];

export function AdminProducts() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const tabs = [
  {
    id: 'pending',
    label: 'Pending Approval'
  },
  {
    id: 'active',
    label: 'Active Products'
  },
  {
    id: 'rejected',
    label: 'Rejected'
  }];

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesTab = product.status === activeTab;
    const matchesSearch =
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.seller.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  const handleAction = (id: string, action: 'approve' | 'reject') => {
    console.log(`${action} product ${id}`);
    // In a real app, this would trigger an API call to update the product status
  };
  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Product Moderation"
      role="Admin">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products or sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            
          </div>
          <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>
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

      {/* Products Table */}
      <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Seller
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length > 0 ?
              filteredProducts.map((product) =>
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors group">
                
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                    
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {product.seller}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {product.category}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {product.submittedAt}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {activeTab === 'pending' &&
                    <>
                            <button
                        onClick={() =>
                        handleAction(product.id, 'approve')
                        }
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200 bg-green-50/50"
                        title="Approve">
                        
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                        onClick={() => handleAction(product.id, 'reject')}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 bg-red-50/50"
                        title="Reject">
                        
                              <XIcon className="h-4 w-4" />
                            </button>
                          </>
                    }
                        <button
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100"
                      title="View Details">
                      
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
              ) :

              <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No products found matching the selected criteria.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 &&
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">1</span> to{' '}
              <span className="font-medium text-gray-900">
                {filteredProducts.length}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-900">
                {filteredProducts.length}
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