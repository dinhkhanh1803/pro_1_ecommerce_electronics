import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProductCard } from '../../components/ProductCard';
import { StarRating } from '../../components/StarRating';
import {
  ChevronRightIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  RotateCcwIcon,
  StarIcon,
  MessageSquareIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../hooks/useWishlist';

// Giá trong DB đã là VNĐ
const formatVND = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const [selectedImage, setSelectedImage] = useState(0);
  // Lưu tên variant được chọn (từ variants[].name)
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:5000/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        // Chọn variant đầu tiên mặc định nếu có
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0].name || '');
        }
        // Fetch sản phẩm liên quan
        if (data.category?._id) {
          fetch(`http://localhost:5000/api/products?category=${data.category._id}&status=active`)
            .then(r => r.json())
            .then(related =>
              setRelatedProducts(
                Array.isArray(related)
                  ? related.filter((p: any) => p._id !== data._id).slice(0, 4)
                  : []
              )
            )
            .catch(console.error);
        }
      })
      .catch(console.error);

    // Mock reviews (thay bằng API khi có bảng Review)
    setReviews([
      { id: 1, name: 'Nguyễn Văn An', rating: 5, date: '15/03/2026', comment: 'Sản phẩm tốt lắm, chất lượng cao!', avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: 2, name: 'Trần Thị Bình', rating: 4, date: '10/03/2026', comment: 'Hài lòng với sản phẩm, giao hàng nhanh.', avatar: 'https://i.pravatar.cc/150?img=5' },
    ]);
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    // Tính giá dựa vào variant được chọn
    const variantObj = product.variants?.find((v: any) => v.name === selectedVariant);
    const finalPrice = product.price + (variantObj?.priceAdd || 0);

    addToCart({
      id: product._id,
      name: product.name,
      price: finalPrice,
      quantity,
      image: product.images?.[0] || 'https://via.placeholder.com/500',
      color: selectedVariant || 'Mặc định',
      size: selectedVariant || 'Mặc định',
      seller: typeof product.seller === 'string' ? product.seller : product.seller?._id,
    });
    alert('Đã thêm vào giỏ hàng!');
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    setWishlistLoading(true);
    await toggleWishlist(product._id);
    setWishlistLoading(false);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError('Vui lòng nhập nội dung đánh giá.');
      return;
    }
    setSubmitLoading(true);
    setReviewError('');
    const newReview = {
      id: Date.now(),
      name: user?.name || 'Khách',
      rating: reviewRating,
      date: new Date().toLocaleDateString('vi-VN'),
      comment: reviewComment,
      avatar: 'https://i.pravatar.cc/150?img=10',
    };
    setReviews(prev => [newReview, ...prev]);
    setReviewComment('');
    setReviewRating(5);
    setSubmitLoading(false);
  };

  // ─── Computed values ────────────────────────────────────────────────────────
  const images = product?.images?.length ? product.images : ['https://via.placeholder.com/800'];

  // Nếu sản phẩm không có variants → dùng 1 lựa chọn "Mặc định"
  const variants: any[] =
    product?.variants?.length
      ? product.variants
      : [{ name: 'Mặc định', priceAdd: 0, stock: product?.stock ?? 0 }];

  const selectedVariantObj = variants.find(v => v.name === selectedVariant) ?? variants[0];

  // Giá = price (VNĐ) + priceAdd của variant
  const basePrice: number = product?.price ?? 0;
  const currentPrice: number = basePrice + (selectedVariantObj?.priceAdd ?? 0);
  const comparePrice: number = product?.compareAtPrice ?? 0;
  const hasDiscount = comparePrice > 0 && comparePrice > currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
    : 0;

  // Tồn kho: nếu variant có trường stock thì dùng, nếu không dùng stock gốc
  const availableStock: number = selectedVariantObj?.stock ?? product?.stock ?? 0;

  // Rating trung bình
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;
  // ────────────────────────────────────────────────────────────────────────────

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-indigo-600">Trang chủ</a>
          <ChevronRightIcon className="h-4 w-4" />
          <a href="/products" className="hover:text-indigo-600">Sản phẩm</a>
          {product.category?.name && (
            <>
              <ChevronRightIcon className="h-4 w-4" />
              <a
                href={`/products?category=${product.category._id}`}
                className="hover:text-indigo-600"
              >
                {product.category.name}
              </a>
            </>
          )}
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* ── Image Gallery ── */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === idx ? 'border-indigo-500' : 'border-transparent hover:border-gray-300'}`}
                    >
                      <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Product Info ── */}
            <div className="flex flex-col">
              {/* Name + Brand */}
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>
              {product.brand && (
                <p className="text-sm text-gray-500 mb-3">
                  Thương hiệu: <span className="text-indigo-600 font-semibold">{product.brand}</span>
                </p>
              )}
              {product.sku && (
                <p className="text-xs text-gray-400 mb-3">SKU: {product.sku}</p>
              )}

              {/* Rating */}
              <div className="flex items-center space-x-3 mb-5">
                <StarRating rating={avgRating} size="lg" />
                <span className="text-gray-500 text-sm">({reviews.length} đánh giá)</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-green-600 font-medium">Đã bán: {product.sales ?? 0}</span>
              </div>

              {/* Price block */}
              <div className="bg-red-50 rounded-xl px-5 py-4 mb-5">
                <div className="flex items-baseline flex-wrap gap-3">
                  <span className="text-4xl font-bold text-red-600">
                    {formatVND(currentPrice)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        {formatVND(comparePrice)}
                      </span>
                      <span className="bg-red-500 text-white text-sm font-bold px-2.5 py-1 rounded-full">
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>
                {hasDiscount && (
                  <p className="text-sm text-gray-500 mt-1">
                    Tiết kiệm: <span className="text-red-500 font-semibold">{formatVND(comparePrice - currentPrice)}</span>
                  </p>
                )}
              </div>

              {/* Description short */}
              <p className="text-gray-600 leading-relaxed mb-5 line-clamp-3">{product.description}</p>

              {/* Variants */}
              {variants.length > 0 && !(variants.length === 1 && variants[0].name === 'Mặc định') && (
                <div className="mb-5">
                  <h3 className="font-semibold text-gray-800 mb-2">Phiên bản / Màu sắc</h3>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v: any) => (
                      <button
                        key={v.name}
                        onClick={() => setSelectedVariant(v.name)}
                        disabled={v.stock === 0}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all
                          ${selectedVariant === v.name
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-700 hover:border-indigo-300'}
                          ${v.stock === 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                      >
                        {v.name}
                        {v.priceAdd > 0 && (
                          <span className="ml-1 text-xs text-gray-400">(+{formatVND(v.priceAdd)})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock */}
              <div className="mb-5">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  availableStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {availableStock > 0 ? `Còn hàng (${availableStock} sản phẩm)` : 'Hết hàng'}
                </span>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">Số lượng</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-xl font-bold"
                  >
                    −
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={availableStock === 0}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-xl font-bold disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={availableStock === 0}
                  className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {availableStock > 0 ? 'Thêm vào giỏ hàng' : 'Hết hàng'}
                </button>
                <button
                  onClick={handleToggleWishlist}
                  disabled={wishlistLoading}
                  className={`px-4 py-3 border-2 rounded-xl transition-all ${
                    id && isWishlisted(id)
                      ? 'border-red-400 bg-red-50 text-red-500'
                      : 'border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-400'
                  }`}
                  title={id && isWishlisted(id) ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                  <HeartIcon className={`h-5 w-5 transition-all ${id && isWishlisted(id) ? 'fill-red-400' : ''}`} />
                </button>
              </div>

              {/* Chat Button */}
              {product.seller && (
                <div className="mb-6">
                  <button
                    onClick={() => {
                      const sellerId = typeof product.seller === 'string' ? product.seller : product.seller._id;
                      if (!sellerId) return;
                      window.location.href = `/chat?contactId=${sellerId}`;
                    }}
                    className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-indigo-500 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-all"
                  >
                    <MessageSquareIcon className="h-5 w-5" />
                    <span>Trò chuyện với người bán</span>
                  </button>
                </div>
              )}

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-gray-100">
                <div className="text-center">
                  <TruckIcon className="h-7 w-7 text-indigo-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Miễn phí vận chuyển</p>
                </div>
                <div className="text-center">
                  <ShieldCheckIcon className="h-7 w-7 text-indigo-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Bảo hành 2 năm</p>
                </div>
                <div className="text-center">
                  <RotateCcwIcon className="h-7 w-7 text-indigo-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Đổi trả 30 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              {['description', 'specifications', 'reviews'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 font-semibold transition-colors ${
                    activeTab === tab
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab === 'description' ? 'Mô tả' : tab === 'specifications' ? 'Thông số' : `Đánh giá (${reviews.length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          {activeTab === 'description' && (
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
          )}

          {/* Specifications — dữ liệu thực từ DB */}
          {activeTab === 'specifications' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
              {[
                ['Thương hiệu', product.brand || '—'],
                ['SKU', product.sku || '—'],
                ['Danh mục', product.category?.name || '—'],
                ['Giá niêm yết', comparePrice > 0 ? formatVND(comparePrice) : '—'],
                ['Giá bán', formatVND(currentPrice)],
                ['Tồn kho', `${product.stock} sản phẩm`],
                ['Trạng thái', product.status],
                ['Đã bán', `${product.sales ?? 0} sản phẩm`],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2.5 border-b border-gray-100">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-600 text-right">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div>
              {/* Summary */}
              <div className="flex flex-col sm:flex-row items-start gap-8 mb-8 p-5 bg-gray-50 rounded-xl">
                <div className="text-center min-w-[100px]">
                  <div className="text-5xl font-bold text-gray-900">{avgRating.toFixed(1)}</div>
                  <StarRating rating={avgRating} size="lg" />
                  <p className="text-sm text-gray-500 mt-1">{reviews.length} đánh giá</p>
                </div>
                <div className="flex-1 space-y-2 w-full">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = reviews.filter(r => r.rating === star).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-4 text-right">{star}</span>
                        <StarIcon className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-4">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Write Review */}
              <div className="bg-gray-50 rounded-xl p-5 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Viết đánh giá của bạn</h4>
                <form onSubmit={handleSubmitReview}>
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                      >
                        <StarIcon className={`h-7 w-7 transition-colors ${star <= (hoverRating || reviewRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'][hoverRating || reviewRating]}
                    </span>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    rows={3}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                  />
                  {reviewError && <p className="text-red-500 text-sm mt-1">{reviewError}</p>}
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="mt-3 bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    {submitLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </form>
              </div>

              {/* Review list */}
              <div className="space-y-5">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-5 last:border-0">
                    <div className="flex items-start gap-3">
                      <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 text-sm">{review.name}</h4>
                          <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                        <StarRating rating={review.rating} />
                        <p className="text-gray-600 text-sm leading-relaxed mt-1">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard
                  key={p._id}
                  id={p._id}
                  name={p.name}
                  price={p.price}
                  oldPrice={p.compareAtPrice}
                  rating={4.8}
                  reviewCount={p.sales ?? 0}
                  image={p.images?.[0] || 'https://via.placeholder.com/500'}
                  badge={p.compareAtPrice > p.price ? 'Sale' : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}