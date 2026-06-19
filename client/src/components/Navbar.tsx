import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDownIcon,
  MenuIcon,
  SearchIcon,
  ShoppingCartIcon,
  UserIcon,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSiteSettings } from "../context/SiteSettingsContext";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const { cartCount } = useCart();
  const { user } = useAuth();
  const { settings: siteSettings } = useSiteSettings();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" className="flex shrink-0 items-center space-x-2">
            {siteSettings.primaryLogo ? (
              <img
                src={siteSettings.primaryLogo}
                alt={siteSettings.siteName}
                className="h-8 w-8 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 bg-gradient-to-r from-rose-500 to-rose-600 shadow-sm">
                <span className="text-xl font-bold text-white">
                  {siteSettings.siteName?.charAt(0) || "S"}
                </span>
              </div>
            )}
            <span className="hidden text-xl font-bold text-gray-900 sm:inline">
              {siteSettings.siteName}
            </span>
          </Link>

          <div className="min-w-0 flex-1 max-w-2xl sm:mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-4 py-2 pl-10 pr-4 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <button
                type="submit"
                className="absolute left-3 top-2.5"
                aria-label="Tìm kiếm"
              >
                <SearchIcon className="h-5 w-5 text-gray-400 transition-colors hover:text-rose-600" />
              </button>
            </form>
          </div>

          <div className="flex shrink-0 items-center space-x-3 sm:space-x-5 lg:space-x-6">
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center space-x-1 text-gray-700 transition-colors hover:text-rose-600"
              >
                <MenuIcon className="h-5 w-5" />
                <span className="hidden md:inline">Danh mục</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {showCategories && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-gray-100 bg-white py-2 shadow-lg">
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/products?category=${category._id}`}
                      className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      onClick={() => setShowCategories(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/cart"
              className="relative text-gray-700 transition-colors hover:text-rose-600"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow-sm shadow-rose-200">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="flex items-center space-x-3">
              {user ? (
                <Link
                  to="/profile"
                  className="font-medium text-gray-700 transition-colors hover:text-rose-600"
                >
                  <UserIcon className="h-5 w-5 sm:hidden" />
                  <span className="hidden sm:inline">{user.name}</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="font-medium text-gray-700 transition-colors hover:text-rose-600"
                  >
                    <UserIcon className="h-5 w-5 sm:hidden" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="hidden rounded-xl bg-rose-600 px-4 py-2 font-medium text-white transition-colors hover:bg-rose-700 sm:inline-flex shadow-sm shadow-rose-200"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
