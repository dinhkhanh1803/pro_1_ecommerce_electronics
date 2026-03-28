import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import {
  UserIcon,
  PackageIcon,
  HeartIcon,
  MapPinIcon,
  MessageSquareIcon } from
'lucide-react';
interface CustomerLayoutProps {
  children: React.ReactNode;
  title: string;
}
export function CustomerLayout({ children, title }: CustomerLayoutProps) {
  const location = useLocation();
  const navItems = [
  {
    path: '/profile',
    label: 'Personal Info',
    icon: UserIcon
  },
  {
    path: '/orders',
    label: 'My Orders',
    icon: PackageIcon
  },
  {
    path: '/wishlist',
    label: 'Wishlist',
    icon: HeartIcon
  },
  {
    path: '/addresses',
    label: 'Address Book',
    icon: MapPinIcon
  },
  {
    path: '/chat',
    label: 'Messages',
    icon: MessageSquareIcon
  }];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src="https://ui-avatars.com/api/?name=John+Doe&background=6366f1&color=fff"
                  alt="User Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-100" />
                
                <div>
                  <h2 className="text-lg font-bold text-gray-900">John Doe</h2>
                  <p className="text-sm text-gray-500">john.doe@example.com</p>
                </div>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive =
                  location.pathname === item.path ||
                  location.pathname.startsWith(item.path + '/');
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                      
                      <item.icon
                        className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                      
                      <span>{item.label}</span>
                    </Link>);

                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
              {children}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>);

}