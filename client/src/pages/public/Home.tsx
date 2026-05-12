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
import { Link } from 'react-router-dom';
export function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [promoMid, setPromoMid] = useState<any>(null);
  const [promoBottom, setPromoBottom] = useState<any>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/products?status=active`)
      .then(res => res.json())
      .then(data => setFeaturedProducts(data.slice(0, 8)))
      .catch(console.error);

    fetch(`${import.meta.env.VITE_API_URL}/api/cms/banners`)
      .then(res => res.json())
      .then(data => {
        const activeBanners = data.filter((b: any) => b.status === 'active');
        setHeroSlides(activeBanners.filter((b: any) => b.type === 'hero'));
        setPromoMid(activeBanners.find((b: any) => b.type === 'promo_mid'));
        setPromoBottom(activeBanners.find((b: any) => b.type === 'promo_bottom'));
      })
      .catch(console.error);

    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

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
    if (heroSlides.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };
  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Banner Slider */}
      <div className="relative h-96 overflow-hidden">
        {heroSlides.length > 0 ? heroSlides.map((slide, index) =>
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-500 ${index === activeSlide ? 'opacity-100' : 'opacity-0'}`}>
          
            <div className="h-full relative flex items-center justify-center text-white">
                <img src={slide.image} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40" />
              <div className="text-center px-4 relative z-10">
                <h1 className="text-5xl font-bold mb-4 animate-in slide-in-from-bottom-4 duration-700">{slide.title}</h1>
                <p className="text-xl mb-8 animate-in slide-in-from-bottom-2 duration-700 delay-100">{slide.subtitle}</p>
                <a href={slide.link} className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg">
                  {slide.cta || 'Shop Now'}
                </a>
              </div>
            </div>
          </div>
        ) : (
            <div className="h-full bg-slate-200 animate-pulse flex items-center justify-center text-gray-400">
            Đang tải banner...
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
            Sản phẩm nổi bật
          </h2>
          <a
            href="/products"
            className="text-indigo-600 hover:text-indigo-700 font-medium">
            
            Xem tất cả →
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
                  inStock={Number(p.totalVariantStock ?? p.stock ?? 0) > 0}
                />
            ))
          ) : (
            <p className="text-gray-500">Đang tải sản phẩm...</p>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          Mua sắm theo danh mục
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
                  className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all group overflow-hidden relative">
                  
                  {category.image ? (
                    <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden shadow-sm">
                       <img src={category.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div
                      className={`w-16 h-16 ${style.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="h-8 w-8" />
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600">{category.name}</h3>
                </a>
              );
            })
          ) : (
            <p className="text-gray-500">Đang tải danh mục...</p>
          )}
        </div>
      </div>

      {promoMid && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="relative rounded-2xl overflow-hidden h-64 flex items-center justify-center text-white group cursor-pointer shadow-xl">
             <img src={promoMid.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
             <div className="absolute inset-0 bg-indigo-600/60" />
             <div className="relative text-center px-12">
                <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">{promoMid.title}</h2>
                <p className="text-xl mb-6 font-medium opacity-90">{promoMid.subtitle}</p>
                <a href={promoMid.link} className="bg-white text-indigo-600 px-10 py-3 rounded-xl font-black hover:bg-gray-100 transition-colors inline-block">
                  {promoMid.cta}
                </a>
             </div>
          </div>
        </div>
      )}

      {promoBottom && (
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-gradient-to-r from-gray-900 to-indigo-900 rounded-3xl p-16 text-center relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-white/10" />
               <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-left max-w-xl">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 italic uppercase">{promoBottom.title}</h2>
                    <p className="text-xl text-indigo-100 mb-0 font-medium">{promoBottom.subtitle}</p>
                  </div>
                  <a href={promoBottom.link} className="bg-white text-gray-900 px-12 py-4 rounded-2xl font-black text-lg hover:bg-indigo-50 transition-all hover:scale-105 active:scale-95 shadow-xl shrink-0">
                    {promoBottom.cta}
                  </a>
               </div>
            </div>
         </div>
      )}

      {!promoMid && !promoBottom && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-12 text-center text-white shadow-lg">
            <h2 className="text-4xl font-bold mb-4 italic">Ưu đãi đặc biệt!</h2>
            <p className="text-xl mb-6 font-medium">
              Giảm 20% cho đơn hàng đầu tiên với mã: <span className="underline decoration-wavy">XINCHAO</span>
            </p>
            <Link to="/products">
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
              Mua sắm ngay
            </button>
            </Link>
          
          </div>
        </div>
      )}

      <Footer />
    </div>);

}
