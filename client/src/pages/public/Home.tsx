import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  CameraIcon,
  CarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DumbbellIcon,
  GiftIcon,
  HardDriveIcon,
  HomeIcon,
  LaptopIcon,
  MonitorIcon,
  PackageIcon,
  PrinterIcon,
  RefreshCcwIcon,
  ShieldCheckIcon,
  ShirtIcon,
  SmartphoneIcon,
  SparklesIcon,
  ToyBrickIcon,
  TruckIcon,
  WifiIcon,
} from 'lucide-react';
import { Footer } from '../../components/Footer';
import { Navbar } from '../../components/Navbar';
import { ProductCard } from '../../components/ProductCard';

const CATEGORY_STYLES = [
  { icon: LaptopIcon, color: 'bg-blue-50 text-blue-600' },
  { icon: MonitorIcon, color: 'bg-cyan-50 text-cyan-600' },
  { icon: CameraIcon, color: 'bg-rose-50 text-rose-600' },
  { icon: SmartphoneIcon, color: 'bg-indigo-50 text-indigo-600' },
  { icon: PrinterIcon, color: 'bg-amber-50 text-amber-600' },
  { icon: HardDriveIcon, color: 'bg-emerald-50 text-emerald-600' },
  { icon: WifiIcon, color: 'bg-violet-50 text-violet-600' },
  { icon: ShirtIcon, color: 'bg-pink-50 text-pink-600' },
  { icon: HomeIcon, color: 'bg-green-50 text-green-600' },
  { icon: DumbbellIcon, color: 'bg-orange-50 text-orange-600' },
  { icon: BookOpenIcon, color: 'bg-purple-50 text-purple-600' },
  { icon: ToyBrickIcon, color: 'bg-yellow-50 text-yellow-600' },
  { icon: SparklesIcon, color: 'bg-fuchsia-50 text-fuchsia-600' },
  { icon: CarIcon, color: 'bg-sky-50 text-sky-600' },
];

const quickBenefits = [
  { icon: ShieldCheckIcon, label: 'Cam kết chính hãng' },
  { icon: GiftIcon, label: 'Quà tặng miễn phí' },
  { icon: RefreshCcwIcon, label: 'Giá rẻ ngày trở lại' },
  { icon: TruckIcon, label: 'Mua online dễ dàng' },
];

