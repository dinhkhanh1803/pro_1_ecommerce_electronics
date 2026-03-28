import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CustomerLayout } from '../../components/CustomerLayout';
import { ProductCard } from '../../components/ProductCard';
import { HeartIcon, Trash2Icon, ShoppingCartIcon } from 'lucide-react';
// Mock Data
const INITIAL_WISHLIST = [
{
  id: '1',
  name: 'Wireless Noise-Cancelling Headphones Pro',
  price: 299.99,
  oldPrice: 349.99,
  rating: 4.8,
  reviewCount: 1245,
  image:
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
  badge: 'Sale'
},
{
  id: '2',
  name: 'Smart Watch Series 7',
  price: 399.0,
  rating: 4.9,
  reviewCount: 856,
  image:
  'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80'
},
{
  id: '3',
  name: 'Premium Leather Backpack',
  price: 129.5,
  rating: 4.5,
  reviewCount: 342,
  image:
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80'
}];

export function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState(INITIAL_WISHLIST);
  const handleRemove = (id: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== id));
  };
  const handleAddToCart = (id: string) => {
    // Add to cart logic
    console.log(`Added item ${id} to cart`);
  };
  return (
    <CustomerLayout title="My Wishlist">
      {wishlistItems.length > 0 ?
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlistItems.map((item) =>
        <div key={item.id} className="relative group">
              {/* Product Card */}
              <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col">
                <Link
              to={`/product/${item.id}`}
              className="block relative aspect-square overflow-hidden bg-gray-100">
              
                  <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              
                  {item.badge &&
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {item.badge}
                    </span>
              }
                </Link>

                <div className="p-4 flex-1 flex flex-col">
                  <Link to={`/product/${item.id}`} className="block mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {item.name}
                    </h3>
                  </Link>

                  <div className="mt-auto">
                    {/* Price */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xl font-bold text-indigo-600">
                        ${item.price.toFixed(2)}
                      </span>
                      {item.oldPrice &&
                  <span className="text-sm text-gray-400 line-through">
                          ${item.oldPrice.toFixed(2)}
                        </span>
                  }
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                    onClick={() => handleAddToCart(item.id)}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center">
                    
                        <ShoppingCartIcon className="h-4 w-4 mr-2" />
                        Add to Cart
                      </button>
                      <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 border border-gray-300 text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    title="Remove from wishlist">
                    
                        <Trash2Icon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        )}
        </div> :

      <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <HeartIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Save items you love to your wishlist to easily find them later.
          </p>
          <Link
          to="/products"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
          
            Explore Products
          </Link>
        </div>
      }
    </CustomerLayout>);

}