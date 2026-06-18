import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  MenuIcon,
  BellIcon,
  SearchIcon,
  ChevronDownIcon,
  LogOutIcon,
  UserIcon,
  SettingsIcon,
  XIcon,
} from "lucide-react";
import { useSiteSettings } from "../context/SiteSettingsContext";
export interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
}
interface DashboardLayoutProps {
  sidebarItems: SidebarItem[];
  title: string;
  role: string;
  children: React.ReactNode;
}
export function DashboardLayout({
  sidebarItems,
  title,
  role,
  children,
}: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { settings: siteSettings } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? "w-64" : "w-20"} fixed h-full z-20`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link
            to="/"
            className={`flex items-center space-x-2 ${!isSidebarOpen && "justify-center w-full"}`}
          >
            {siteSettings.primaryLogo ? (
              <img
                src={siteSettings.primaryLogo}
                alt={siteSettings.siteName}
                className="w-8 h-8 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-xl">
                  {siteSettings.siteName?.charAt(0) || "S"}
                </span>
              </div>
            )}
            {isSidebarOpen && (
              <span className="text-xl font-bold text-gray-900">
                {siteSettings.siteName}
              </span>
            )}
          </Link>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {isSidebarOpen && (
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {role === "Admin"
                ? "TRANG QUẢN TRỊ"
                : role === "Seller"
                  ? "KÊNH NGƯỜI BÁN"
                  : role === "Shipper"
                    ? "KÊNH GIAO HÀNG"
                    : role === "Warehouse"
                      ? "KÊNH THỦ KHO"
                      : `${role.toUpperCase()} PORTAL`}
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-xl transition-colors ${isActive ? "bg-indigo-50 text-indigo-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"} ${!isSidebarOpen && "justify-center"}`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <item.icon
                  className={`h-5 w-5 ${isActive ? "text-indigo-600" : "text-gray-400"} shrink-0`}
                />

                {isSidebarOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className={`flex items-center w-full text-gray-600 hover:text-red-600 transition-colors ${!isSidebarOpen && "justify-center"}`}
          >
            <LogOutIcon className="h-5 w-5 shrink-0" />
            {isSidebarOpen && (
              <span className="ml-3 font-medium">Đăng xuất</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}
      >
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4 hidden lg:block"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none mr-4 lg:hidden"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* <div className="relative hidden md:block">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-9 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent w-64"
              />
            </div> */}

            {/* <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
              <BellIcon className="h-6 w-6" />
              <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
            </button> */}

            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <img
                  className="h-8 w-8 rounded-full object-cover border border-gray-200"
                  src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff"
                  alt="User avatar"
                />

                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
                <ChevronDownIcon className="hidden md:block h-4 w-4 text-gray-500" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Hồ sơ cá nhân
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <SettingsIcon className="h-4 w-4 mr-2 text-gray-400" />
                    Cài đặt
                  </Link>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOutIcon className="h-4 w-4 mr-2 text-red-500" />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
