import Category from "../models/Category.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import Setting from "../models/Setting.js";

const SITE_FEATURES = [
  {
    key: "overview",
    title: "Tổng quan website",
    action: "open_products",
    keywords: [
      "web co gi",
      "website co gi",
      "he thong co gi",
      "trang nay co gi",
      "chuc nang",
      "lam duoc gi",
      "su dung website",
      "chatbot lam duoc gi",
      "tro ly lam duoc gi",
    ],
    summary:
      "Website hỗ trợ mua sắm đồ điện tử từ tìm kiếm sản phẩm, lọc theo danh mục/ngân sách, xem chi tiết, giỏ hàng, thanh toán, theo dõi đơn, yêu thích, đánh giá và nhắn tin với nhân viên.",
    quickReplies: ["Có danh mục nào?", "Hướng dẫn đặt hàng", "Có khuyến mãi nào không?", "Gặp nhân viên tư vấn"],
  },
  {
    key: "catalog",
    title: "Tìm kiếm và danh mục sản phẩm",
    action: "open_products",
    keywords: ["san pham", "danh muc", "tim kiem", "loc san pham", "search", "xem hang", "shop ban gi"],
    summary:
      "Khách có thể xem danh mục, tìm kiếm sản phẩm, lọc theo nhu cầu, ngân sách, thương hiệu, hàng còn kho, sản phẩm bán chạy hoặc đang giảm giá.",
    quickReplies: ["Có danh mục nào?", "Sản phẩm bán chạy", "Laptop dưới 20 triệu", "Sản phẩm còn hàng"],
  },
  {
    key: "cart_checkout",
    title: "Giỏ hàng và đặt hàng",
    action: "open_cart",
    keywords: ["gio hang", "dat hang", "mua hang", "checkout", "them vao gio", "hoan tat don", "cach mua"],
    summary:
      "Quy trình mua hàng gồm chọn sản phẩm, chọn biến thể còn hàng, thêm vào giỏ, kiểm tra số lượng/mã giảm giá và sang thanh toán để tạo đơn.",
    quickReplies: ["Mở giỏ hàng", "Hướng dẫn đặt hàng", "Có khuyến mãi nào không?", "Kiểm tra đơn hàng"],
  },
  {
    key: "payment",
    title: "Thanh toán",
    action: "open_checkout",
    keywords: ["thanh toan", "tra tien", "cod", "vnpay", "momo", "chuyen khoan", "payment"],
    summary:
      "Website hỗ trợ các phương thức thanh toán theo cấu hình đơn hàng như COD, VNPay, MoMo hoặc chuyển khoản.",
    quickReplies: ["Mở giỏ hàng", "Có khuyến mãi nào không?", "Hướng dẫn đặt hàng", "Gặp nhân viên tư vấn"],
  },
  {
    key: "shipping",
    title: "Giao hàng",
    action: "open_checkout",
    keywords: ["giao hang", "van chuyen", "ship", "phi ship", "nhan hang", "mien phi ship"],
    summary:
      "Phí ship và thời gian giao dự kiến được kiểm tra ở bước thanh toán theo địa chỉ nhận hàng; khách có thể dùng mã miễn phí vận chuyển nếu shop đang có.",
    quickReplies: ["Có mã miễn phí ship không?", "Mở giỏ hàng", "Kiểm tra đơn hàng", "Gặp nhân viên tư vấn"],
  },
  {
    key: "orders",
    title: "Đơn hàng",
    action: "open_orders",
    keywords: ["don hang", "lich su mua", "trang thai don", "kiem tra don", "huy don", "order"],
    summary:
      "Khách đăng nhập có thể xem lịch sử đơn, trạng thái xử lý, thanh toán và theo dõi các đơn gần nhất.",
    quickReplies: ["Mở lịch sử đơn hàng", "Kiểm tra đơn hàng", "Gặp nhân viên tư vấn", "Tìm sản phẩm khác"],
  },
  {
    key: "account",
    title: "Tài khoản và hồ sơ",
    action: "open_profile",
    keywords: ["tai khoan", "dang nhap", "dang ky", "ho so", "profile", "dia chi", "so dien thoai", "thong tin ca nhan"],
    summary:
      "Khách có thể đăng nhập, đăng ký, cập nhật họ tên, số điện thoại, địa chỉ và dùng thông tin này cho thanh toán/giao hàng.",
    quickReplies: ["Mở hồ sơ", "Cập nhật địa chỉ", "Kiểm tra đơn hàng", "Gặp nhân viên tư vấn"],
  },
  {
    key: "wishlist_reviews",
    title: "Yêu thích và đánh giá",
    action: "open_wishlist",
    keywords: ["yeu thich", "wishlist", "san pham da luu", "danh gia", "review", "nhan xet"],
    summary:
      "Khách có thể lưu sản phẩm yêu thích để xem lại và gửi đánh giá sau khi mua để hỗ trợ shop lẫn người mua khác.",
    quickReplies: ["Mở yêu thích", "Sản phẩm bán chạy", "Tìm sản phẩm khác", "Gặp nhân viên tư vấn"],
  },
  {
    key: "promotions",
    title: "Khuyến mãi và mã giảm giá",
    action: "open_products",
    keywords: ["khuyen mai", "uu dai", "ma giam", "voucher", "coupon", "promo", "giam gia"],
    summary:
      "Mã giảm giá có thể là giảm theo phần trăm, giảm tiền trực tiếp hoặc miễn phí vận chuyển; khách nhập mã ở bước thanh toán.",
    quickReplies: ["Có khuyến mãi nào không?", "Tìm sản phẩm đang giảm giá", "Mở giỏ hàng", "Gặp nhân viên tư vấn"],
  },
  {
    key: "messages_support",
    title: "Tin nhắn và hỗ trợ nhân viên",
    action: "handoff",
    keywords: ["tin nhan", "nhan vien", "tu van vien", "lien he", "ho tro", "gap nguoi", "gap shop"],
    summary:
      "Khi cần tư vấn sâu, chatbot có thể chuyển nội dung hội thoại cho nhân viên để tiếp tục hỗ trợ trong hộp thư.",
    quickReplies: ["Gặp nhân viên tư vấn", "Tìm laptop dưới 20 triệu", "Có khuyến mãi nào không?", "Kiểm tra đơn hàng"],
  },
  {
    key: "admin",
    title: "Khu vực quản trị admin",
    action: null,
    keywords: ["admin", "quan tri", "quan ly nguoi dung", "quan ly danh muc", "quan ly cms", "dashboard"],
    summary:
      "Admin quản lý tổng quan, người dùng, danh mục, sản phẩm, đơn hàng, mã giảm giá, CMS/banner và tin nhắn.",
    quickReplies: ["Website có chức năng gì?", "Quản lý sản phẩm", "Quản lý đơn hàng", "Gặp nhân viên tư vấn"],
  },
  {
    key: "seller",
    title: "Khu vực người bán",
    action: null,
    keywords: ["seller", "nguoi ban", "kenh ban", "don cua shop", "tin nhan seller"],
    summary:
      "Người bán có thể theo dõi đơn hàng và nhắn tin với khách/nhân viên theo quyền được cấp.",
    quickReplies: ["Quản lý đơn hàng", "Tin nhắn hỗ trợ", "Website có chức năng gì?"],
  },
  {
    key: "warehouse_shipper",
    title: "Kho và giao vận",
    action: null,
    keywords: ["kho", "warehouse", "shipper", "giao van", "cod", "nop cod", "ton kho"],
    summary:
      "Kho quản lý sản phẩm/tồn kho/khuyến mãi; shipper theo dõi đơn giao, chi tiết giao hàng, COD và hồ sơ giao vận.",
    quickReplies: ["Kiểm tra đơn hàng", "Giao hàng thế nào?", "Gặp nhân viên tư vấn"],
  },
];

