import React, { useState, memo } from 'react';
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
  RotateCcwIcon } from
'lucide-react';
export function ProductDetail() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('Black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const images = [
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1545127398-14699f92334b?w=800&h=800&fit=crop',
  'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&h=800&fit=crop'];

  const colors = ['Black', 'White', 'Blue', 'Red'];
  const sizes = ['S', 'M', 'L', 'XL'];
  const reviews = [
  {
    id: 1,
    name: 'John Doe',
    rating: 5,
    date: 'March 15, 2026',
    comment:
    'Excellent product! The sound quality is amazing and the battery life is great.',
    avatar: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: 2,
    name: 'Jane Smith',
    rating: 4,
    date: 'March 10, 2026',
    comment:
    'Very good headphones, comfortable to wear for long periods. Only minor issue is the case could be better.',
    avatar: 'https://i.pravatar.cc/150?img=2'
  },
  {
    id: 3,
    name: 'Mike Johnson',
    rating: 5,
    date: 'March 5, 2026',
    comment: 'Best purchase I made this year. Highly recommended!',
    avatar: 'https://i.pravatar.cc/150?img=3'
  }];

  const relatedProducts = [
  {
    id: '2',
    name: 'Wireless Earbuds Pro',
    price: 129.99,
    rating: 4.7,
    reviewCount: 342,
    image:
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop'
  },
  {
    id: '3',
    name: 'Premium Headphone Stand',
    price: 24.99,
    rating: 4.5,
    reviewCount: 156,
    image:
    'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop'
  },
  {
    id: '4',
    name: 'Audio Cable Kit',
    price: 19.99,
    rating: 4.3,
    reviewCount: 89,
    image:
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop'
  },
  {
    id: '5',
    name: 'Carrying Case',
    price: 29.99,
    rating: 4.6,
    reviewCount: 234,
    image:
    'https://images.unsplash.com/photo-1585076800183-dd5b8b6c3c5e?w=500&h=500&fit=crop'
  }];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <a href="/" className="hover:text-indigo-600">
            Home
          </a>
          <ChevronRightIcon className="h-4 w-4" />
          <a href="/products" className="hover:text-indigo-600">
            Products
          </a>
          <ChevronRightIcon className="h-4 w-4" />
          <a
            href="/products?category=Electronics"
            className="hover:text-indigo-600">
            
            Electronics
          </a>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-gray-900 font-medium">
            Wireless Bluetooth Headphones
          </span>
        </div>

        {/* Product Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-4">
                <img
                  src={images[selectedImage]}
                  alt="Product"
                  className="w-full h-full object-cover" />
                
              </div>
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) =>
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === index ? 'border-indigo-500' : 'border-transparent'}`}>
                  
                    <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover" />
                  
                  </button>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Premium Wireless Bluetooth Headphones
              </h1>

              <div className="flex items-center space-x-4 mb-6">
                <StarRating rating={4.5} size="lg" />
                <span className="text-gray-600">(234 reviews)</span>
              </div>

              <div className="flex items-baseline space-x-4 mb-6">
                <span className="text-4xl font-bold text-indigo-600">
                  $79.99
                </span>
                <span className="text-2xl text-gray-400 line-through">
                  $129.99
                </span>
                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                  38% OFF
                </span>
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                Experience premium sound quality with our wireless Bluetooth
                headphones. Featuring active noise cancellation, 30-hour battery
                life, and comfortable over-ear design.
              </p>

              {/* Color Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Color</h3>
                <div className="flex space-x-3">
                  {colors.map((color) =>
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 transition-colors ${selectedColor === color ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-300 hover:border-gray-400'}`}>
                    
                      {color}
                    </button>
                  )}
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Size</h3>
                <div className="flex space-x-3">
                  {sizes.map((size) =>
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-lg border-2 transition-colors ${selectedSize === size ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-300 hover:border-gray-400'}`}>
                    
                      {size}
                    </button>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                  In Stock (47 available)
                </span>
              </div>

              {/* Quantity Selector */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                    
                    -
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                    
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-8">
                <button className="flex-1 bg-indigo-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-600 transition-colors flex items-center justify-center space-x-2">
                  <ShoppingCartIcon className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>
                <button className="px-6 py-3 border-2 border-indigo-500 text-indigo-500 rounded-xl font-semibold hover:bg-indigo-50 transition-colors">
                  <HeartIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <TruckIcon className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Free Shipping</p>
                </div>
                <div className="text-center">
                  <ShieldCheckIcon className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">2 Year Warranty</p>
                </div>
                <div className="text-center">
                  <RotateCcwIcon className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">30 Day Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              {['description', 'specifications', 'reviews'].map((tab) =>
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-semibold capitalize transition-colors ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}>
                
                  {tab}
                </button>
              )}
            </div>
          </div>

          {activeTab === 'description' &&
          <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                Immerse yourself in superior sound quality with our Premium
                Wireless Bluetooth Headphones. Engineered for audiophiles and
                casual listeners alike, these headphones deliver crystal-clear
                audio across all frequencies.
              </p>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Key Features:
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Active Noise Cancellation (ANC) technology</li>
                <li>30-hour battery life with quick charge support</li>
                <li>Premium memory foam ear cushions</li>
                <li>Bluetooth 5.0 with multi-device pairing</li>
                <li>Built-in microphone for hands-free calls</li>
                <li>Foldable design with premium carrying case</li>
              </ul>
            </div>
          }

          {activeTab === 'specifications' &&
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-900">Brand</span>
                  <span className="text-gray-600">AudioPro</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-900">Model</span>
                  <span className="text-gray-600">AP-WH1000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-900">
                    Connectivity
                  </span>
                  <span className="text-gray-600">Bluetooth 5.0</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-900">
                    Battery Life
                  </span>
                  <span className="text-gray-600">30 hours</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-900">Weight</span>
                  <span className="text-gray-600">250g</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-900">Driver Size</span>
                  <span className="text-gray-600">40mm</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-900">
                    Frequency Response
                  </span>
                  <span className="text-gray-600">20Hz - 20kHz</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="font-medium text-gray-900">Warranty</span>
                  <span className="text-gray-600">2 Years</span>
                </div>
              </div>
            </div>
          }

          {activeTab === 'reviews' &&
          <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-4 mb-2">
                    <span className="text-4xl font-bold text-gray-900">
                      4.5
                    </span>
                    <div>
                      <StarRating rating={4.5} size="lg" />
                      <p className="text-sm text-gray-600 mt-1">
                        Based on 234 reviews
                      </p>
                    </div>
                  </div>
                </div>
                <button className="bg-indigo-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-indigo-600 transition-colors">
                  Write a Review
                </button>
              </div>

              <div className="space-y-6">
                {reviews.map((review) =>
              <div
                key={review.id}
                className="border-b border-gray-200 pb-6 last:border-0">
                
                    <div className="flex items-start space-x-4">
                      <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-12 h-12 rounded-full" />
                  
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {review.date}
                            </p>
                          </div>
                          <StarRating rating={review.rating} />
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) =>
            <ProductCard key={product.id} {...product} />
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>);

}