import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  MoreVerticalIcon } from
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
const MOCK_PRODUCTS = [
{
  id: 'PRD-001',
  name: 'Wireless Noise-Cancelling Headphones Pro',
  category: 'Electronics',
  price: 299.99,
  stock: 45,
  status: 'active',
  image:
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80',
  sales: 124
},
{
  id: 'PRD-002',
  name: 'Smart Watch Series 7',
  category: 'Wearables',
  price: 399.0,
  stock: 12,
  status: 'active',
  image:
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=150&q=80',
  sales: 89
},
{
  id: 'PRD-003',
  name: 'Premium Leather Backpack',
  category: 'Accessories',
  price: 129.5,
  stock: 0,
  status: 'draft',
  image:
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=150&q=80',
  sales: 0
},
{
  id: 'PRD-004',
  name: 'Minimalist Desk Lamp',
  category: 'Home',
  price: 89.99,
  stock: 5,
  status: 'active',
  image:
  'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=150&q=80',
  sales: 42
}];

export function SellerProducts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const toggleSelectAll = () => {
    if (selectedProducts.length === MOCK_PRODUCTS.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(MOCK_PRODUCTS.map((p) => p.id));
    }
  };
  const toggleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((pId) => pId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };
  return (
    <DashboardLayout
      sidebarItems={SELLER_SIDEBAR}
      title="Products"
      role="Seller">
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            
          </div>
          <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>

        <Link
          to="/seller/products/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
          
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Product
        </Link>
      </div>

      {/* Bulk Actions (Visible when items selected) */}
      {selectedProducts.length > 0 &&
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-indigo-800">
            {selectedProducts.length} product(s) selected
          </span>
          <div className="flex space-x-2">
            <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Change Status
            </button>
            <button className="px-3 py-1.5 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
              Delete
            </button>
          </div>
        </div>
      }

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 w-12">
                  <input
                    type="checkbox"
                    checked={
                    selectedProducts.length === MOCK_PRODUCTS.length &&
                    MOCK_PRODUCTS.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" />
                  
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {MOCK_PRODUCTS.map((product) =>
              <tr
                key={product.id}
                className="hover:bg-gray-50 transition-colors group">
                
                  <td className="p-4">
                    <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => toggleSelectProduct(product.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" />
                  
                  </td>
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
                  <td className="p-4 text-sm text-gray-600">
                    {product.category}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <span
                    className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                    
                      {product.stock}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{product.sales}</td>
                  <td className="p-4">
                    <StatusBadge status={product.status as any} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                      to={`/seller/products/${product.id}/edit`}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="Edit">
                      
                        <EditIcon className="h-4 w-4" />
                      </Link>
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

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">1</span> to{' '}
            <span className="font-medium text-gray-900">4</span> of{' '}
            <span className="font-medium text-gray-900">4</span> results
          </p>
          <div className="flex space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50">
              Previous
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>);

}