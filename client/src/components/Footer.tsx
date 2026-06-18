import React from 'react';
import { Link } from 'react-router-dom';
import {
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon,
  HeadphonesIcon } from
'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export function Footer() {
  const { settings: siteSettings } = useSiteSettings();
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Trust Badges */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                <TruckIcon className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Miễn phí vận chuyển</p>
                <p className="text-xs text-gray-500">Đơn hàng từ 500K</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <ShieldCheckIcon className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Bảo hành chính hãng</p>
                <p className="text-xs text-gray-500">12 tháng toàn quốc</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <CreditCardIcon className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Thanh toán an toàn</p>
                <p className="text-xs text-gray-500">COD, MoMo, VNPay</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center group-hover:bg-rose-500/20 transition-colors">
                <HeadphonesIcon className="h-6 w-6 text-rose-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Hỗ trợ 24/7</p>
                <p className="text-xs text-gray-500">Luôn sẵn sàng hỗ trợ</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {siteSettings.primaryLogo ? (
                <img src={siteSettings.primaryLogo} alt={siteSettings.siteName} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">{siteSettings.siteName?.charAt(0) || 'S'}</span>
                </div>
              )}
              <span className="text-white font-bold text-lg">{siteSettings.siteName}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {siteSettings.siteDescription}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-400">
                <MailIcon className="h-4 w-4 mr-2 text-indigo-400" />
                {siteSettings.supportEmail}
              </div>
              <div className="flex items-center text-gray-400">
                <PhoneIcon className="h-4 w-4 mr-2 text-indigo-400" />
                1900 6868
              </div>
              <div className="flex items-center text-gray-400">
                <MapPinIcon className="h-4 w-4 mr-2 text-indigo-400" />
                TP. Hồ Chí Minh, Việt Nam
              </div>
            </div>
          </div>

          {/* Hỗ trợ khách hàng */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Hỗ trợ khách hàng
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/help" className="hover:text-indigo-400 transition-colors">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-indigo-400 transition-colors">
                  Tra cứu đơn hàng
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-indigo-400 transition-colors">
                  Đổi trả & Hoàn tiền
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-indigo-400 transition-colors">
                  Thông tin vận chuyển
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-indigo-400 transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Chính sách */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Chính sách</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-indigo-400 transition-colors">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-400 transition-colors">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/seller-policy" className="hover:text-indigo-400 transition-colors">
                  Chính sách người bán
                </Link>
              </li>
              <li>
                <Link to="/payment-security" className="hover:text-indigo-400 transition-colors">
                  Bảo mật thanh toán
                </Link>
              </li>
            </ul>
          </div>

          {/* Kết nối */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Kết nối với chúng tôi
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Đăng ký nhận thông tin ưu đãi mới nhất
            </p>
            <div className="flex mb-6">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 px-4 py-2.5 rounded-l-xl bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white text-sm" />
              
              <button className="bg-indigo-500 px-5 py-2.5 rounded-r-xl hover:bg-indigo-600 transition-colors font-medium text-sm text-white">
                Gửi
              </button>
            </div>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-indigo-500 hover:text-white transition-all">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-sky-500 hover:text-white transition-all">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:bg-pink-500 hover:text-white transition-all">
                <InstagramIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>&copy; 2026 {siteSettings.siteName}. Bảo lưu mọi quyền.</p>
          <p className="mt-2 md:mt-0">{siteSettings.supportEmail}</p>
        </div>
      </div>
    </footer>);
}
