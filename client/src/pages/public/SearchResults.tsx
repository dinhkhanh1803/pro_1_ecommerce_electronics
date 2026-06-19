import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDownIcon, FilterIcon, StarIcon } from 'lucide-react';
import { Footer } from '../../components/Footer';
import { Navbar } from '../../components/Navbar';
import { ProductCard } from '../../components/ProductCard';

export function SearchResults() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  const productsPerPage = 9;

  const [priceRange, setPriceRange] = useState([0, 100000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('popular');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);

    const url = `${import.meta.env.VITE_API_URL}/api/products?status=active&search=${encodeURIComponent(query)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        let filtered = data;

        if (selectedCategories.length > 0) {
          filtered = filtered.filter((product: any) => selectedCategories.includes(product.category?._id || product.category));
        }

        filtered = filtered.filter((product: any) => product.price >= priceRange[0] && product.price <= priceRange[1]);

        if (selectedRating) {
          filtered = filtered.filter((product: any) => Number(product.rating ?? 5) >= selectedRating);
        }

        if (sortBy === 'popular') filtered.sort((a: any, b: any) => Number(b.sales || 0) - Number(a.sales || 0));
        if (sortBy === 'newest') filtered.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        if (sortBy === 'price-asc') filtered.sort((a: any, b: any) => a.price - b.price);
        if (sortBy === 'price-desc') filtered.sort((a: any, b: any) => b.price - a.price);
        if (sortBy === 'rating') filtered.sort((a: any, b: any) => Number(b.rating ?? 5) - Number(a.rating ?? 5));

        setProducts(filtered);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [query, selectedCategories, selectedRating, priceRange, sortBy]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((category) => category !== categoryId)
        : [...prev, categoryId]
    );
  };

  const totalPages = Math.ceil(products.length / productsPerPage);
  const safeCurrentPage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const paginatedProducts = products.slice(
    (safeCurrentPage - 1) * productsPerPage,
    safeCurrentPage * productsPerPage
  );

  const paginationItems = useMemo(() => {
    if (totalPages <= 1) return [];
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const items: Array<number | string> = [1];
    const start = Math.max(2, safeCurrentPage - 1);
    const end = Math.min(totalPages - 1, safeCurrentPage + 1);

    if (start > 2) items.push('start-ellipsis');
    for (let page = start; page <= end; page += 1) {
      items.push(page);
    }
    if (end < totalPages - 1) items.push('end-ellipsis');
    items.push(totalPages);

    return items;
  }, [safeCurrentPage, totalPages]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Kết quả tìm kiếm cho "{query}"
            </h1>
            <p className="mt-1 text-gray-500">Tìm thấy {products.length} sản phẩm phù hợp</p>
          </div>

          <div className="mt-4 flex items-center space-x-4 md:mt-0">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none rounded-xl border border-gray-300 bg-white py-2 pl-4 pr-10 text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="rating">Đánh giá cao nhất</option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
            <button className="flex items-center space-x-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 md:hidden">
              <FilterIcon className="h-4 w-4" />
              <span>Bộ lọc</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="hidden w-64 shrink-0 space-y-8 md:block">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Danh mục</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <label key={category._id} className="flex cursor-pointer items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => toggleCategory(category._id)}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Khoảng giá</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="100000000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
                />

                <div className="flex items-center justify-between space-x-4">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₫</span>
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value, 10), priceRange[1]])}
                      className="w-full rounded-xl border border-gray-300 py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <span className="text-gray-500">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₫</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value, 10)])}
                      className="w-full rounded-xl border border-gray-300 py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Đánh giá</h3>
              <div className="space-y-3">
                {[4, 3, 2, 1].map((rating) => (
                  <label key={rating} className="flex cursor-pointer items-center space-x-3">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === rating}
                      onChange={() => setSelectedRating(rating)}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex items-center">
                      {[...Array(5)].map((_, index) => (
                        <StarIcon
                          key={index}
                          className={`h-4 w-4 ${index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                      <span className="ml-2 text-sm text-gray-600">trở lên</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {loading ? (
              <p className="py-12 text-gray-500">Đang tìm sản phẩm...</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.length > 0 ? (
                  paginatedProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      id={product._id}
                      name={product.name}
                      price={product.price}
                      oldPrice={product.compareAtPrice}
                      rating={product.rating ?? 5}
                      reviewCount={product.reviewCount ?? 0}
                      image={product.images?.[0] || 'https://via.placeholder.com/500'}
                      badge={product.compareAtPrice > product.price ? 'Giảm giá' : undefined}
                      inStock={Number(product.totalVariantStock ?? product.stock ?? 0) > 0}
                    />
                  ))
                ) : (
                  <p className="col-span-3 py-12 text-gray-500">Không có sản phẩm nào phù hợp với tìm kiếm của bạn.</p>
                )}
              </div>
            )}

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={safeCurrentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trước
                  </button>

                  {paginationItems.map((item) =>
                    typeof item === 'number' ? (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setCurrentPage(item)}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl font-medium ${
                          item === safeCurrentPage
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {item}
                      </button>
                    ) : (
                      <span key={item} className="px-2 text-gray-500">...</span>
                    )
                  )}

                  <button
                    type="button"
                    disabled={safeCurrentPage === totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
