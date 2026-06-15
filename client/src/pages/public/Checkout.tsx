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
import { formatVND } from '../../utils/format';
import { FREE_SHIP_THRESHOLD, SHIPPING_FEE } from '../../constants/common';

const SHIPPING_BASE = SHIPPING_FEE;
const EXPRESS_ADDITIONAL = 30_000;

export function Checkout() {
  const { cartItems, subtotal, clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { discountAmount = 0, freeShipping = false, couponCode } = (location.state as any) || {};

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  
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
    fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUserProfile(data);
        setUserProfile(data);
        if (data.address) {
          setIsEditingAddress(false);
          // Pre-fill form in case they click edit
          const addrs = data.address.split(',').map((s: string) => s.trim());
          setFormData({
            fullName: data.name || '',
            phone: data.phone || '',
            street: addrs[0] || '',
            city: addrs[1] || '',
            state: addrs[2] || '',
            zip: addrs[3] || ''
          });
        } else {
          setIsEditingAddress(true);
          setFormData(prev => ({
            ...prev,
            fullName: data.name || '',
            phone: data.phone || ''
          }));
        }
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
      if (!userProfile?.address || userProfile.address !== fullAddress) updateData.address = fullAddress;

      if (Object.keys(updateData).length > 0) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
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
          variantName: item.variantName || item.color || 'Default',
          quantity: item.quantity,
          price: item.price
        });
      });

      const ordersPromises = Object.keys(sellerGroups).map(async (sellerId, index) => {
        const products = sellerGroups[sellerId];
        const orderSubtotal = products.reduce((acc, p) => acc + p.price * p.quantity, 0);
        // Put shipping/discount on the first order, others just subtotal
        const orderTotal = index === 0 ? orderSubtotal + shipping - discountAmount : orderSubtotal;

        return fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
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
            paymentMethod: paymentMethod === 'cod' ? 'COD' : 'VNPay',
            couponCode: index === 0 ? couponCode : null
          })
        });
      });

      const responses = await Promise.all(ordersPromises);
      const allSuccess = responses.every(res => res.ok);

      if (allSuccess) {
        const resultOrders = await Promise.all(responses.map(res => res.json()));
        const orderIds = resultOrders.map(o => o._id);

        if (paymentMethod === 'vnpay') {
           // Redirect to VNPay
           const vnpRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create_payment_url`, {
             method: 'POST',
             headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
             },
             body: JSON.stringify({ amount: total, orderIds })
           });
           const vnpData = await vnpRes.json();
           if (vnpData.paymentUrl) {
              // KHÔNG xóa giỏ hàng ở đây - chỉ xóa sau khi VNPay xác nhận thành công
              // Giỏ hàng sẽ được xóa ở trang PaymentReturn nếu thanh toán thành công
              window.location.href = vnpData.paymentUrl;
              return;
           } else {
              alert('Không thể tạo liên kết thanh toán VNPay.');
           }
        }

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

  // Address selection removed in favor of single address edit mode

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

              {/* Saved Address Display */}
              {userProfile?.address && !isEditingAddress && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Địa chỉ đang chọn</h3>
                  <div className="flex justify-between items-center p-4 border-2 border-indigo-500 bg-indigo-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">{formData.fullName}</p>
                      <p className="text-sm text-gray-600 mb-1">{formData.phone}</p>
                      <p className="text-sm text-gray-900 line-clamp-2">{userProfile.address}</p>
                    </div>
                    <button 
                      onClick={() => setIsEditingAddress(true)}
                      className="text-indigo-600 font-semibold px-3 py-1 hover:bg-indigo-100 rounded-lg transition-colors text-sm"
                    >
                      Cập nhật
                    </button>
                  </div>
                </div>
              )}

              {/* Address Form */}
              {isEditingAddress && (
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
                  {userProfile?.address && (
                    <div className="pt-2">
                       <button
                         onClick={() => setIsEditingAddress(false)}
                         className="text-gray-500 hover:text-gray-700 text-sm underline"
                       >
                         Hủy cập nhật
                       </button>
                    </div>
                  )}
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
