import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CustomerLayout } from '../../components/CustomerLayout';
import { HeartIcon, Trash2Icon, ShoppingCartIcon } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const formatVND = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const API = `${import.meta.env.VITE_API_URL}/api`;

export function Wishlist() {
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchWishlist = async () => {
    if (!token) { setLoading(false); return; }
    try {
      const res = await fetch(`${API}/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setWishlistItems(Array.isArray(data) ? data : []);
    } catch {
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    if (!token) return;
    try {
      await fetch(`${API}/users/wishlist/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.images?.[0] || 'https://via.placeholder.com/500',
      color: 'Mặc định',
      size: 'Mặc định',
    });
    alert(`Đã thêm "${item.name}" vào giỏ hàng!`);
  };

  return (
    <CustomerLayout title="Danh sách yêu thích">
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
      ) : wishlistItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map(item => (
            <div key={item._id} className="relative group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col">
              {/* Image */}
              <Link
                to={`/product/${item._id}`}
                className="block relative aspect-square overflow-hidden bg-gray-100"
              >
                <img
                  src={item.images?.[0] || 'https://via.placeholder.com/500'}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.compareAtPrice > item.price && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    -{Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)}%
                  </span>
                )}
              </Link>

              <div className="p-4 flex flex-col flex-1">
                <Link to={`/product/${item._id}`} className="block mb-1">
                  <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors text-sm">
                    {item.name}
                  </h3>
                </Link>
                {item.brand && (
                  <p className="text-xs text-gray-400 mb-2">{item.brand}</p>
                )}

                {/* Price */}
                <div className="flex items-center flex-wrap gap-2 mb-4 mt-auto">
                  <span className="text-lg font-bold text-red-600">
                    {formatVND(item.price)}
                  </span>
                  {item.compareAtPrice > item.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatVND(item.compareAtPrice)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock === 0}
                    className="flex-1 bg-indigo-600 text-white py-2 px-3 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    {item.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
                  </button>
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="p-2 border border-gray-200 text-gray-400 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                    title="Xóa khỏi yêu thích"
                  >
                    <Trash2Icon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <HeartIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Danh sách yêu thích trống</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Nhấn vào biểu tượng ❤️ trên sản phẩm để lưu vào danh sách yêu thích.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      )}
    </CustomerLayout>
  );
}