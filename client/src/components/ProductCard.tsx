import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, HeartIcon, ShoppingCartIcon } from 'lucide-react';
interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
}
export function ProductCard({
  id,
  name,
  price,
  oldPrice,
  rating,
  reviewCount,
  image,
  badge
}: ProductCardProps) {
  return (
    <Link to={`/product/${id}`} className="group">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          
          {badge &&
          <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
              {badge}
            </span>
          }
          <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50">
            <HeartIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button className="absolute bottom-3 right-3 bg-indigo-500 text-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600">
            <ShoppingCartIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) =>
              <StarIcon
                key={i}
                className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />

              )}
            </div>
            <span className="text-sm text-gray-500">({reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-indigo-600">
              ${price.toFixed(2)}
            </span>
            {oldPrice &&
            <span className="text-sm text-gray-400 line-through">
                ${oldPrice.toFixed(2)}
              </span>
            }
          </div>
        </div>
      </div>
    </Link>);

}