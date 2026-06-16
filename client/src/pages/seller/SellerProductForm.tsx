import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  ChevronLeftIcon,
  UploadCloudIcon,
  XIcon,
  PlusIcon,
  Trash2Icon } from
  'lucide-react';
import { useParams } from 'react-router-dom';
import { SELLER_SIDEBAR } from '../../constants/sidebar';

export function SellerProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [images, setImages] = useState<string[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    price: 0,
    compareAtPrice: 0,
    sku: ''
  });

  const [variants, setVariants] = useState<any[]>([
  {
    id: 1,
    name: 'Default',
    price: 0,
    stock: 0
  }]
  );

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);

    if (id) {
      setLoading(true);
      fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          setProductData({
            name: data.name || '',
            description: data.description || '',
            category: data.category?._id || data.category || '',
            brand: data.brand || '',
            price: data.price || 0,
            compareAtPrice: data.compareAtPrice || 0,
            sku: data.sku || ''
          });
          setImages(data.images || []);
          if (data.variants && data.variants.length > 0) {
            setVariants(data.variants.map((v: any, index: number) => ({
              id: index + 1,
              name: v.name,
              price: v.priceAdd,
              stock: v.stock
            })));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setProductData(prev => ({
      ...prev,
      [id]: id === 'price' || id === 'compareAtPrice' ? Number(value) : value
    }));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { 
      ...newVariants[index], 
      [field]: field === 'price' || field === 'stock' ? Number(value) : value 
    };
    setVariants(newVariants);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setUploadError('Bạn chưa đăng nhập');
      return;
    }

    setUploadError(null);
    const fileArray = Array.from(files);
    setUploadingCount(prev => prev + fileArray.length);

    const uploadPromises = fileArray.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Upload thất bại');
      }

      const data = await res.json();
      return data.url as string;
    });

    const results = await Promise.allSettled(uploadPromises);

    const successUrls: string[] = [];
    const errors: string[] = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        successUrls.push(result.value);
      } else {
        errors.push(result.reason?.message || 'Upload thất bại');
      }
    });

    if (successUrls.length > 0) {
      setImages(prev => [...prev, ...successUrls]);
    }
    if (errors.length > 0) {
      setUploadError(errors.join(', '));
    }

    setUploadingCount(prev => prev - fileArray.length);
    // Reset input để có thể upload lại cùng file
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  const addVariant = () => {
    setVariants([
    ...variants,
    {
      id: Date.now(),
      name: '',
      price: 0,
      stock: 0
    }]
    );
  };
  const removeVariant = (id: number) => {
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...productData,
        images,
        variants: variants.map(v => ({ name: v.name, priceAdd: v.price, stock: v.stock }))
      };
      const token = localStorage.getItem("token");
      const url = id 
        ? `${import.meta.env.VITE_API_URL}/api/products/${id}` 
        : `${import.meta.env.VITE_API_URL}/api/products`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        navigate('/seller/products');
      } else {
        const errorData = await res.json();
        alert(errorData.message || (id ? "Cập nhật sản phẩm thất bại" : "Tạo sản phẩm thất bại"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={SELLER_SIDEBAR} title="Loading..." role="Seller">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      sidebarItems={SELLER_SIDEBAR}
      title={id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
      role="Seller">
      
      <div className="mb-6">
        <Link
          to="/seller/products"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
           Quay lại Sản phẩm
        </Link>
      </div>

      <form className="max-w-4xl mx-auto space-y-8" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Thông tin cơ bản
          </h3>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                Tên sản phẩm <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={productData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                 placeholder="VD: Tai nghe chụp tai chống ồn Wireless Pro"
                required />
              
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={5}
                value={productData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                placeholder="Mô tả sản phẩm của bạn..."
                required />
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={productData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                  required>
                  
                  <option value="">Chọn một danh mục</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="brand"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  
                  Thương hiệu (Tùy chọn)
                </label>
                <input
                  type="text"
                  id="brand"
                  value={productData.brand}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="VD: Sony" />
                
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Hình ảnh sản phẩm
          </h3>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {images.map((img, index) =>
              <div
                key={index}
                className="relative w-24 h-24 rounded-xl border border-gray-200 overflow-hidden group">
                
                  <img
                  src={img}
                  alt={`Preview ${index}`}
                  className="w-full h-full object-cover" />
                
                  <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-white/80 p-1 rounded-full text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white">
                  
                    <XIcon className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Loading placeholders khi đang upload */}
              {Array.from({ length: uploadingCount }).map((_, i) => (
                <div
                  key={`uploading-${i}`}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50 flex flex-col items-center justify-center text-indigo-400">
                  <svg className="animate-spin h-6 w-6 mb-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  <span className="text-xs font-medium">Đang tải lên</span>
                </div>
              ))}

              {images.length + uploadingCount < 8 && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <UploadCloudIcon className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">Tải lên</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    disabled={uploadingCount > 0}
                    onChange={handleImageUpload} />
                </label>
              )}
            </div>

            {uploadError && (
              <p className="text-sm text-red-600 font-medium">⚠️ {uploadError}</p>
            )}

            <p className="text-sm text-gray-500">
              Upload tối đa 8 ảnh. Kích thước khuyến nghị: 1000x1000px. Tối đa 5MB/ảnh.
            </p>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Giá cả & Kho hàng
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                Giá bán thường (đ) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  đ
                </span>
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="0.01"
                  value={productData.price}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0"
                  required />
                
              </div>
            </div>
            <div>
              <label
                htmlFor="comparePrice"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                Giá gốc trước giảm (đ)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  đ
                </span>
                <input
                  type="number"
                  id="compareAtPrice"
                  min="0"
                  step="0.01"
                  value={productData.compareAtPrice}
                  onChange={handleInputChange}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0" />
                
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Để hiển thị giá giảm, vui lòng đặt giá gốc trước giảm của sản phẩm cao hơn giá bán thường.
              </p>
            </div>
            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                Mã SKU (Mã phân loại hàng hóa)
              </label>
              <input
                type="text"
                id="sku"
                value={productData.sku}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="VD: WH-1000XM4" />
              
            </div>
            <div className="text-sm text-gray-500 md:col-span-2">
              Tồn kho sản phẩm được tính tự động bằng tổng tồn kho của tất cả variants.
            </div>
          </div>

          {/* Variants */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Biến thể</h4>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                
                <PlusIcon className="h-4 w-4 mr-1" />
                Thêm biến thể
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) =>
              <div
                key={variant.id}
                className="flex items-end gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tên biến thể
                    </label>
                    <input
                    type="text"
                    placeholder="VD: Size M, Màu Đỏ"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Giá cộng thêm (đ)
                    </label>
                    <input
                    type="number"
                    placeholder="0"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Kho
                    </label>
                    <input
                    type="number"
                    placeholder="0"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  
                  </div>
                  {variants.length > 1 &&
                <button
                  type="button"
                  onClick={() => removeVariant(variant.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mb-0.5">
                  
                      <Trash2Icon className="h-5 w-5" />
                    </button>
                }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/seller/products')}
            className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors">
            
             Hủy
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            
             Lưu bản nháp
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            
             {id ? "Cập nhật sản phẩm" : "Đăng sản phẩm"}
          </button>
        </div>
      </form>
    </DashboardLayout>);

}
