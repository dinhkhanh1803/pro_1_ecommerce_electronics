import React, { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import {
  UsersIcon,
  PackageIcon,
  ShoppingBagIcon,
  DollarSignIcon,
  LayoutTemplateIcon,
  ActivityIcon,
  PlusIcon,
  EditIcon,
  Trash2Icon,
  GripVerticalIcon,
  ImagePlusIcon,
  SettingsIcon,
  GlobeIcon,
  MailIcon } from
'lucide-react';
const ADMIN_SIDEBAR = [
{
  icon: ActivityIcon,
  label: 'Dashboard',
  path: '/admin/dashboard'
},
{
  icon: UsersIcon,
  label: 'Users',
  path: '/admin/users'
},
{
  icon: PackageIcon,
  label: 'Products',
  path: '/admin/products'
},
{
  icon: ShoppingBagIcon,
  label: 'Orders',
  path: '/admin/orders'
},
{
  icon: DollarSignIcon,
  label: 'Finance',
  path: '/admin/finance'
},
{
  icon: LayoutTemplateIcon,
  label: 'CMS',
  path: '/admin/cms'
}];

// Mock Data
const MOCK_BANNERS = [
{
  id: 'BAN-001',
  title: 'Summer Sale Hero',
  image:
  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
  link: '/products?category=summer',
  status: 'active',
  order: 1
},
{
  id: 'BAN-002',
  title: 'New Electronics Arrival',
  image:
  'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  link: '/products?category=electronics',
  status: 'active',
  order: 2
},
{
  id: 'BAN-003',
  title: 'Winter Clearance',
  image:
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  link: '/products?category=winter',
  status: 'draft',
  order: 3
}];

export function AdminCMS() {
  const [activeTab, setActiveTab] = useState('banners');
  const [banners, setBanners] = useState(MOCK_BANNERS);
  const tabs = [
  {
    id: 'banners',
    label: 'Homepage Banners'
  },
  {
    id: 'pages',
    label: 'Static Pages'
  },
  {
    id: 'settings',
    label: 'Site Settings'
  }];

  const handleToggleStatus = (id: string, currentStatus: string) => {
    setBanners(
      banners.map((b) =>
      b.id === id ?
      {
        ...b,
        status: currentStatus === 'active' ? 'draft' : 'active'
      } :
      b
      )
    );
  };
  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Content Management"
      role="Admin">
      
      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-8 shadow-sm">
        <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap py-4 px-6 font-medium text-sm transition-colors relative ${activeTab === tab.id ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
            
              {tab.label}
              {activeTab === tab.id &&
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>
            }
            </button>
          )}
        </div>
      </div>

      {activeTab === 'banners' &&
      <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Manage Banners
            </h3>
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Banner
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 grid grid-cols-12 gap-4">
              <div className="col-span-1">Order</div>
              <div className="col-span-4">Banner</div>
              <div className="col-span-3">Link</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-gray-200">
              {banners.map((banner) =>
            <div
              key={banner.id}
              className="p-4 flex items-center grid grid-cols-12 gap-4 hover:bg-gray-50 transition-colors group">
              
                  <div className="col-span-1 flex items-center">
                    <button className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                      <GripVerticalIcon className="h-5 w-5" />
                    </button>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {banner.order}
                    </span>
                  </div>

                  <div className="col-span-4 flex items-center space-x-4">
                    <div className="w-24 h-12 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                      <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover" />
                  
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {banner.title}
                      </p>
                      <p className="text-xs text-gray-500">{banner.id}</p>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center">
                    <span className="text-sm text-gray-600 truncate">
                      {banner.link}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <button
                  onClick={() =>
                  handleToggleStatus(banner.id, banner.status)
                  }
                  className="focus:outline-none">
                  
                      <StatusBadge status={banner.status as any} />
                    </button>
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                  className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  title="Edit">
                  
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  title="Delete">
                  
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
            )}
            </div>
          </div>
        </div>
      }

      {activeTab === 'pages' &&
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-50 mb-4">
            <LayoutTemplateIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Static Pages Editor
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Manage content for About Us, Terms of Service, Privacy Policy, and
            other static pages.
          </p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            Open Page Builder
          </button>
        </div>
      }

      {activeTab === 'settings' &&
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            General Settings
          </h3>

          <form className="space-y-8 max-w-3xl">
            {/* Basic Info */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Site Name
                  </label>
                  <input
                  type="text"
                  defaultValue="ShopHub"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Support Email
                  </label>
                  <input
                  type="email"
                  defaultValue="support@shophub.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Site Description (SEO)
                </label>
                <textarea
                rows={3}
                defaultValue="The premier multi-vendor marketplace for all your shopping needs."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y" />
              
              </div>
            </div>

            {/* Logos */}
            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Branding
              </h4>
              <div className="flex flex-col sm:flex-row gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Primary Logo
                  </p>
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer bg-gray-50">
                    <ImagePlusIcon className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">Upload Logo</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Favicon
                  </p>
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors cursor-pointer bg-gray-50">
                    <ImagePlusIcon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Fees */}
            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Platform Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Commission Rate (%)
                  </label>
                  <input
                  type="number"
                  defaultValue="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
              type="button"
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              
                Save Settings
              </button>
            </div>
          </form>
        </div>
      }
    </DashboardLayout>);

}