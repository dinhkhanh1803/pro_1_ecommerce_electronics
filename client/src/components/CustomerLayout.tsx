import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { useAuth } from '../context/AuthContext';
import {
  UserIcon,
  PackageIcon,
  HeartIcon,
  MapPinIcon,
  MessageSquareIcon,
  LogOutIcon
} from 'lucide-react';

interface CustomerLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function CustomerLayout({ children, title }: CustomerLayoutProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    {
      path: '/profile',
      label: 'Thông tin cá nhân',
      icon: UserIcon
    },
    {
      path: '/orders',
      label: 'Đơn hàng của tôi',
      icon: PackageIcon
    },
    {
      path: '/wishlist',
      label: 'Danh sách yêu thích',
      icon: HeartIcon
    },
    {
      path: '/chat',
      label: 'Tin nhắn',
      icon: MessageSquareIcon
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-4 mb-8">
                <img
                  src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=6366f1&color=fff`}
                  alt="User Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100 p-0.5"
                />
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-gray-900 truncate">{user?.name || 'Khách hàng'}</h2>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter">{user?.role || 'Customer'}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.path ||
                    (item.path !== '/' && location.pathname.startsWith(item.path));
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-semibold' 
                          : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 text-sm font-medium"
                  >
                    <LogOutIcon className="h-5 w-5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-8 border-l-4 border-indigo-600 pl-4">{title}</h1>
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}