const DEFAULT_SITE_QUICK_REPLIES = [
  "Website có chức năng gì?",
  "Hướng dẫn đặt hàng",
  "Có khuyến mãi nào không?",
  "Gặp nhân viên tư vấn",
];

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const scoreFeature = (normalizedMessage, feature) =>
  feature.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (normalizedMessage.includes(normalizedKeyword)) return score + normalizedKeyword.split(/\s+/).length + 1;
    return score;
  }, 0);

const getRelevantFeatures = (normalizedMessage) =>
  SITE_FEATURES.map((feature) => ({ ...feature, score: scoreFeature(normalizedMessage, feature) }))
    .filter((feature) => feature.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

const isSiteKnowledgeCandidate = (normalizedMessage, features) => {
  if (features.length > 0) return true;
  return /\b(web|website|trang|he thong|chuc nang|huong dan|su dung|o dau|admin|seller|shipper|warehouse|cms|dashboard)\b/.test(
    normalizedMessage,
  );
};

const getActiveCoupons = async () => {
  const now = new Date();
  return Coupon.find({
    status: "active",
    $and: [
      { $or: [{ startDate: { $exists: false } }, { startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }] },
      { $or: [{ usageLimit: null }, { $expr: { $lt: ["$usageCount", "$usageLimit"] } }] },
    ],
  })
    .sort({ showOnHome: -1, createdAt: -1 })
    .limit(5);
};

const getSiteSnapshot = async () => {
  const [setting, categories, activeProductCount, totalProductCount, brands, coupons] = await Promise.all([
    Setting.findOne().lean(),
    Category.find().sort({ name: 1 }).select("name slug").lean(),
    Product.countDocuments({ status: "active" }),
    Product.countDocuments(),
    Product.distinct("brand", { status: "active", brand: { $nin: [null, ""] } }),
    getActiveCoupons(),
  ]);

  return {
    siteName: setting?.siteName || "ShopHub",
    siteDescription: setting?.siteDescription || "Website thương mại điện tử đồ điện tử.",
    supportEmail: setting?.supportEmail || "support@shophub.com",
    currency: setting?.currency || "VND",
    categories: categories.slice(0, 8).map((category) => category.name),
    categoryCount: categories.length,
    activeProductCount,
    totalProductCount,
    brands: brands.filter(Boolean).slice(0, 8),
    coupons: coupons.map((coupon) => ({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      minOrder: coupon.minOrder || 0,
      endDate: coupon.endDate || null,
    })),
  };
};

const describeCoupon = (coupon) => {
  if (coupon.type === "percentage") return `${coupon.code} giảm ${coupon.value}%`;
  if (coupon.type === "fixed") return `${coupon.code} giảm ${formatMoney(coupon.value)}`;
  return `${coupon.code} miễn phí vận chuyển`;
};

const buildSnapshotSentence = (snapshot) => {
  const facts = [];
  if (snapshot.activeProductCount > 0) facts.push(`${snapshot.activeProductCount} sản phẩm đang bán`);
  if (snapshot.categoryCount > 0) facts.push(`${snapshot.categoryCount} danh mục`);
  if (snapshot.brands.length > 0) facts.push(`các thương hiệu như ${snapshot.brands.slice(0, 4).join(", ")}`);
  if (!facts.length) return "";
  return `Hiện mình thấy shop có ${facts.join(", ")}.`;
};

const buildLocalSiteReply = ({ features, snapshot }) => {
  const primary = features[0] || SITE_FEATURES[0];
  const related = features.slice(1, 3).map((feature) => feature.title.toLowerCase());
  const categoryText = snapshot.categories.length ? ` Một vài danh mục hiện có: ${snapshot.categories.slice(0, 5).join(", ")}.` : "";
  const couponText = snapshot.coupons.length
    ? ` Mã/ưu đãi đang có: ${snapshot.coupons.slice(0, 3).map(describeCoupon).join(", ")}.`
    : "";
  const relatedText = related.length ? ` Ngoài ra mình còn có thể hỗ trợ ${related.join(" và ")}.` : "";
  const snapshotText = buildSnapshotSentence(snapshot);

  return [
    `Dạ, với ${snapshot.siteName}, ${primary.summary}`,
    snapshotText,
    categoryText.trim(),
    primary.key === "promotions" || primary.key === "shipping" ? couponText.trim() : "",
    relatedText.trim(),
    "Bạn hỏi theo nhu cầu cụ thể hoặc ngân sách, mình sẽ lọc sản phẩm và gợi ý hướng mua phù hợp hơn.",
  ]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
};

export const getSiteIntelligenceAnswer = async ({ message, normalizedMessage }) => {
  const normalized = normalizedMessage || normalizeText(message);
  const features = getRelevantFeatures(normalized);
  if (!isSiteKnowledgeCandidate(normalized, features)) return null;

  const snapshot = await getSiteSnapshot();
  const primary = features[0] || SITE_FEATURES[0];

  return {
    intent: "site_knowledge_answer",
    action: primary.action || undefined,
    reply: buildLocalSiteReply({ features, snapshot }),
    products: [],
    coupons: [],
    quickReplies: primary.quickReplies || DEFAULT_SITE_QUICK_REPLIES,
    metadata: {
      matchedFeatures: features.map((feature) => feature.key),
      siteName: snapshot.siteName,
      activeProductCount: snapshot.activeProductCount,
      categoryCount: snapshot.categoryCount,
    },
  };
};