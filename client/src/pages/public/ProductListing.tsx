import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Footer } from "../../components/Footer";
import { ProductCard } from "../../components/ProductCard";
import { ChevronRightIcon, SlidersHorizontalIcon, XCircleIcon } from "lucide-react";


export function ProductListing() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 12;

  // Đọc category từ URL mỗi khi URL thay đổi
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const catFromUrl = searchParams.get("category") || "";
    setSelectedCategory(catFromUrl);
    setCurrentPage(1);
  }, [location.search]);

  // Fetch categories
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  // Fetch products khi filter thay đổi
  useEffect(() => {
    setLoading(true);
    let url = `${import.meta.env.VITE_API_URL}/api/products?status=active`;
    if (selectedCategory) {
      url += `&category=${selectedCategory}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let filtered = Array.isArray(data) ? data : [];
        if (priceMin) filtered = filtered.filter((p: any) => p.price >= Number(priceMin));
        if (priceMax) filtered = filtered.filter((p: any) => p.price <= Number(priceMax));
        if (sortBy === "price-low") filtered.sort((a: any, b: any) => a.price - b.price);
        if (sortBy === "price-high") filtered.sort((a: any, b: any) => b.price - a.price);
        if (sortBy === "newest") filtered.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setProducts(filtered);
        setLoading(false);
        setCurrentPage(1);
      })
      .catch(() => setLoading(false));
  }, [selectedCategory, priceMin, priceMax, sortBy]);

  const handleCategoryClick = (catId: string) => {
    if (catId === selectedCategory) {
      // Bỏ chọn → hiện tất cả
      navigate("/products");
    } else {
      navigate(`/products?category=${catId}`);
    }
  };

  const handleClearAll = () => {
    setPriceMin("");
    setPriceMax("");
    setSelectedRating(null);
    setSortBy("popular");
    navigate("/products");
  };

  const selectedCategoryName = categories.find(c => c._id === selectedCategory)?.name;

  // Pagination
  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginatedProducts = products.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center mb-6 space-x-2 text-sm text-gray-600">
          <a href="/" className="hover:text-indigo-600">Trang chủ</a>
          <ChevronRightIcon className="w-4 h-4" />
          <span className="font-medium text-gray-900">
            {selectedCategoryName ? selectedCategoryName : "Tất cả sản phẩm"}
          </span>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="flex-shrink-0 w-64">
            <div className="sticky p-6 bg-white shadow-sm rounded-xl top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Xóa tất cả
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-gray-900">Khoảng giá (USD)</h4>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-gray-900">Danh mục</h4>
                <div className="space-y-1">
                  {/* Tất cả sản phẩm */}
                  <button
                    onClick={() => navigate("/products")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? "bg-indigo-50 text-indigo-700 font-semibold"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    🛍️ Tất cả sản phẩm
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category._id}
                      onClick={() => handleCategoryClick(category._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category._id
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="mb-3 font-medium text-gray-900">Đánh giá</h4>
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                        selectedRating === rating
                          ? "bg-indigo-50 text-indigo-700 font-semibold"
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {"★".repeat(rating)}{"☆".repeat(5 - rating)} trở lên
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="flex items-center justify-between p-4 mb-6 bg-white shadow-sm rounded-xl">
              <p className="text-gray-600 text-sm">
                {selectedCategoryName ? (
                  <>Danh mục: <span className="font-semibold text-indigo-700">{selectedCategoryName}</span> — </>
                ) : null}
                Hiển thị <span className="font-semibold text-gray-900">{paginatedProducts.length}</span> / <span className="font-semibold text-gray-900">{products.length}</span> sản phẩm
              </p>
              <div className="flex items-center space-x-3">
                <SlidersHorizontalIcon className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="popular">Phổ biến nhất</option>
                  <option value="price-low">Giá: Thấp → Cao</option>
                  <option value="price-high">Giá: Cao → Thấp</option>
                  <option value="newest">Mới nhất</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((p) => (
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
                  <div className="col-span-3 py-16 text-center">
                    <p className="text-gray-400 text-lg mb-2">Không tìm thấy sản phẩm nào.</p>
                    <button
                      onClick={handleClearAll}
                      className="text-indigo-600 hover:underline text-sm"
                    >
                      Xóa bộ lọc và xem tất cả
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      currentPage === page
                        ? "bg-indigo-600 text-white font-bold"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                >
                  Tiếp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
