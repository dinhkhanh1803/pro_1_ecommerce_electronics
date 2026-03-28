import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  SearchIcon,
  ShoppingCartIcon,
  MenuIcon,
  UserIcon,
  ChevronDownIcon,
} from "lucide-react";
export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const cartItemCount = 3;
  const categories = [
    "Electronics",
    "Fashion",
    "Home & Garden",
    "Sports",
    "Books",
    "Toys",
    "Beauty",
    "Automotive",
  ];

  useEffect(() => {
    // Lấy user từ localStorage nếu đã login
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-500 rounded-lg">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ShopHub</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center space-x-1 text-gray-700 transition-colors hover:text-indigo-500"
              >
                <MenuIcon className="w-5 h-5" />
                <span className="hidden md:inline">Categories</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {showCategories && (
                <div className="absolute right-0 w-48 py-2 mt-2 bg-white border border-gray-100 shadow-lg rounded-xl">
                  {categories.map((category) => (
                    <Link
                      key={category}
                      to={`/products?category=${category}`}
                      className="block px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                      onClick={() => setShowCategories(false)}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-gray-700 transition-colors hover:text-indigo-500"
            >
              <ShoppingCartIcon className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-500 rounded-full -top-2 -right-2">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {user ? (
                <Link
                  to="/profile"
                  className="font-medium text-gray-700 transition-colors hover:text-indigo-500"
                >
                  {user.name}
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="font-medium text-gray-700 transition-colors hover:text-indigo-500"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 font-medium text-white transition-colors bg-indigo-500 rounded-xl hover:bg-indigo-600"
                  >
                    Register
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
