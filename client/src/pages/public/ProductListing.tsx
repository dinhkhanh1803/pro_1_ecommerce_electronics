import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProductCard } from '../../components/ProductCard';
import { ChevronRightIcon, SlidersHorizontalIcon } from 'lucide-react';
export function ProductListing() {
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const categories = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Beauty',
  'Automotive'];

  const brands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'Canon'];
  const products = Array(12).
  fill(null).
  map((_, i) => ({
    id: `${i + 1}`,
    name: `Product ${i + 1}`,
    price: 29.99 + i * 10,
    oldPrice: i % 3 === 0 ? 49.99 + i * 10 : undefined,
    rating: 4 + i % 2 * 0.5,
    reviewCount: 100 + i * 20,
    image: `https://images.unsplash.com/photo-${1523275335684 + i}?w=500&h=500&fit=crop`,
    badge: i % 4 === 0 ? 'Sale' : undefined
  }));
  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
    prev.includes(category) ?
    prev.filter((c) => c !== category) :
    [...prev, category]
    );
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-indigo-600">
            Home
          </a>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Products</span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-700">
                  Clear All
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) =>
                  <label
                    key={category}
                    className="flex items-center space-x-2 cursor-pointer">
                    
                      <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  )}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) =>
                  <button
                    key={rating}
                    onClick={() => setSelectedRating(rating)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedRating === rating ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-gray-50'}`}>
                    
                      <span className="text-sm">{rating}★ & above</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Brands</h4>
                <div className="space-y-2">
                  {brands.map((brand) =>
                  <label
                    key={brand}
                    className="flex items-center space-x-2 cursor-pointer">
                    
                      <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    
                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Showing{' '}
                <span className="font-semibold text-gray-900">1-12</span> of{' '}
                <span className="font-semibold text-gray-900">156</span>{' '}
                products
              </p>
              <div className="flex items-center space-x-3">
                <SlidersHorizontalIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) =>
              <ProductCard key={product.id} {...product} />
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              {[1, 2, 3, 4, 5].map((page) =>
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg ${currentPage === page ? 'bg-indigo-500 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}>
                
                  {page}
                </button>
              )}
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>);

}