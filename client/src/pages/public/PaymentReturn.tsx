import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function PaymentReturn() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  useEffect(() => {
    // Backend da xac thuc cong thanh toan roi redirect ve day voi ket qua trong query params
    const params = new URLSearchParams(location.search);
    const success = params.get('success') === 'true';
    const msg = params.get('message') || '';

    if (success) {
      clearCart(); // Chỉ xóa giỏ hàng khi thanh toán thực sự thành công
      setStatus('success');
      setMessage(msg || 'Thanh toán thành công. Đơn hàng của bạn đã được ghi nhận.');
    } else if (params.has('success')) {
      // Có param success nhưng là false → thất bại/hủy
      setStatus('failed');
      setMessage(msg || 'Thanh toán không thành công. Vui lòng thử lại.');
    } else {
      // Không có params → truy cập trực tiếp trang này, redirect về home
      navigate('/', { replace: true });
    }
  }, [location, navigate, clearCart]);


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
          {status === 'loading' ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
              <h2 className="text-xl font-semibold text-gray-900">Đang xử lý kết quả thanh toán...</h2>
            </div>
          ) : status === 'success' ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in">
              <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h2>
              <p className="text-gray-600 mb-8">{message}</p>
              <button 
                onClick={() => navigate('/orders')}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                Xem đơn hàng của tôi
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in fade-in zoom-in">
              <XCircleIcon className="h-20 w-20 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại!</h2>
              <p className="text-gray-600 mb-8">{message}</p>
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                Thử lại
              </button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
