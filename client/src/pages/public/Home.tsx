import React, { useState, useEffect } from 'react';
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
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/products?status=active')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data.slice(0, 8)))
      .catch(console.error);

    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

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

  const CATEGORY_STYLES = [
    { icon: SmartphoneIcon, color: 'bg-indigo-100 text-indigo-600' },
    { icon: ShirtIcon, color: 'bg-pink-100 text-pink-600' },
    { icon: HomeIcon, color: 'bg-green-100 text-green-600' },
    { icon: DumbbellIcon, color: 'bg-orange-100 text-orange-600' },
    { icon: BookOpenIcon, color: 'bg-purple-100 text-purple-600' },
    { icon: ToyBrickIcon, color: 'bg-yellow-100 text-yellow-600' },
    { icon: SparklesIcon, color: 'bg-rose-100 text-rose-600' },
    { icon: CarIcon, color: 'bg-blue-100 text-blue-600' }
  ];

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
          {featuredProducts.length > 0 ? (
            featuredProducts.map((p) => (
              <ProductCard
                key={p._id}
                id={p._id}
                name={p.name}
                price={p.price}
                oldPrice={p.compareAtPrice}
                rating={4.8}
                reviewCount={p.sales || 0}
                image={p.images?.[0] || 'https://via.placeholder.com/500'}
                badge={p.compareAtPrice > p.price ? 'Sale' : undefined}
              />
            ))
          ) : (
            <p className="text-gray-500">Loading products...</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.length > 0 ? (
            categories.map((category, index) => {
              const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
              const Icon = style.icon;
              return (
                <a
                  key={category._id}
                  href={`/products?category=${category._id}`}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  
                  <div
                    className={`w-16 h-16 ${style.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </a>
              );
            })
          ) : (
            <p className="text-gray-500">Loading categories...</p>
          )}
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