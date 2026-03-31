import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { ProductCard } from "../../components/ProductCard";
import { ChevronRightIcon, SlidersHorizontalIcon } from "lucide-react";
export function ProductListing() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const defaultCategory = searchParams.get("category");

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    defaultCategory ? [defaultCategory] : [],
  );
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const brands = ["Apple", "Samsung", "Sony", "Nike", "Adidas", "Canon"];

  useEffect(() => {
    fetch("http://localhost:5000/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = "http://localhost:5000/api/products?status=active";
    if (selectedCategories.length > 0) {
      url += `&category=${selectedCategories[0]}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let filtered = data;
        if (priceMin)
          filtered = filtered.filter((p: any) => p.price >= Number(priceMin));
        if (priceMax)
          filtered = filtered.filter((p: any) => p.price <= Number(priceMax));
        if (sortBy === "price-low")
          filtered.sort((a: any, b: any) => a.price - b.price);
        if (sortBy === "price-high")
          filtered.sort((a: any, b: any) => b.price - a.price);

        setProducts(filtered);
        setLoading(false);
      })
      .catch(console.error);
  }, [selectedCategories, priceMin, priceMax, sortBy]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((c) => c !== categoryId)
        : [...prev, categoryId],
    );
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6 space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-indigo-600">
            Home
          </a>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="font-medium text-gray-900">Products</span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="flex-shrink-0 w-64">
            <div className="sticky p-6 bg-white shadow-sm rounded-xl top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button className="text-sm text-indigo-600 hover:text-indigo-700">
                  Clear All
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-gray-900">Price Range</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-gray-900">Categories</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category._id}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category._id)}
                        onChange={() => toggleCategory(category._id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />

                      <span className="text-sm text-gray-700">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-gray-900">Rating</h4>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(rating)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedRating === rating ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-50"}`}
                    >
                      <span className="text-sm">{rating}★ & above</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h4 className="mb-3 font-medium text-gray-900">Brands</h4>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label
                      key={brand}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />

                      <span className="text-sm text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between p-4 mb-6 bg-white shadow-sm rounded-xl">
              <p className="text-gray-600">
                Showing{" "}
                <span className="font-semibold text-gray-900">1-12</span> of{" "}
                <span className="font-semibold text-gray-900">
                  {products.length}
                </span>{" "}
                products
              </p>
              <div className="flex items-center space-x-3">
                <SlidersHorizontalIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <p className="py-12 text-gray-500">Loading products...</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
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
                      image={p.images?.[0] || "https://via.placeholder.com/500"}
                      badge={p.compareAtPrice > p.price ? "Sale" : undefined}
                    />
                  ))
                ) : (
                  <p className="col-span-3 py-12 text-center text-gray-500">
                    No products found matching your criteria.
                  </p>
                )}
              </div>
            )}

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Previous
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg ${currentPage === page ? "bg-indigo-500 text-white" : "border border-gray-300 hover:bg-gray-50"}`}
                >
                  {page}
                </button>
              ))}
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
