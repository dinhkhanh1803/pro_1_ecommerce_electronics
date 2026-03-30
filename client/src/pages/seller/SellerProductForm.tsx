import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import {
  PackageIcon,
  ShoppingBagIcon,
  BarChart2Icon,
  TagIcon,
  StarIcon,
  MessageSquareIcon,
  ChevronLeftIcon,
  UploadCloudIcon,
  XIcon,
  PlusIcon,
  Trash2Icon } from
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

export function SellerProductForm() {
  const navigate = useNavigate();
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState([
  {
    id: 1,
    name: 'Default',
    price: 0,
    stock: 0
  }]
  );
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Mock upload - just add a placeholder image
    if (e.target.files && e.target.files.length > 0) {
      setImages([
      ...images,
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&q=80']
      );
    }
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

  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: (document.getElementById('name') as HTMLInputElement)?.value,
        description: (document.getElementById('description') as HTMLTextAreaElement)?.value,
        category: (document.getElementById('category') as HTMLSelectElement)?.value,
        brand: (document.getElementById('brand') as HTMLInputElement)?.value,
        price: Number((document.getElementById('price') as HTMLInputElement)?.value),
        compareAtPrice: Number((document.getElementById('compareAtPrice') as HTMLInputElement)?.value) || undefined,
        sku: (document.getElementById('sku') as HTMLInputElement)?.value,
        stock: Number((document.getElementById('stock') as HTMLInputElement)?.value),
        images,
        variants: variants.map(v => ({ name: v.name, priceAdd: v.price, stock: v.stock }))
      };
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        navigate('/seller/products');
      } else {
        alert("Failed to create product");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout
      sidebarItems={SELLER_SIDEBAR}
      title="Add Product"
      role="Seller">
      
      <div className="mb-6">
        <Link
          to="/seller/products"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
          
          <ChevronLeftIcon className="h-4 w-4 mr-1" />
          Back to Products
        </Link>
      </div>

      <form className="max-w-4xl mx-auto space-y-8" onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Basic Information
          </h3>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Wireless Noise-Cancelling Headphones Pro"
                required />
              
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
                placeholder="Describe your product..."
                required />
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                  required>
                  
                  <option value="">Select a category</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="brand"
                  className="block text-sm font-medium text-gray-700 mb-1">
                  
                  Brand (Optional)
                </label>
                <input
                  type="text"
                  id="brand"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g. Sony" />
                
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Product Images
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

              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer">
                <UploadCloudIcon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">Upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload} />
                
              </label>
            </div>
            <p className="text-sm text-gray-500">
              Upload up to 8 images. Recommended size: 1000x1000px.
            </p>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                Regular Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="price"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00"
                  required />
                
              </div>
            </div>
            <div>
              <label
                htmlFor="comparePrice"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                Compare at Price ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="comparePrice"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="0.00" />
                
              </div>
              <p className="text-xs text-gray-500 mt-1">
                To show a reduced price, move the product's original price into
                Compare at price.
              </p>
            </div>
            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                id="sku"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. WH-1000XM4" />
              
            </div>
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-1">
                
                Initial Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
                required />
              
            </div>
          </div>

          {/* Variants */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-gray-900">Variants</h4>
              <button
                type="button"
                onClick={addVariant}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
                
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Variant
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) =>
              <div
                key={variant.id}
                className="flex items-end gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Variant Name
                    </label>
                    <input
                    type="text"
                    placeholder="e.g. Size M, Color Red"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Price Add ($)
                    </label>
                    <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                  
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Stock
                    </label>
                    <input
                    type="number"
                    placeholder="0"
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
            
            Cancel
          </button>
          <button
            type="button"
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
            
            Save as Draft
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
            
            Publish Product
          </button>
        </div>
      </form>
    </DashboardLayout>);

}