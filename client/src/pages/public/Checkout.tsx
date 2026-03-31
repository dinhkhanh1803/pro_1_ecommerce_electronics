import { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CreditCardIcon,
  WalletIcon,
  BanknoteIcon,
  MapPinIcon,
  TruckIcon,
} from 'lucide-react';

const formatVND = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const SHIPPING_BASE = 30_000;
const FREE_SHIP_THRESHOLD = 500_000;
const EXPRESS_ADDITIONAL = 30_000;

export function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { discountAmount = 0, freeShipping = false, couponCode } = (location.state as any) || {};

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [selectedAddress, setSelectedAddress] = useState('new');
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  const baseShipping = freeShipping || subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_BASE;
  const shipping = baseShipping + (deliveryMethod === 'express' ? EXPRESS_ADDITIONAL : 0);
  const total = subtotal + shipping - discountAmount;

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    // Fetch profile
    fetch('http://localhost:5000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUserProfile(data);
        setFormData(prev => ({
          ...prev,
          fullName: data.name || '',
          phone: data.phone || ''
        }));
        // If user has addresses, we could potentially pick one or let them choose 'new'
      })
      .catch(console.error);
  }, [token, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!formData.fullName || !formData.phone || !formData.street || !formData.city) {
      alert('Vui lòng nhập đầy đủ thông tin giao hàng.');
      return;
    }

    try {
      // 1. Save profile information if it was missing or if user explicitly wants to save it
      // Logic: Save if phone was missing or if it's a new address
      const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zip}`.trim().replace(/, ,/g, ',');
      
      const updateData: any = {};
      if (!userProfile?.phone || userProfile.phone !== formData.phone) updateData.phone = formData.phone;
      if (!userProfile?.addresses?.includes(fullAddress)) updateData.address = fullAddress;

      if (Object.keys(updateData).length > 0) {
        await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        });
      }

      // 2. Map items and POST to /api/orders
      // Group items by seller
      const sellerGroups: Record<string, any[]> = {};
      cartItems.forEach(item => {
        // Fallback context seller if not saved previously
        const sellerId = item.seller || 'undefined'; 
        if (!sellerGroups[sellerId]) sellerGroups[sellerId] = [];
        sellerGroups[sellerId].push({
          product: item.id,
          quantity: item.quantity,
          price: item.price
        });
      });

      const ordersPromises = Object.keys(sellerGroups).map(async (sellerId, index) => {
        const products = sellerGroups[sellerId];
        const orderSubtotal = products.reduce((acc, p) => acc + p.price * p.quantity, 0);
        // Put shipping/discount on the first order, others just subtotal
        const orderTotal = index === 0 ? orderSubtotal + shipping - discountAmount : orderSubtotal;

        return fetch('http://localhost:5000/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            seller: sellerId,
            products,
            totalAmount: orderTotal,
            shippingAddress: fullAddress,
            paymentMethod: paymentMethod === 'cod' ? 'COD' : 'VNPay'
          })
        });
      });

      const responses = await Promise.all(ordersPromises);
      const allSuccess = responses.every(res => res.ok);

      if (allSuccess) {
        alert('Đặt hàng thành công! Cảm ơn bạn.');
        clearCart();
        navigate('/orders');
      } else {
        alert('Có lỗi xảy ra khi tạo một số phần của đơn hàng.');
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi đặt hàng.');
    }
  };

  const handleSelectSavedAddress = (addrStr: string, idx: number) => {
    setSelectedAddress(idx.toString());
    // Parse address if possible or just put it in street
    setFormData({
      ...formData,
      street: addrStr,
      city: '',
      state: '',
      zip: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <MapPinIcon className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Địa chỉ giao hàng
                </h2>
              </div>

              {/* Saved Addresses */}
              {userProfile?.addresses?.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Địa chỉ đã lưu</h3>
                  {userProfile.addresses.map((address: string, index: number) => (
                    <label
                      key={index}
                      className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedAddress === index.toString() ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={index}
                        checked={selectedAddress === index.toString()}
                        onChange={() => handleSelectSavedAddress(address, index)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-900">{address}</p>
                        </div>
                        {selectedAddress === index.toString() && (
                          <span className="bg-indigo-500 text-white text-xs font-semibold px-2 py-1 rounded">
                            Đã chọn
                          </span>
                        )}
                      </div>
                    </label>
                  ))}

                  <label
                    className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${selectedAddress === 'new' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value="new"
                      checked={selectedAddress === 'new'}
                      onChange={() => setSelectedAddress('new')}
                      className="sr-only"
                    />
                    <p className="font-semibold text-gray-900">
                      + Thêm địa chỉ mới
                    </p>
                  </label>
                </div>
              )}

              {/* Address Form */}
              {(selectedAddress === 'new' || !userProfile?.addresses?.length) && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên người nhận</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ (Số nhà, đường...)</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tỉnh/Trạng thái</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Mã ZIP</label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Delivery Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TruckIcon className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Phương thức giao hàng
                </h2>
              </div>

              <div className="space-y-3">
                <label 
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${deliveryMethod === 'standard' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="standard"
                      checked={deliveryMethod === 'standard'}
                      onChange={() => setDeliveryMethod('standard')}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Giao hàng tiêu chuẩn
                      </p>
                      <p className="text-sm text-gray-600">3-5 ngày làm việc</p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">
                    {baseShipping === 0 ? 'Miễn phí' : formatVND(baseShipping)}
                  </span>
                </label>

                <label 
                  className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-colors ${deliveryMethod === 'express' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="delivery"
                      value="express"
                      checked={deliveryMethod === 'express'}
                      onChange={() => setDeliveryMethod('express')}
                      className="w-4 h-4 text-indigo-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Giao hàng nhanh (1-2 ngày)
                      </p>
                      <p className="text-sm text-gray-600">1-2 ngày làm việc</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900">
                    {formatVND(baseShipping + EXPRESS_ADDITIONAL)}
                  </span>
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-6">
                <CreditCardIcon className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-900">
                  Phương thức thanh toán
                </h2>
              </div>

              <div className="space-y-3">
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-indigo-600 mr-3"
                  />
                  <BanknoteIcon className="h-6 w-6 text-gray-600 mr-3" />
                  <span className="font-semibold text-gray-900">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${paymentMethod === 'vnpay' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 text-indigo-600 mr-3"
                  />
                  <WalletIcon className="h-6 w-6 text-gray-600 mr-3" />
                  <span className="font-semibold text-gray-900">VNPay</span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Tóm tắt đơn hàng
              </h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.color}`} className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        x{item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {formatVND(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tạm tính</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Vận chuyển ({deliveryMethod === 'express' ? 'Nhanh' : 'Thường'})</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'Miễn phí' : formatVND(shipping)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Giảm giá {couponCode ? `(${couponCode})` : ''}</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between text-xl font-bold text-gray-900 mb-6">
                <span>Tổng cộng</span>
                <span className="text-red-600">{formatVND(total)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                disabled={cartItems.length === 0}
              >
                Đặt hàng ngay
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng cách đặt hàng, bạn đồng ý với Điều khoản & Điều kiện của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}