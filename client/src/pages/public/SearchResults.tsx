import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProductCard } from '../../components/ProductCard';
import { FilterIcon, ChevronDownIcon, StarIcon } from 'lucide-react';

export function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || 'headphones';
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `http://localhost:5000/api/products?status=active&search=${encodeURIComponent(query)}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        let filtered = data;
        
        if (selectedCategories.length > 0) {
          filtered = filtered.filter((p: any) => selectedCategories.includes(p.category?._id || p.category));
        }

        filtered = filtered.filter((p: any) => p.price >= priceRange[0] && p.price <= priceRange[1]);
        
        if (sortBy === 'price-asc') filtered.sort((a: any, b: any) => a.price - b.price);
        if (sortBy === 'price-desc') filtered.sort((a: any, b: any) => b.price - a.price);
        
        setProducts(filtered);
        setLoading(false);
      })
      .catch(console.error);
  }, [query, selectedCategories, priceRange, sortBy]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ?
      prev.filter((c) => c !== categoryId) :
      [...prev, categoryId]
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Search results for "{query}"
              </h1>
              <p className="text-gray-500 mt-1">Showing search results ({products.length})</p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                
                <option value="popular">Most Popular</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
            </div>
            <button className="md:hidden flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-xl text-gray-700">
              <FilterIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="hidden md:block w-64 shrink-0 space-y-8">
            {/* Categories */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Categories
              </h3>
              <div className="space-y-3">
                {categories.map((category) =>
                <label
                  key={category._id}
                  className="flex items-center space-x-3 cursor-pointer">
                  
                    <input
                    type="checkbox"
                    checked={selectedCategories.includes(category._id)}
                    onChange={() => toggleCategory(category._id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  
                    <span className="text-gray-700">{category.name}</span>
                  </label>
                )}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Price Range
              </h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="1000"
                  value={priceRange[1]}
                  onChange={(e) =>
                  setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                
                <div className="flex items-center justify-between space-x-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                      setPriceRange([parseInt(e.target.value), priceRange[1]])
                      }
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    
                  </div>
                  <span className="text-gray-500">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                      }
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rating
              </h3>
              <div className="space-y-3">
                {[4, 3, 2, 1].map((rating) =>
                <label
                  key={rating}
                  className="flex items-center space-x-3 cursor-pointer">
                  
                    <input
                    type="radio"
                    name="rating"
                    checked={selectedRating === rating}
                    onChange={() => setSelectedRating(rating)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300" />
                  
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) =>
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />

                    )}
                      <span className="ml-2 text-sm text-gray-600">& Up</span>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <p className="text-gray-500 py-12">Searching products...</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length > 0 ? (
                  products.map((p) => (
                    <ProductCard
                      key={p._id}
                      id={p._id}
                      name={p.name}
                      price={p.price}
                      oldPrice={p.compareAtPrice}
                      rating={4.8}
                      reviewCount={p.sales || 0}
                      image={p.images?.[0] || 'https://via.placeholder.com/500'}
                      badge={p.compareAtPrice > p.price ? 'Sale' : undefined}
                    />
                  ))
                ) : (
                  <p className="col-span-3 text-gray-500 py-12">No products match your search.</p>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
                </button>
                <button className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-medium">
                  1
                </button>
                <button className="w-10 h-10 border border-gray-300 text-gray-600 rounded-xl flex items-center justify-center font-medium hover:bg-gray-50">
                  2
                </button>
                <button className="w-10 h-10 border border-gray-300 text-gray-600 rounded-xl flex items-center justify-center font-medium hover:bg-gray-50">
                  3
                </button>
                <span className="text-gray-500 px-2">...</span>
                <button className="w-10 h-10 border border-gray-300 text-gray-600 rounded-xl flex items-center justify-center font-medium hover:bg-gray-50">
                  12
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>);

}