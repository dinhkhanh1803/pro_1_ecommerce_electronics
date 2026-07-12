import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { StatusBadge } from '../../components/StatusBadge';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import {
  PlusIcon,
  EditIcon,
  Trash2Icon,
  GripVerticalIcon,
  ImagePlusIcon,
  XIcon } from
'lucide-react';
import { ADMIN_SIDEBAR } from '../../constants/sidebar';
import { useToast } from "../../context/ToastContext";

export function AdminCMS() {
  const [activeTab, setActiveTab] = useState('banners');
  const [banners, setBanners] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const { refreshSettings } = useSiteSettings();
  const { showConfirm } = useToast();

  // Banner Modal State
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '/',
    cta: 'Shop Now',
    status: 'active',
    order: 0
  });

  const fetchBanners = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cms/banners`);
      const data = await res.json();
      setBanners(data);
    } catch (err) {}
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cms/settings`);
      const data = await res.json();
      setSettings(data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchBanners();
    fetchSettings();
  }, []);
  const tabs = [
  {
    id: 'banners',
    label: 'Banner trang chủ'
  },
  {
    id: 'settings',
    label: 'Cài đặt trang'
  }];

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${import.meta.env.VITE_API_URL}/api/cms/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: currentStatus === 'active' ? 'draft' : 'active' })
      });
      fetchBanners();
    } catch (err) {}
  };

  const handleOpenBannerModal = (banner: any = null) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({
        title: banner.title,
        subtitle: banner.subtitle || '',
        image: banner.image,
        link: banner.link,
        cta: banner.cta || 'Shop Now',
        status: banner.status,
        order: banner.order
      });
    } else {
      setEditingBanner(null);
      setBannerForm({
        title: '',
        subtitle: '',
        image: '',
        link: '/',
        cta: 'Shop Now',
        status: 'active',
        order: banners.length + 1
      });
    }
    setIsBannerModalOpen(true);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Phiên đăng nhập đã hết hạn");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json() as { url?: string; message?: string };
      if (!res.ok) throw new Error(data.message || "Tải ảnh lên thất bại");
      if (!data.url) throw new Error("Máy chủ không trả về đường dẫn ảnh hợp lệ");
      const imageUrl = data.url;

      setBannerForm(prev => ({ ...prev, image: imageUrl }));
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const url = editingBanner
        ? `${import.meta.env.VITE_API_URL}/api/cms/banners/${editingBanner._id}`
        : `${import.meta.env.VITE_API_URL}/api/cms/banners`;

      const res = await fetch(url, {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...bannerForm, type: 'hero' })
      });

      if (res.ok) {
        setIsBannerModalOpen(false);
        fetchBanners();
      }
    } catch (err) {}
  };

  const handleUploadSettingsImage = async (e: React.ChangeEvent<HTMLInputElement>, field: 'primaryLogo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/upload-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      setSettings((prev: any) => ({ ...prev, [field]: data.url }));
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        siteName: (document.getElementById('siteName') as HTMLInputElement)?.value,
        supportEmail: (document.getElementById('supportEmail') as HTMLInputElement)?.value,
        siteDescription: (document.getElementById('siteDescription') as HTMLTextAreaElement)?.value,
        primaryLogo: settings.primaryLogo || '',
        favicon: settings.favicon || '',
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cms/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        refreshSettings();
        alert("Lưu cài đặt thành công!");
      }
    } catch (err) {}
  };
  return (
    <DashboardLayout
      sidebarItems={ADMIN_SIDEBAR}
      title="Quản lý giao diện & cài đặt"
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
              Quản lý Banner
            </h3>
            <button
              onClick={() => handleOpenBannerModal()}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Thêm Banner
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500 grid grid-cols-12 gap-4">
              <div className="col-span-1">Thứ tự</div>
              <div className="col-span-6">Thông tin Banner</div>
              <div className="col-span-2">Trạng thái</div>
              <div className="col-span-3 text-right">Hành động</div>
            </div>

            <div className="divide-y divide-gray-200">
              {banners.map((banner) =>
            <div
              key={banner._id}
              className="p-4 flex items-center grid grid-cols-12 gap-4 hover:bg-gray-50 transition-colors group">

                  <div className="col-span-1 flex items-center">
                    <button className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                      <GripVerticalIcon className="h-5 w-5" />
                    </button>
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      {banner.order}
                    </span>
                  </div>

                  <div className="col-span-6 flex items-center space-x-4">
                    <div className="w-24 h-12 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-gray-100">
                      <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover" />

                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {banner.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{banner.link}</p>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <button
                  onClick={() =>
                  handleToggleStatus(banner._id, banner.status)
                  }
                  className="focus:outline-none">

                      <StatusBadge status={banner.status as any} />
                    </button>
                  </div>

                  <div className="col-span-3 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenBannerModal(banner)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="Sửa"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await showConfirm("Bạn có chắc chắn muốn xóa banner này?", { confirmLabel: "Xóa" });
                        if (!confirmed) return;
                        const token = localStorage.getItem("token");
                        fetch(`${import.meta.env.VITE_API_URL}/api/cms/banners/${banner._id}`, {
                          method: 'DELETE',
                          headers: { Authorization: `Bearer ${token}` }
                        }).then(() => fetchBanners());
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
            )}
            {banners.length === 0 && (
              <div className="p-8 text-center text-gray-500 font-medium italic">
                Chưa có banner nào được tạo.
              </div>
            )}
            </div>
          </div>
        </div>
      }

      {activeTab === 'settings' &&
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Cài đặt chung
          </h3>

          <form className="space-y-8 max-w-3xl" onSubmit={handleSaveSettings}>
            {/* Basic Info */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên trang web
                  </label>
                  <input
                  type="text"
                  id="siteName"
                  defaultValue={settings.siteName || "ShopHub"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email hỗ trợ
                  </label>
                  <input
                  type="email"
                  id="supportEmail"
                  defaultValue={settings.supportEmail || "support@shophub.com"}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả trang web (SEO)
                </label>
                <textarea
                rows={3}
                id="siteDescription"
                defaultValue={settings.siteDescription || "The premier multi-vendor marketplace for all your shopping needs."}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y" />

              </div>
            </div>

            {/* Logos */}
            <div className="border-t border-gray-200 pt-8">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                Thương hiệu
              </h4>
              <div className="flex flex-col sm:flex-row gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Logo chính
                  </p>
                  <label className="cursor-pointer">
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors bg-gray-50 overflow-hidden">
                      {settings.primaryLogo ? (
                        <img src={settings.primaryLogo} alt="Logo" className="w-full h-full object-contain p-2" />
                      ) : (
                        <>
                          <ImagePlusIcon className="h-6 w-6 mb-2" />
                          <span className="text-xs font-medium">Tải lên Logo</span>
                        </>
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadSettingsImage(e, 'primaryLogo')} />
                  </label>
                  {settings.primaryLogo && (
                    <button type="button" onClick={() => setSettings((prev: any) => ({...prev, primaryLogo: ''}))} className="text-xs text-red-500 mt-2 hover:underline">Gỡ bỏ</button>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Favicon
                  </p>
                  <label className="cursor-pointer">
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-indigo-400 hover:bg-indigo-50 transition-colors bg-gray-50 overflow-hidden">
                      {settings.favicon ? (
                        <img src={settings.favicon} alt="Favicon" className="w-full h-full object-contain p-1" />
                      ) : (
                        <ImagePlusIcon className="h-4 w-4" />
                      )}
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadSettingsImage(e, 'favicon')} />
                  </label>
                  {settings.favicon && (
                    <button type="button" onClick={() => setSettings((prev: any) => ({...prev, favicon: ''}))} className="text-xs text-red-500 mt-2 hover:underline">Gỡ bỏ</button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors">

                Lưu cài đặt
              </button>
            </div>
          </form>
        </div>
      }

      {/* Banner Modal */}
      {isBannerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full flex flex-col animate-in fade-in zoom-in duration-200 relative overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">{editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner mới'}</h3>
              <button
                onClick={() => setIsBannerModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề Banner</label>
                    <input
                      type="text"
                      required
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề phụ</label>
                    <input
                      type="text"
                      value={bannerForm.subtitle}
                      onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
                    <input
                      type="number"
                      value={bannerForm.order}
                      onChange={(e) => setBannerForm({...bannerForm, order: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh Banner</label>
                     <div className="flex items-center gap-4">
                        <div className="w-24 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                          {bannerForm.image ? (
                            <img src={bannerForm.image} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                               <ImagePlusIcon className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <label className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 text-center cursor-pointer hover:bg-gray-100 transition-colors">
                          {loading ? 'Đang tải lên...' : 'Chọn tệp'}
                          <input type="file" className="hidden" onChange={handleUploadImage} accept="image/*" />
                        </label>
                     </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Văn bản CTA</label>
                    <input
                      type="text"
                      value={bannerForm.cta}
                      onChange={(e) => setBannerForm({...bannerForm, cta: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đường dẫn liên kết</label>
                    <input
                      type="text"
                      value={bannerForm.link}
                      onChange={(e) => setBannerForm({...bannerForm, link: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
               </div>

               <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(false)}
                    className="px-6 py-2 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !bannerForm.image}
                    className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    Lưu Banner
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>);

}
