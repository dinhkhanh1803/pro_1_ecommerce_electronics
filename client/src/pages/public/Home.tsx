import { useEffect, useMemo, useState } from 'react';
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
import { useToast } from '../../context/ToastContext';

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

const DEFAULT_PROMOS = [
  {
    _id: 'default-promo-1',
    title: 'Thế giới Gaming cực đỉnh - Giảm đến 30%',
    subtitle: 'Laptop gaming',
    badge: 'Laptop gaming',
    image: '',
    link: '/products',
    icon: LaptopIcon,
    bgGradient: 'from-slate-800 to-slate-950',
    iconColor: 'text-rose-500',
  },
  {
    _id: 'default-promo-2',
    title: 'Trả góp 0% lãi suất - Sở hữu siêu phẩm',
    subtitle: 'Trả góp 0%',
    badge: 'Trả góp 0%',
    image: '',
    link: '/products',
    icon: GiftIcon,
    bgGradient: 'from-rose-500 to-rose-700',
    iconColor: 'text-rose-200',
  },
];

export function Home() {
  const { showToast } = useToast();
  const [activeSlide, setActiveSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [heroSlides, setHeroSlides] = useState<any[]>([]);
  const [pinnedCoupon, setPinnedCoupon] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

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

  useEffect(() => {
    if (!pinnedCoupon?.endDate) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(pinnedCoupon.endDate) - +new Date();
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [pinnedCoupon]);

  const categoryMenu = useMemo(() => categories.slice(0, 11), [categories]);
  const activePromos = useMemo(() => {
    const promos = heroSlides.slice(1, 3);
    const filledPromos = [...promos];
    for (let i = promos.length; i < 2; i++) {
      filledPromos.push(DEFAULT_PROMOS[i]);
    }
    return filledPromos;
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
          <aside className="self-start overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md lg:col-span-3">
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-4 text-white">
              <span className="flex h-5.5 w-5.5 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layout-grid"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
              </span>
              <h2 className="text-xs font-black uppercase tracking-wider">Danh mục sản phẩm</h2>
            </div>
            <div className="p-2.5 space-y-1.5 bg-white">
              {categoryMenu.length > 0 ? (
                categoryMenu.map((category, index) => {
                  const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
                  const Icon = style.icon;

                  return (
                    <Link
                      key={category._id}
                      to={`/products?category=${category._id}`}
                      className="group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-gradient-to-r hover:from-rose-50/70 hover:to-transparent hover:translate-x-1"
                    >
                      {/* Left accent indicator */}
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-0 bg-rose-600 rounded-r-md transition-all duration-300 group-hover:h-3/5" />

                      {category.image ? (
                        <span className="h-8 w-8 shrink-0 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100 transition-all duration-300 group-hover:scale-110 group-hover:ring-rose-200">
                          <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
                        </span>
                      ) : (
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.color} transition-all duration-300 group-hover:scale-110 group-hover:shadow-sm`}>
                          <Icon className="h-4.5 w-4.5" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate transition-colors duration-200 group-hover:text-rose-700">{category.name}</span>
                      <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-rose-600" />
                    </Link>
                  );
                })
              ) : (
                <div className="space-y-2.5 p-1.5">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="h-10 rounded-xl bg-slate-50 animate-pulse" />
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
                      <span className="mb-2.5 inline-flex items-center rounded-full bg-rose-500/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-300 backdrop-blur-sm ring-1 ring-rose-400/20">
                        {slide.subtitle ? '🔥 KTech Ưu Đãi' : '✨ Mới Nhất'}
                      </span>
                      <h1 className="text-2xl font-extrabold leading-tight text-white drop-shadow-md sm:text-3.5xl lg:text-4xl">{slide.title}</h1>
                      {slide.subtitle && <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-200 drop-shadow">{slide.subtitle}</p>}
                      <span className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-600/35 transition-all duration-300 hover:bg-rose-500 hover:shadow-rose-500/40 hover:-translate-y-0.5">
                        {slide.cta || 'Mua ngay'}
                        <ChevronRightIcon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex h-full items-center justify-center bg-slate-900 text-sm font-medium text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                    <span>Đang tải banner...</span>
                  </div>
                </div>
              )}

              {heroSlides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/40 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-rose-600 hover:border-transparent group-hover/slider:opacity-100"
                    aria-label="Banner trước"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-slate-900/40 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-rose-600 hover:border-transparent group-hover/slider:opacity-100"
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
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition-all duration-300 group-hover/benefit:bg-rose-600 group-hover/benefit:text-white">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="line-clamp-2">{benefit.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Banner promos */}
          <div className="self-start grid gap-4 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
            {activePromos.map((promo, index) => {
              const hasImage = !!promo.image;
              const title = promo.title;
              const link = promo.link || '/products';

              if (hasImage) {
                return (
                  <Link
                    key={promo._id}
                    to={link}
                    className="group relative h-[158px] overflow-hidden rounded-xl bg-slate-900 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-end p-4 text-white sm:h-[158px]"
                  >
                    <img
                      src={promo.image}
                      alt={title}
                      className="absolute inset-0 h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                    
                    <div className="relative z-10">
                      <span className="inline-flex rounded bg-rose-600/90 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white backdrop-blur-sm">
                        {promo.subtitle || (index === 0 ? 'Laptop gaming' : 'Trả góp 0%')}
                      </span>
                      <h3 className="mt-1.5 line-clamp-2 text-xs font-extrabold leading-snug text-white group-hover:text-rose-200 transition-colors">
                        {title}
                      </h3>
                    </div>
                  </Link>
                );
              } else {
                const Icon = promo.icon;
                return (
                  <Link
                    key={promo._id}
                    to={link}
                    className={`group relative h-[158px] overflow-hidden rounded-xl bg-gradient-to-br ${promo.bgGradient} p-4 text-white shadow-sm transition-all duration-300 hover:shadow-md flex flex-col justify-end sm:h-[158px]`}
                  >
                    {/* Decorative overlay glow */}
                    <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-white/10 blur-lg pointer-events-none" />
                    
                    {/* Icon absolute on top-right */}
                    {Icon && (
                      <Icon className={`absolute right-4 top-4 h-12 w-12 ${promo.iconColor} opacity-20 transition-all duration-500 group-hover:scale-110 group-hover:-translate-y-1 group-hover:rotate-6`} />
                    )}
                    
                    <div className="relative z-10">
                      <span className="inline-flex rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white backdrop-blur-sm">
                        {promo.badge}
                      </span>
                      <h3 className="mt-1.5 line-clamp-2 text-xs font-extrabold leading-snug text-white group-hover:text-rose-200 transition-colors">
                        {title}
                      </h3>
                    </div>
                  </Link>
                );
              }
            })}
          </div>
        </div>
      </section>

      {pinnedCoupon && (
        <section className="mx-auto max-w-7xl px-4 pt-6 pb-2 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 shadow-xl shadow-rose-100/50 transition-all duration-300 hover:shadow-rose-200/60">
            {/* Background design elements */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/5 blur-xl" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/5 blur-xl" />
            
            <div className="flex flex-col md:flex-row md:items-stretch">
              {/* Left Column: Big Voucher Badge */}
              <div className="relative flex flex-col items-center justify-center bg-slate-950/20 px-8 py-8 text-center md:w-1/4 md:border-r-2 md:border-dashed md:border-white/20">
                {/* Semi-circle cutouts for ticket style (hidden on mobile, visible on desktop) */}
                <div className="absolute -top-3 -right-3 hidden h-6 w-6 rounded-full bg-slate-50 md:block" />
                <div className="absolute -bottom-3 -right-3 hidden h-6 w-6 rounded-full bg-slate-50 md:block" />
                
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-100">ƯU ĐÃI ĐỘC QUYỀN</span>
                <p className="mt-1.5 text-4xl font-black text-white sm:text-5xl">
                  {pinnedCoupon.type === 'percentage' && `${pinnedCoupon.value}%`}
                  {pinnedCoupon.type === 'fixed' && `${(pinnedCoupon.value / 1000).toLocaleString('vi-VN')}K`}
                  {pinnedCoupon.type === 'shipping' && 'FREE'}
                </p>
                <p className="mt-1 text-xs font-semibold text-rose-50/90 uppercase tracking-wide">
                  {pinnedCoupon.type === 'shipping' ? 'Vận chuyển' : 'Giảm giá trực tiếp'}
                </p>
              </div>

              {/* Right Column: Code and Details */}
              <div className="flex flex-1 flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 text-white gap-6">
                {/* Left side inside details: Info & Action */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-extrabold sm:text-2xl">Mã giảm giá đặc biệt dành cho bạn</h3>
                    <p className="text-sm text-rose-50/90 leading-relaxed max-w-xl">
                      {pinnedCoupon.type === 'percentage' && `Nhập mã bên dưới để được giảm ngay ${pinnedCoupon.value}% tổng giá trị đơn hàng.`}
                      {pinnedCoupon.type === 'fixed' && `Nhập mã bên dưới để được giảm ngay ${pinnedCoupon.value.toLocaleString('vi-VN')}đ.`}
                      {pinnedCoupon.type === 'shipping' && `Nhập mã bên dưới để được miễn phí vận chuyển cho đơn hàng của bạn.`}
                      {pinnedCoupon.minOrder > 0 && ` Áp dụng cho đơn hàng tối thiểu từ ${pinnedCoupon.minOrder.toLocaleString('vi-VN')}đ.`}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    {/* Code Card */}
                    <div className="group relative flex items-center overflow-hidden rounded-xl border border-white/20 bg-white/10 p-1 pl-4 pr-3 backdrop-blur-sm">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-200 mr-3">Mã:</span>
                      <span className="font-mono text-base font-black tracking-wider text-white select-all">
                        {pinnedCoupon.code}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pinnedCoupon.code);
                          showToast('Đã sao chép mã giảm giá thành công!', 'success');
                        }}
                        className="ml-4 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition-all hover:bg-rose-50 active:scale-95"
                      >
                        Sao chép
                      </button>
                    </div>

                    <Link
                      to="/products"
                      className="inline-flex h-11 items-center gap-1.5 rounded-xl bg-white px-6 text-sm font-extrabold text-rose-600 shadow-lg shadow-rose-950/20 transition-all duration-300 hover:bg-rose-50 hover:shadow-rose-950/30 hover:-translate-y-0.5"
                    >
                      Sử dụng ngay
                      <ChevronRightIcon className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Right side inside details: Countdown Timer */}
                {timeLeft && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) && (
                  <div className="flex flex-col items-center justify-center shrink-0 bg-black/10 rounded-2xl p-5 border border-white/5 backdrop-blur-sm w-full md:w-[220px] self-stretch md:self-center">
                    <span className="text-[10px] font-black text-rose-100 uppercase tracking-widest flex items-center gap-1.5 mb-3.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                      </span>
                      Hạn dùng còn lại
                    </span>
                    
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      {timeLeft.days > 0 && (
                        <div className="flex flex-col items-center gap-1">
                          <span className="rounded bg-white/20 px-2.5 py-1 text-center min-w-[28px]">{timeLeft.days}</span>
                          <span className="text-[8px] text-rose-200 font-bold uppercase tracking-wider">ngày</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col items-center gap-1">
                        <span className="rounded bg-white/20 px-2.5 py-1 text-center min-w-[28px]">
                          {String(timeLeft.hours).padStart(2, '0')}
                        </span>
                        <span className="text-[8px] text-rose-200 font-bold uppercase tracking-wider">giờ</span>
                      </div>
                      
                      <span className="text-rose-200/80 mb-3.5 font-bold">:</span>
                      
                      <div className="flex flex-col items-center gap-1">
                        <span className="rounded bg-white/20 px-2.5 py-1 text-center min-w-[28px]">
                          {String(timeLeft.minutes).padStart(2, '0')}
                        </span>
                        <span className="text-[8px] text-rose-200 font-bold uppercase tracking-wider">phút</span>
                      </div>
                      
                      <span className="text-rose-200/80 mb-3.5 font-bold">:</span>
                      
                      <div className="flex flex-col items-center gap-1">
                        <span className="rounded bg-white/20 px-2.5 py-1 text-center min-w-[28px]">
                          {String(timeLeft.seconds).padStart(2, '0')}
                        </span>
                        <span className="text-[8px] text-rose-200 font-bold uppercase tracking-wider">giây</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-amber-50 text-amber-500 text-xs font-bold">
                <span className="animate-pulse">✨</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">Tuyển chọn tốt nhất</span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-rose-900 bg-clip-text">
              Sản phẩm nổi bật
            </h2>
          </div>
          <Link to="/products" className="group inline-flex items-center gap-1 text-sm font-extrabold text-rose-600 transition-all hover:text-rose-700">
            Xem tất cả <span className="transition-transform group-hover:translate-x-1">→</span>
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
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-red-50 text-red-500 text-xs font-bold">
                <span className="animate-bounce">🔥</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600">Xu hướng mua sắm</span>
            </div>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-rose-900 bg-clip-text">
              Sản phẩm bán chạy
            </h2>
          </div>
          <Link to="/products" className="group inline-flex items-center gap-1 text-sm font-extrabold text-rose-600 transition-all hover:text-rose-700">
            Xem tất cả <span className="transition-transform group-hover:translate-x-1">→</span>
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

      <Footer />
    </div>
  );
}
