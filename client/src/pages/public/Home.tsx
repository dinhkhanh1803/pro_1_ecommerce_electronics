import React, { useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ProductCard } from '../../components/ProductCard';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SmartphoneIcon,
  ShirtIcon,
  HomeIcon,
  DumbbellIcon,
  BookOpenIcon,
  ToyBrickIcon,
  SparklesIcon,
  CarIcon } from
'lucide-react';
export function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSlides = [
  {
    title: 'Summer Sale 2026',
    subtitle: 'Up to 70% off on selected items',
    cta: 'Shop Now',
    gradient: 'from-indigo-600 to-purple-600'
  },
  {
    title: 'New Arrivals',
    subtitle: 'Discover the latest trends',
    cta: 'Explore',
    gradient: 'from-pink-600 to-rose-600'
  },
  {
    title: 'Free Shipping',
    subtitle: 'On orders over $50',
    cta: 'Learn More',
    gradient: 'from-blue-600 to-cyan-600'
  }];

  const featuredProducts = [
  {
    id: '1',
    name: 'Wireless Bluetooth Headphones',
    price: 79.99,
    oldPrice: 129.99,
    rating: 4.5,
    reviewCount: 234,
    image:
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    badge: 'Sale'
  },
  {
    id: '2',
    name: 'Smart Watch Series 5',
    price: 299.99,
    rating: 4.8,
    reviewCount: 567,
    image:
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    badge: 'New'
  },
  {
    id: '3',
    name: 'Premium Leather Backpack',
    price: 89.99,
    oldPrice: 149.99,
    rating: 4.6,
    reviewCount: 189,
    image:
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop'
  },
  {
    id: '4',
    name: 'Portable Bluetooth Speaker',
    price: 49.99,
    rating: 4.4,
    reviewCount: 423,
    image:
    'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop'
  },
  {
    id: '5',
    name: 'Minimalist Desk Lamp',
    price: 34.99,
    rating: 4.7,
    reviewCount: 156,
    image:
    'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop'
  },
  {
    id: '6',
    name: 'Ergonomic Office Chair',
    price: 199.99,
    oldPrice: 299.99,
    rating: 4.9,
    reviewCount: 891,
    image:
    'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=500&h=500&fit=crop',
    badge: 'Sale'
  },
  {
    id: '7',
    name: 'Stainless Steel Water Bottle',
    price: 24.99,
    rating: 4.5,
    reviewCount: 312,
    image:
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop'
  },
  {
    id: '8',
    name: 'Wireless Charging Pad',
    price: 29.99,
    rating: 4.3,
    reviewCount: 267,
    image:
    'https://images.unsplash.com/photo-1591290619762-c588f0e8e0f7?w=500&h=500&fit=crop'
  }];

  const categories = [
  {
    name: 'Electronics',
    icon: SmartphoneIcon,
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    name: 'Fashion',
    icon: ShirtIcon,
    color: 'bg-pink-100 text-pink-600'
  },
  {
    name: 'Home & Garden',
    icon: HomeIcon,
    color: 'bg-green-100 text-green-600'
  },
  {
    name: 'Sports',
    icon: DumbbellIcon,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    name: 'Books',
    icon: BookOpenIcon,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    name: 'Toys',
    icon: ToyBrickIcon,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    name: 'Beauty',
    icon: SparklesIcon,
    color: 'bg-rose-100 text-rose-600'
  },
  {
    name: 'Automotive',
    icon: CarIcon,
    color: 'bg-blue-100 text-blue-600'
  }];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };
  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Banner Slider */}
      <div className="relative h-96 overflow-hidden">
        {heroSlides.map((slide, index) =>
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}>
          
            <div
            className={`h-full bg-gradient-to-r ${slide.gradient} flex items-center justify-center text-white`}>
            
              <div className="text-center px-4">
                <h1 className="text-5xl font-bold mb-4">{slide.title}</h1>
                <p className="text-xl mb-8">{slide.subtitle}</p>
                <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                  {slide.cta}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors">
          
          <ChevronLeftIcon className="h-6 w-6 text-gray-900" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-colors">
          
          <ChevronRightIcon className="h-6 w-6 text-gray-900" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) =>
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === activeSlide ? 'bg-white w-8' : 'bg-white/50'}`} />

          )}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Featured Products
          </h2>
          <a
            href="/products"
            className="text-indigo-600 hover:text-indigo-700 font-medium">
            
            View All →
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) =>
          <ProductCard key={product.id} {...product} />
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a
                key={category.name}
                href={`/products?category=${category.name}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                
                <div
                  className={`w-16 h-16 ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
              </a>);

          })}
        </div>
      </div>

      {/* Promotion Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Special Offer!</h2>
          <p className="text-xl mb-6">
            Get 20% off your first order with code: WELCOME20
          </p>
          <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Start Shopping
          </button>
        </div>
      </div>

      <Footer />
    </div>);

}