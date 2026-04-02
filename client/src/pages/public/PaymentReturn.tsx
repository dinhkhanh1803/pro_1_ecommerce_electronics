import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';

export function PaymentReturn() {
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Ping backend to verify IPN and get status if needed, 
    // or we just call the vnpay_return endpoint which handles it
    
    fetch(`http://localhost:5000/api/payment/vnpay_return${location.search}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Thanh toán thành công. Đơn hàng của bạn đã được ghi nhận.');
        } else {
          setStatus('failed');
          setMessage(data.message || 'Thanh toán không thành công. Vui lòng thử lại.');
        }
      })
      .catch(err => {
        console.error(err);
        setStatus('failed');
        setMessage('Đã xảy ra lỗi kết nối khi xác thực thanh toán.');
      });
  }, [location]);

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
