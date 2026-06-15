import { Link } from 'react-router-dom';
import { StarIcon, HeartIcon, ShoppingCartIcon } from 'lucide-react';
import { useWishlist } from '../hooks/useWishlist';
import { formatVND } from '../utils/format';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  inStock?: boolean;
}

export function ProductCard({
  id,
  name,
  price,
  oldPrice,
  rating,
  reviewCount,
  image,
  badge,
  inStock = true,
}: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(id);
  };

  return (
    <Link to={`/product/${id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {badge && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {badge}
            </span>
          )}
          {!inStock && (
            <span className="absolute top-3 left-3 bg-gray-900/85 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Hết hàng
            </span>
          )}
          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100
              ${wishlisted ? 'bg-red-50 text-red-500' : 'bg-white text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
          >
            <HeartIcon className={`h-4 w-4 ${wishlisted ? 'fill-red-500' : ''}`} />
          </button>
          <button
            disabled={!inStock}
            className="absolute bottom-3 right-3 bg-indigo-500 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCartIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors text-sm">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-base font-bold text-red-600">
              {formatVND(price)}
            </span>
            {oldPrice && oldPrice > price && (
              <>
                <span className="text-xs text-gray-400 line-through">
                  {formatVND(oldPrice)}
                </span>
                <span className="text-xs bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded">
                  -{Math.round(((oldPrice - price) / oldPrice) * 100)}%
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
