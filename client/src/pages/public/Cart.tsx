import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import {
  MinusIcon,
  PlusIcon,
  TagIcon,
  Trash2Icon,
  ArrowRightIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  XCircleIcon,
  Loader2Icon,
} from 'lucide-react';

import { formatVND } from '../../utils/format';
import { FREE_SHIP_THRESHOLD, SHIPPING_FEE } from '../../constants/common';

export function Cart() {
  const { cartItems, updateQuantity, removeItem, subtotal } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [coupon, setCoupon] = useState<any>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [freeShipping, setFreeShipping] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const shipping = freeShipping || subtotal >= FREE_SHIP_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping - discountAmount;

  const handleApplyCoupon = async () => {
    if (!promoCode.trim()) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setCouponError('Bạn cần đăng nhập để dùng mã giảm giá');
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    setCouponSuccess('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: promoCode, subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.message || 'Mã không hợp lệ');
        setCoupon(null);
        setDiscountAmount(0);
        setFreeShipping(false);
      } else {
        setCoupon(data.coupon);
        setDiscountAmount(data.discountAmount);
        setFreeShipping(data.freeShipping);
        const desc =
          data.freeShipping
            ? 'Miễn phí vận chuyển!'
            : `Giảm ${formatVND(data.discountAmount)}`;
        setCouponSuccess(`✓ Áp dụng thành công: ${desc}`);
      }
    } catch {
      setCouponError('Không thể kết nối server');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCoupon(null);
    setDiscountAmount(0);
    setFreeShipping(false);
    setPromoCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-sm p-16 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 rounded-full mb-6">
              <ShoppingBagIcon className="h-10 w-10 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-8">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Khám phá sản phẩm
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Giỏ hàng ({cartItems.length} sản phẩm)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {cartItems.map((item, idx) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}`}
                  className={`flex items-center gap-4 p-5 ${idx < cartItems.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-slate-50 transition-colors`}
                >
                  {/* Image */}
                  <Link to={`/product/${item.id}`} className="shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-100"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>
                    {(item.color || item.size) && (
                      <p className="text-sm text-gray-400 mt-0.5">
                        {[item.color !== 'Mặc định' ? item.color : null]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                    )}
                    <p className="text-sm font-medium text-indigo-600 mt-1">
                      {formatVND(item.price)} / sp
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                    >
                      <MinusIcon className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 font-bold text-center text-gray-900 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"
                    >
                      <PlusIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="text-right shrink-0 min-w-[100px]">
                    <p className="font-bold text-gray-900">
                      {formatVND(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    title="Xóa"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Free ship progress */}
            {!freeShipping && subtotal < FREE_SHIP_THRESHOLD && (
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                  <span>🚚 Mua thêm để được <span className="font-semibold text-indigo-600">miễn phí vận chuyển</span></span>
                  <span className="font-semibold">{formatVND(FREE_SHIP_THRESHOLD - subtotal)}</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((subtotal / FREE_SHIP_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

              {/* Coupon */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã giảm giá
                </label>
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="font-mono font-semibold text-green-700">{coupon.code}</span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !promoCode.trim()}
                      className="bg-gray-900 text-white px-4 py-2.5 rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
                    >
                      {couponLoading ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        <TagIcon className="h-4 w-4" />
                      )}
                      Áp dụng
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <XCircleIcon className="h-4 w-4" /> {couponError}
                  </p>
                )}
                {couponSuccess && (
                  <p className="text-green-600 text-sm mt-2">{couponSuccess}</p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tạm tính ({cartItems.length} sp)</span>
                  <span>{formatVND(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Phí vận chuyển</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                    {shipping === 0 ? 'Miễn phí' : formatVND(shipping)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Giảm giá ({coupon?.code})</span>
                    <span>-{formatVND(discountAmount)}</span>
                  </div>
                )}
                {freeShipping && !discountAmount && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Miễn phí ship ({coupon?.code})</span>
                    <span>-{formatVND(SHIPPING_FEE)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-gray-900 text-xl mb-6">
                <span>Tổng cộng</span>
                <span className="text-red-600">{formatVND(total)}</span>
              </div>

              <Link
                to="/checkout"
                state={{ discountAmount, freeShipping, couponCode: coupon?.code }}
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-base hover:bg-indigo-700 transition-colors"
              >
                Tiến hành thanh toán
                <ArrowRightIcon className="w-5 h-5" />
              </Link>

              <Link
                to="/products"
                className="block w-full text-center text-indigo-600 hover:text-indigo-700 font-medium mt-4 text-sm"
              >
                ← Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}