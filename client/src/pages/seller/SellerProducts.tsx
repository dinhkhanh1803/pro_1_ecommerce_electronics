import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  EditIcon,
  Trash2Icon } from
'lucide-react';
import { ADMIN_SIDEBAR, SELLER_SIDEBAR, WAREHOUSE_SIDEBAR } from '../../constants/sidebar';
import { useToast } from "../../context/ToastContext";

export function SellerProducts() {
  const { showConfirm } = useToast();
  const { user } = useAuth();
  const isWarehouse = user?.role === 'warehouse';
  const isAdmin = user?.role === 'admin';
  const sidebarItems = isAdmin
    ? ADMIN_SIDEBAR
    : (isWarehouse ? WAREHOUSE_SIDEBAR : SELLER_SIDEBAR);
  const roleName = isAdmin ? 'Admin' : (isWarehouse ? 'Warehouse' : 'Seller');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter products based on search
  const filteredProducts = productsList.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (product._id && product._id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Pagination logic
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchProducts = async () => {
    try {
      if (!user?.id) return;
      const url = (user.role === 'warehouse' || user.role === 'admin')
        ? `${import.meta.env.VITE_API_URL}/api/products`
        : `${import.meta.env.VITE_API_URL}/api/products?seller=${user.id}`;
      const res = await fetch(url);
      const data = await res.json();
      setProductsList(data);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm("Bạn có chắc chắn muốn xóa sản phẩm này?", { confirmLabel: "Xóa" });
    if (confirmed) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product", error);
      }
    }
  };

  const toggleSelectAll = () => {
    if (selectedProducts.length === paginatedProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(paginatedProducts.map((p) => p._id));
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
      sidebarItems={sidebarItems}
      title="Sản phẩm"
      role={roleName}>
      
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            
          </div>
          <button className="p-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <FilterIcon className="h-5 w-5" />
          </button>
        </div>

        <Link
          to={isAdmin ? "/admin/products/new" : (isWarehouse ? "/warehouse/products/new" : "/seller/products/new")}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium w-full sm:w-auto justify-center">
          
          <PlusIcon className="h-4 w-4 mr-2" />
          Thêm sản phẩm
        </Link>
      </div>

      {/* Bulk Actions (Visible when items selected) */}
      {selectedProducts.length > 0 &&
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <span className="text-sm font-medium text-indigo-800">
            Đã chọn {selectedProducts.length} sản phẩm
          </span>
          <div className="flex space-x-2">
            {/* <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
              Change Status
            </button> */}
            <button className="px-3 py-1.5 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50">
              Xóa
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
                    selectedProducts.length === paginatedProducts.length &&
                    paginatedProducts.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" />
                  
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kho
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Giảm giá
                </th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="p-4 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedProducts.map((product) => {
                const totalStock = Number(product.totalVariantStock ?? product.stock ?? 0);
                return (
                <tr
                  key={product._id}
                  className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4">
                    <input
                    type="checkbox"
                    checked={selectedProducts.includes(product._id)}
                    onChange={() => toggleSelectProduct(product._id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" />
                  
                  </td>
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
                  <td className="p-4 text-sm text-gray-600">
                    {product.category?.name || "Không xác định"}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">
                    {product.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price) : "0 ₫"}
                  </td>
                  <td className="p-4">
                    <span
                    className={`text-sm font-medium ${totalStock === 0 ? 'text-red-600' : totalStock < 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                    
                      {totalStock}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {product.compareAtPrice && product.compareAtPrice > product.price ? (
                      <span className="text-red-600 font-medium">-{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={product.status as any} />
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                      to={isAdmin ? `/admin/products/${product._id}/edit` : (isWarehouse ? `/warehouse/products/${product._id}/edit` : `/seller/products/${product._id}/edit`)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="Sửa">
                      
                        <EditIcon className="h-4 w-4" />
                      </Link>
                      <button
                      onClick={() => handleDelete(product._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa">
                      
                        <Trash2Icon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
          <p className="text-sm text-gray-500">
            Hiển thị từ <span className="font-medium text-gray-900">{totalItems === 0 ? 0 : startIndex + 1}</span> đến{' '}
            <span className="font-medium text-gray-900">{Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}</span> trên{' '}
            <span className="font-medium text-gray-900">{totalItems}</span> kết quả
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50">
              Trước
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50">
              Sau
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>);

}
