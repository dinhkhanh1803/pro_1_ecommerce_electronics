import React, { useState, useEffect } from 'react';
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
  EyeIcon,
  TrashIcon } from
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
  label: 'Categories',
  path: '/admin/categories'
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
// {
//   icon: DollarSignIcon,
//   label: 'Finance',
//   path: '/admin/finance'
// },
{
  icon: LayoutTemplateIcon,
  label: 'CMS',
  path: '/admin/cms'
}];

export function AdminProducts() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [productsList, setProductsList] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
      const data = await res.json();
      setProductsList(data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

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

  const filteredProducts = productsList.filter((product) => {
    const matchesTab = product.status === activeTab;
    const sellerName = product.seller?.name || '';
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const status = action === 'approve' ? 'active' : 'rejected';
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      fetchProducts();
    } catch (error) {
      console.error(`Error ${action} product`, error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống? Phép toán này không thể hoàn tác.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) fetchProducts();
      else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (error) {
      console.error("Error deleting product", error);
    }
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
              {paginatedProducts.length > 0 ?
              paginatedProducts.map((product) =>
              <tr
                key={product._id}
                className="hover:bg-gray-50 transition-colors group">
                
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                      src={product.images && product.images.length > 0 ? product.images[0] : "https://via.placeholder.com/150"}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200" />
                    
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">{product._id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      {product.seller?.name || "Unknown"}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {product.category?.name || "Unknown"}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">
                      ${product.price ? product.price.toFixed(2) : "0.00"}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {activeTab === 'pending' &&
                    <>
                            <button
                        onClick={() =>
                        handleAction(product._id, 'approve')
                        }
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200 bg-green-50/50"
                        title="Approve">
                        
                              <CheckIcon className="h-4 w-4" />
                            </button>
                            <button
                        onClick={() => handleAction(product._id, 'reject')}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 bg-red-50/50"
                        title="Reject">
                        
                              <XIcon className="h-4 w-4" />
                            </button>
                          </>
                    }
                        <button
                          onClick={() => setSelectedProduct(product)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Product"
                        >
                          <TrashIcon className="h-4 w-4" />
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
              Showing <span className="font-medium text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium text-gray-900">
                {Math.min(currentPage * pageSize, filteredProducts.length)}
              </span>{' '}
              of{' '}
              <span className="font-medium text-gray-900">
                {filteredProducts.length}
              </span>{' '}
              results
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        }
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-500 font-mono mt-1">ID: {selectedProduct._id}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0 ml-4"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <img
                  src={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images[0] : "https://via.placeholder.com/300"}
                  alt={selectedProduct.name}
                  className="w-full sm:w-48 h-48 rounded-xl object-cover border border-gray-100"
                />
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Mô tả</h4>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedProduct.description || "Không có mô tả"}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Giá bán</h4>
                      <p className="text-lg font-black text-indigo-600">${selectedProduct.price?.toFixed(2)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Kho</h4>
                      <p className="text-sm font-medium text-gray-900">{Number(selectedProduct.totalVariantStock ?? selectedProduct.stock ?? 0)} sản phẩm</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Người bán:</span>
                  <span className="font-bold text-gray-900">{selectedProduct.seller?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Danh mục:</span>
                  <span className="font-bold text-gray-900">{selectedProduct.category?.name || "Unknown"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500 font-medium">Ngày đăng:</span>
                  <span className="font-bold text-gray-900">{new Date(selectedProduct.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-gray-200">
                  <span className="text-gray-500 font-medium">Trạng thái:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                    selectedProduct.status === 'active' ? 'bg-green-100 text-green-800' : 
                    selectedProduct.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedProduct.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setSelectedProduct(null)}
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