export function Home() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [pinnedCoupon, setPinnedCoupon] = useState<any>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/coupons/pinned`)
      .then((res) => res.json())
      .then((data) => setPinnedCoupon(data))
      .catch(console.error);

    fetch(`${import.meta.env.VITE_API_URL}/api/products?status=active`)
      .then((res) => res.json())
      .then((data) => {
        setFeaturedProducts(data.slice(0, 4));
        setBestSellingProducts(
          [...data]
            .sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0))
            .slice(0, 4)
        );
      })
      .catch(console.error);

    fetch(`${import.meta.env.VITE_API_URL}/api/cms/banners`)
      .then((res) => res.json())
      .then((data) => {
        const activeBanners = data.filter((b: any) => b.status === 'active');
        setHeroSlides(activeBanners.filter((b: any) => !b.type || b.type === 'hero'));
      })
      .catch(console.error);

    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error);
  }, []);

  const categoryMenu = useMemo(() => categories.slice(0, 11), [categories]);
  const sidePromos = useMemo(() => {
    const promos = heroSlides.slice(1, 3);
    return promos.length > 0 ? promos : heroSlides.slice(0, 2);
  }, [heroSlides]);

  // Tự động chuyển slide mỗi 4 giây
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  const nextSlide = () => {
    if (heroSlides.length === 0) return;
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    if (heroSlides.length === 0) return;
    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />

      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-12 lg:px-8">
          {/* Categories Sidebar */}
          <aside className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md lg:col-span-3">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-4 py-3.5">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-indigo-50 text-indigo-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
              </span>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Danh mục sản phẩm</h2>
            </div>
            <div className="max-h-[326px] divide-y divide-slate-100/60 overflow-y-auto">
              {categoryMenu.length > 0 ? (
                categoryMenu.map((category, index) => {
                  const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
                  const Icon = style.icon;

                  return (
                    <Link
                      key={category._id}
                      to={`/products?category=${category._id}`}
                      className="group flex min-h-10 items-center gap-3 border-l-0 border-l-transparent px-4 py-3 text-sm font-medium text-slate-600 transition-all duration-300 hover:border-l-4 hover:border-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50/40 hover:to-transparent hover:pl-6 hover:text-indigo-600"
                    >
                      {category.image ? (
                        <span className="h-6 w-6 shrink-0 overflow-hidden rounded-md bg-slate-50 ring-1 ring-slate-100 transition-transform duration-300 group-hover:scale-105">
                          <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                        </span>
                      ) : (
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${style.color} transition-transform duration-300 group-hover:scale-105`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate">{category.name}</span>
                      <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                    </Link>
                  );
                })
              ) : (
                <div className="space-y-2.5 p-4">
                  {[...Array(8)].map((_, index) => (
                    <div key={index} className="h-8 rounded-md bg-slate-50 animate-pulse" />
                  ))}
                </div>
              )}
            </div>
          </aside>

          {/* Main Hero Slider */}
          <div className="lg:col-span-6">
            <div className="group/slider relative h-[260px] overflow-hidden rounded-xl bg-slate-950 shadow-sm transition-all duration-300 hover:shadow-md sm:h-[330px]">
              {heroSlides.length > 0 ? (
                heroSlides.map((slide, index) => (
                  <Link
                    key={slide._id}
                    to={slide.link || '/products'}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === activeSlide ? 'pointer-events-auto scale-100 opacity-100' : 'pointer-events-none scale-105 opacity-0'}`}
                  >
                    <img src={slide.image} alt={slide.title} className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-[8000ms] ease-out group-hover/slider:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent sm:from-slate-950/70" />
                    <div className="absolute left-8 top-1/2 z-10 flex max-w-[280px] -translate-y-1/2 flex-col items-start text-left text-white sm:left-12 sm:max-w-[360px]">
                      <span className="mb-2.5 inline-flex items-center rounded-full bg-indigo-500/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-300 backdrop-blur-sm ring-1 ring-indigo-400/20">
                        {slide.subtitle ? '🔥 KTech Ưu Đãi' : '✨ Mới Nhất'}
                      </span>
                      <h1 className="text-2xl font-extrabold leading-tight text-white drop-shadow-md sm:text-3.5xl lg:text-4xl">{slide.title}</h1>
                      {slide.subtitle && <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-200 drop-shadow">{slide.subtitle}</p>}
                      <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/35 transition-all duration-300 hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                        {slide.cta || 'Mua ngay'}
                        <ChevronRightIcon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-900 text-sm font-medium text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    <span>Đang tải banner...</span>
                  </div>
                </div>
              )}

              {heroSlides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/40 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-indigo-600 hover:border-transparent group-hover/slider:opacity-100"
                    aria-label="Banner trước"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/40 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-indigo-600 hover:border-transparent group-hover/slider:opacity-100"
                    aria-label="Banner sau"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </>
              )}

              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${index === activeSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'}`}
                    aria-label={`Chuyển đến banner ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Quick Benefits */}
            <div className="mt-4 grid overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm sm:grid-cols-4">
              {quickBenefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <div key={benefit.label} className="group/benefit flex min-h-14 items-center justify-center gap-2.5 border-b border-slate-100 px-3 py-3 text-center text-xs font-bold text-slate-700 transition-all duration-300 hover:bg-slate-50 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-all duration-300 group-hover/benefit:bg-indigo-600 group-hover/benefit:text-white">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="line-clamp-2">{benefit.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Banner promos */}
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
            {sidePromos.length > 0 ? (
              sidePromos.map((promo, index) => (
                <Link
                  key={`${promo._id}-${index}`}
                  to={promo.link || '/products'}
                  className="group relative h-[158px] overflow-hidden rounded-xl bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-md sm:h-[158px]"
                >
                  <img src={promo.image} alt={promo.title} className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <span className="inline-flex rounded bg-indigo-600/85 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-indigo-100 backdrop-blur-sm">
                      {index === 0 ? 'Laptop gaming' : 'Trả góp 0%'}
                    </span>
                    <h3 className="mt-1.5 line-clamp-2 text-sm font-extrabold leading-snug text-white group-hover:text-indigo-200 transition-colors">{promo.title}</h3>
                  </div>
                </Link>
              ))
            ) : (
              <>
                <Link to="/products" className="group flex h-[158px] flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-900 p-4 text-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-[158px]">
                  <PackageIcon className="mb-4 h-8 w-8 text-indigo-200 transition-transform duration-300 group-hover:-translate-y-1" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Laptop gaming</p>
                  <h3 className="text-base font-extrabold leading-snug">Ưu đãi mỗi ngày</h3>
                </Link>
                <Link to="/products" className="group flex h-[158px] flex-col justify-end overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-900 p-4 text-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-[158px]">
                  <GiftIcon className="mb-4 h-8 w-8 text-fuchsia-200 transition-transform duration-300 group-hover:-translate-y-1" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-300">Trả góp 0%</p>
                  <h3 className="text-base font-extrabold leading-snug">Mua sắm dễ dàng</h3>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Sản phẩm nổi bật</h2>
          <Link to="/products" className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                name={product.name}
                price={product.price}
                oldPrice={product.compareAtPrice}
                rating={product.rating ?? 5}
                reviewCount={product.reviewCount ?? 0}
                image={product.images?.[0] || 'https://via.placeholder.com/500'}
                badge={product.compareAtPrice > product.price ? 'Sale' : undefined}
                inStock={Number(product.totalVariantStock ?? product.stock ?? 0) > 0}
              />
            ))
          ) : (
            <div className="col-span-full rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
              Đang tải sản phẩm...
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Sản phẩm bán chạy</h2>
          <Link to="/products" className="text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-700">
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bestSellingProducts.length > 0 ? (
            bestSellingProducts.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                name={product.name}
                price={product.price}
                oldPrice={product.compareAtPrice}
                rating={product.rating ?? 5}
                reviewCount={product.reviewCount ?? product.sales ?? 0}
                image={product.images?.[0] || 'https://via.placeholder.com/500'}
                badge={Number(product.sales || 0) > 0 ? `Đã bán ${product.sales}` : undefined}
                inStock={Number(product.totalVariantStock ?? product.stock ?? 0) > 0}
              />
            ))
          ) : (
            <div className="col-span-full rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-medium text-slate-500">
              Đang tải sản phẩm...
            </div>
          )}
        </div>
      </section>

      {pinnedCoupon && (
        <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-6 py-8 text-center text-white shadow-sm sm:px-10">
            <h2 className="text-2xl font-bold sm:text-3xl">Ưu đãi đặc biệt!</h2>
            <p className="mt-2 text-sm font-medium text-indigo-50 sm:text-base">
              {pinnedCoupon.type === 'percentage' && `Giảm ${pinnedCoupon.value}% cho đơn hàng tiếp theo với mã: `}
              {pinnedCoupon.type === 'fixed' && `Giảm ${pinnedCoupon.value.toLocaleString('vi-VN')}đ cho đơn hàng tiếp theo với mã: `}
              {pinnedCoupon.type === 'shipping' && `Miễn phí vận chuyển cho đơn hàng tiếp theo với mã: `}
              <span className="font-bold underline decoration-white/70 font-mono">
                {pinnedCoupon.code}
              </span>
              {pinnedCoupon.minOrder > 0 && ` (Đơn tối thiểu ${pinnedCoupon.minOrder.toLocaleString('vi-VN')}đ)`}
            </p>
            <Link
              to="/products"
              className="mt-5 inline-flex rounded-md bg-white px-6 py-2.5 text-sm font-bold text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              Mua sắm ngay
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
