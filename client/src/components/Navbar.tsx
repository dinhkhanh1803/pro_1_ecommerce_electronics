import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SearchIcon,
  ShoppingCartIcon,
  MenuIcon,
  UserIcon,
  ChevronDownIcon } from
'lucide-react';
export function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const cartItemCount = 3;
  const categories = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Beauty',
  'Automotive'];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
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
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
              
              <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-6">
            {/* Categories Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="flex items-center space-x-1 text-gray-700 hover:text-indigo-500 transition-colors">
                
                <MenuIcon className="h-5 w-5" />
                <span className="hidden md:inline">Categories</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {showCategories &&
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100">
                  {categories.map((category) =>
                <Link
                  key={category}
                  to={`/products?category=${category}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                  onClick={() => setShowCategories(false)}>
                  
                      {category}
                    </Link>
                )}
                </div>
              }
            </div>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-indigo-500 transition-colors">
              
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 &&
              <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              }
            </Link>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="text-gray-700 hover:text-indigo-500 transition-colors font-medium">
                
                Login
              </Link>
              <Link
                to="/register"
                className="bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-600 transition-colors font-medium">
                
                Register
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>);

}