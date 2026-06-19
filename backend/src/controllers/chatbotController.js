import { randomUUID } from "node:crypto";
import Category from "../models/Category.js";
import ChatbotLog from "../models/ChatbotLog.js";
import Coupon from "../models/Coupon.js";
import Message from "../models/Message.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const STOP_WORDS = new Set([
  "toi",
  "minh",
  "em",
  "anh",
  "chi",
  "ban",
  "muon",
  "can",
  "tim",
  "mua",
  "cho",
  "hoi",
  "san",
  "pham",
  "hang",
  "con",
  "khong",
  "co",
  "gia",
  "duoi",
  "tren",
  "tu",
  "den",
  "tam",
  "khoang",
  "trieu",
  "tr",
  "nghin",
  "vnd",
  "dong",
  "tot",
  "nao",
  "nhe",
  "nha",
  "giup",
  "voi",
  "tu",
  "van",
  "goi",
  "y",
  "re",
  "hon",
  "nua",
  "so",
  "xem",
  "chay",
  "hot",
  "noi",
  "bat",
  "pho",
  "bien",
  "top",
]);

const QUICK_REPLIES = [
  "Laptop dưới 20 triệu",
  "Sản phẩm bán chạy",
  "Có khuyến mãi nào không?",
  "Gặp nhân viên tư vấn",
];

const NEED_PROFILES = [
  {
    key: "gaming",
    label: "chơi game",
    keywords: ["gaming", "game", "choi game", "fps", "rtx", "gtx", "card do hoa"],
    terms: ["gaming", "rtx", "gtx", "nvidia", "geforce", "ryzen", "intel", "i5", "i7", "ram", "ssd"],
  },
  {
    key: "office",
    label: "văn phòng",
    keywords: ["van phong", "office", "hoc tap", "sinh vien", "lam viec", "mong nhe"],
    terms: ["office", "van phong", "mỏng", "nhẹ", "i3", "i5", "ryzen", "ssd", "pin"],
  },
  {
    key: "design",
    label: "đồ họa",
    keywords: ["do hoa", "design", "thiet ke", "render", "photoshop", "video", "lap trinh"],
    terms: ["rtx", "gtx", "nvidia", "ram", "ssd", "i7", "ryzen 7", "oled", "2k", "4k"],
  },
  {
    key: "camera",
    label: "chụp ảnh",
    keywords: ["chup anh", "quay phim", "camera", "song ao"],
    terms: ["camera", "ois", "ai", "pro", "ultra", "sony", "canon"],
  },
  {
    key: "battery",
    label: "pin lâu",
    keywords: ["pin trau", "pin lau", "dung lau", "sac nhanh"],
    terms: ["pin", "battery", "mah", "sac nhanh", "fast charge"],
  },
];

const SUPPORT_QUICK_REPLIES = [
  "Tôi cần laptop chơi game",
  "Tôi cần máy văn phòng",
  "Ngân sách dưới 15 triệu",
  "Gặp nhân viên tư vấn",
];

const COMMERCE_KEYWORDS = [
  "san pham",
  "danh muc",
  "loai san pham",
  "nganh hang",
  "category",
  "mua",
  "hang",
  "shop",
  "gia",
  "bao nhieu",
  "ngan sach",
  "duoi",
  "tren",
  "trieu",
  "khuyen mai",
  "uu dai",
  "giam gia",
  "coupon",
  "voucher",
  "ma giam",
  "gio hang",
  "don hang",
  "dat hang",
  "thanh toan",
  "cod",
  "vnpay",
  "momo",
  "giao hang",
  "van chuyen",
  "ship",
  "bao hanh",
  "doi tra",
  "hoan tra",
  "ton kho",
  "con hang",
  "het hang",
  "tu van",
  "goi y",
  "nen mua",
  "chon",
  "nhan vien",
  "ho tro",
  "lien he",
  "laptop",
  "may tinh",
  "dien thoai",
  "camera",
  "gaming",
  "game",
  "van phong",
  "do hoa",
  "pin",
];

const OUT_OF_SCOPE_REPLY =
  "Mình chỉ hỗ trợ các câu hỏi liên quan đến sản phẩm, giá, khuyến mãi, giỏ hàng, đơn hàng, giao hàng, bảo hành và nhân viên tư vấn của shop. Bạn muốn tìm sản phẩm nào?";

const normalizeText = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const moneyFromText = (normalizedMessage, markers) => {
  for (const marker of markers) {
    const regex = new RegExp(`${marker}\\s*(\\d+(?:[.,]\\d+)?)\\s*(trieu|tr|m|nghin|k|dong|vnd)?`);
    const match = normalizedMessage.match(regex);
    if (!match) continue;

    const amount = Number(match[1].replace(",", "."));
    const unit = match[2] || "";
    if (!Number.isFinite(amount)) return null;
    if (["trieu", "tr", "m"].includes(unit)) return amount * 1000000;
    if (["nghin", "k"].includes(unit)) return amount * 1000;
    return amount;
  }
  return null;
};

const parsePriceRange = (normalizedMessage) => {
  const between = normalizedMessage.match(
    /(?:tu|khoang)\s*(\d+(?:[.,]\d+)?)\s*(?:trieu|tr|m)?\s*(?:den|-)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|nghin|k)?/,
  );

  if (between) {
    const unit = between[3] || "trieu";
    const multiplier = ["nghin", "k"].includes(unit) ? 1000 : 1000000;
    return {
      minPrice: Number(between[1].replace(",", ".")) * multiplier,
      maxPrice: Number(between[2].replace(",", ".")) * multiplier,
    };
  }

  return {
    minPrice: moneyFromText(normalizedMessage, ["tren", "hon", "tu"]),
    maxPrice: moneyFromText(normalizedMessage, ["duoi", "nho hon", "toi da", "tam", "khoang"]),
  };
};

const getSessionId = (req) => String(req.body?.sessionId || req.query?.sessionId || randomUUID()).trim();

const safeLog = async ({ sessionId, user, role, content, intent, products = [], metadata = {}, escalated = false, staffReceiver = null }) => {
  try {
    await ChatbotLog.create({
      sessionId,
      user: user?._id || null,
      role,
      content,
      intent,
      products: products.map((product) => ({
        product: product.id || product._id,
        name: product.name,
        price: product.price,
      })),
      metadata,
      escalated,
      staffReceiver,
    });
  } catch (error) {
    console.warn("Cannot save chatbot log:", error.message);
  }
};

const getContextText = async (sessionId, currentMessage) => {
  const recent = await ChatbotLog.find({ sessionId, role: "user" })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("content");

  return [...recent.reverse().map((item) => item.content), currentMessage].join(" ");
};

const findMatchedNeed = (normalizedMessage) =>
  NEED_PROFILES.find((profile) => profile.keywords.some((keyword) => normalizedMessage.includes(keyword)));

const PRODUCT_PHRASE_TOKENS = [
  {
    phrases: ["sac du phong", "pin sac du phong", "pin du phong"],
    tokens: ["sac", "du", "phong"],
  },
];

const restorePhraseTokens = (normalizedMessage, tokens) => {
  const result = [...tokens];
  PRODUCT_PHRASE_TOKENS.forEach((item) => {
    if (!item.phrases.some((phrase) => normalizedMessage.includes(phrase))) return;
    item.tokens.forEach((token) => {
      if (!result.includes(token)) result.push(token);
    });
  });
  return result;
};

const buildTokens = (normalizedMessage, categories, brands = []) => {
  const categoryWords = categories.flatMap((category) =>
    normalizeText(`${category.name} ${category.slug}`).split(/\s+/),
  );
  const brandWords = brands.flatMap((brand) => normalizeText(brand).split(/\s+/));
  const profileWords = NEED_PROFILES.flatMap((profile) =>
    [...profile.keywords, ...profile.terms, profile.label].flatMap((value) => normalizeText(value).split(/\s+/)),
  );
  const ignored = new Set([...STOP_WORDS, ...categoryWords, ...brandWords, ...profileWords]);

  const tokens = normalizedMessage
    .replace(/\b\d+(?:[.,]\d+)?\b/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !ignored.has(token));

  return restorePhraseTokens(normalizedMessage, tokens);
};

const findMatchedCategory = (normalizedMessage, categories) =>
  categories.find((category) => {
    const name = normalizeText(category.name);
    const slug = normalizeText(category.slug);
    return normalizedMessage.includes(name) || normalizedMessage.includes(slug);
  });

const findMatchedBrand = (normalizedMessage, brands) =>
  brands.find((brand) => {
    const normalizedBrand = normalizeText(brand);
    return normalizedBrand && normalizedMessage.includes(normalizedBrand);
  });

const getDefaultVariant = (product) => {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  return variants.find((variant) => Number(variant.stock || 0) > 0) || variants[0] || null;
};

const serializeProduct = (product) => {
  const defaultVariant = getDefaultVariant(product);
  const priceAdd = Number(defaultVariant?.priceAdd || 0);

  return {
    id: product._id.toString(),
    name: product.name,
    brand: product.brand,
    price: Number(product.price || 0) + priceAdd,
    basePrice: product.price,
    compareAtPrice: product.compareAtPrice,
    image: product.images?.[0] || "",
    stock: product.stock,
    inStock: Number(product.totalVariantStock ?? product.stock ?? 0) > 0,
    category: product.category?.name || "",
    sales: product.sales || 0,
    defaultVariant: defaultVariant
      ? {
          name: defaultVariant.name || "Default",
          priceAdd: Number(defaultVariant.priceAdd || 0),
          stock: Number(defaultVariant.stock || 0),
        }
      : null,
  };
};

const scoreProduct = (product, tokens, criteria) => {
  const haystack = normalizeText(
    `${product.name} ${product.brand || ""} ${product.description || ""} ${product.category?.name || ""}`,
  );
  const strongTokens = tokens.filter((token) => token.length >= 3).slice(0, 6);
  const phrase = strongTokens.length >= 2 ? strongTokens.join(" ") : "";

  let score = tokens.length === 0 ? 1 : 0;
  if (phrase && normalizeText(product.name).includes(phrase)) score += 12;
  score += tokens.reduce((total, token) => {
    if (normalizeText(product.name).includes(token)) return total + 5;
    if (normalizeText(product.brand || "").includes(token)) return total + 4;
    if (normalizeText(product.category?.name || "").includes(token)) return total + 3;
    if (haystack.includes(token)) return total + 1;
    return total;
  }, 0);

  if (criteria.needProfile) {
    score += criteria.needProfile.terms.reduce((total, term) => {
      const normalizedTerm = normalizeText(term);
      return haystack.includes(normalizedTerm) ? total + 3 : total;
    }, 0);
  }

  if (Number(product.totalVariantStock ?? product.stock ?? 0) > 0) score += 4;
  if (Number(product.compareAtPrice || 0) > Number(product.price || 0)) score += 2;
  if (criteria.maxPrice && Number(product.price || 0) <= criteria.maxPrice) score += 2;
  score += Math.min(5, Number(product.sales || 0) / 10);

  return score;
};

const buildTokenProductFilter = (tokens) => {
  const regexes = tokens
    .filter((token) => token.length >= 3)
    .slice(0, 6)
    .map((token) => new RegExp(escapeRegex(token), "i"));

  if (regexes.length === 0) return null;

  const fieldMatches = (regex) => [
    { name: regex },
    { brand: regex },
    { sku: regex },
    { description: regex },
  ];

  if (regexes.length === 1) {
    return { $or: fieldMatches(regexes[0]) };
  }

  return {
    $and: regexes.map((regex) => ({
      $or: fieldMatches(regex),
    })),
  };
};

const hasStrongProductIntentMatch = (product, tokens, criteria) => {
  if (criteria.matchedCategory || criteria.brand || tokens.length < 2) return true;

  const strongTokens = tokens.filter((token) => token.length >= 3).slice(0, 6);
  if (strongTokens.length < 2) return true;

  const primaryText = normalizeText(
    `${product.name} ${product.brand || ""} ${product.category?.name || ""} ${product.sku || ""}`,
  );
  const haystack = normalizeText(`${primaryText} ${product.description || ""}`);
  const phrase = strongTokens.join(" ");
  const primaryHits = strongTokens.filter((token) => primaryText.includes(token)).length;
  const allTokensMatch = strongTokens.every((token) => haystack.includes(token));

  return primaryText.includes(phrase) || primaryHits >= Math.min(2, strongTokens.length) || (primaryHits >= 1 && allTokensMatch);
};

const parseCriteria = async (message, contextText) => {
  const categories = await Category.find().select("name slug");
  const brands = (await Product.distinct("brand", { brand: { $nin: [null, ""] } })).filter(Boolean);
  const normalizedMessage = normalizeText(message);
  const normalizedContext = normalizeText(contextText);
  const currentCategory = findMatchedCategory(normalizedMessage, categories);
  const contextCategory = findMatchedCategory(normalizedContext, categories);
  const currentNeedProfile = findMatchedNeed(normalizedMessage);
  const contextNeedProfile = findMatchedNeed(normalizedContext);
  const currentBrand = findMatchedBrand(normalizedMessage, brands);
  const contextBrand = findMatchedBrand(normalizedContext, brands);
  const currentPriceRange = parsePriceRange(normalizedMessage);
  const priceRange = parsePriceRange(normalizedContext);
  const currentTokens = buildTokens(normalizedMessage, categories, brands);
  const hasCurrentProductSignal = Boolean(currentCategory || currentBrand || currentTokens.length > 0);

  let sort = "relevance";
  if (/(ban chay|hot|noi bat|pho bien)/.test(normalizedMessage)) sort = "best_selling";
  if (/(re nhat|re hon|gia thap|gia re|tiet kiem)/.test(normalizedMessage)) sort = "cheapest";
  if (/(cao cap|dat nhat|gia cao|premium)/.test(normalizedMessage)) sort = "premium";
  if (/(sale|giam gia|khuyen mai|uu dai)/.test(normalizedMessage)) sort = "sale";

  const currentOnlyInStock = /(con hang|san hang|co san|ton kho)/.test(normalizedMessage);
  const hasCurrentPriceSignal = Boolean(currentPriceRange.minPrice || currentPriceRange.maxPrice);
  const isStandaloneStockQuestion =
    currentOnlyInStock && !hasCurrentProductSignal && !hasCurrentPriceSignal;
  const isStandaloneRankingQuestion =
    ["best_selling", "sale"].includes(sort) && !hasCurrentProductSignal && !hasCurrentPriceSignal;
  const canUseContext = !hasCurrentProductSignal && !isStandaloneStockQuestion && !isStandaloneRankingQuestion;
  const effectivePriceRange = {
    minPrice: currentPriceRange.minPrice || (canUseContext ? priceRange.minPrice : null),
    maxPrice: currentPriceRange.maxPrice || (canUseContext ? priceRange.maxPrice : null),
  };
  const matchedCategory = currentCategory || (canUseContext ? contextCategory : null);
  const needProfile = currentNeedProfile || (canUseContext ? contextNeedProfile : null);
  const brand = currentBrand || (canUseContext ? contextBrand : null);
  const tokens = hasCurrentProductSignal
    ? currentTokens
    : canUseContext
      ? buildTokens(normalizedContext, categories, brands)
      : currentTokens;

  return {
    categories,
    brands,
    matchedCategory,
    needProfile,
    brand,
    tokens,
    current: {
      matchedCategory: currentCategory,
      needProfile: currentNeedProfile,
      brand: currentBrand,
      tokens: currentTokens,
      onlyInStock: currentOnlyInStock,
      ...currentPriceRange,
    },
    sort,
    onlyInStock: currentOnlyInStock,
    ...effectivePriceRange,
  };
};

const buildNeedQuickReplies = (categoryName = "sản phẩm") => [
  `${categoryName} chơi game`,
  `${categoryName} văn phòng`,
  `${categoryName} đồ họa`,
  `${categoryName} dưới 15 triệu`,
  "Gặp nhân viên tư vấn",
];

const summarizeCriteria = (criteria) => ({
  category: criteria.matchedCategory
    ? {
        id: criteria.matchedCategory._id?.toString(),
        name: criteria.matchedCategory.name,
      }
    : null,
  need: criteria.needProfile
    ? {
        key: criteria.needProfile.key,
        label: criteria.needProfile.label,
      }
    : null,
  brand: criteria.brand || null,
  minPrice: criteria.minPrice || null,
  maxPrice: criteria.maxPrice || null,
  sort: criteria.sort,
  onlyInStock: criteria.onlyInStock,
  tokens: criteria.tokens.slice(0, 8),
});

const shouldAskNeed = (message, criteria) => {
  const normalizedMessage = normalizeText(message);
  const isConsulting = /(tu van|goi y|nen mua|chon|phu hop|can mua)/.test(normalizedMessage);
  return isConsulting && criteria.matchedCategory && !criteria.needProfile && !criteria.maxPrice && !criteria.minPrice;
};

const hasDirectProductMatch = async (tokens) => {
  const regexes = tokens
    .filter((token) => token.length >= 3)
    .slice(0, 5)
    .map((token) => new RegExp(escapeRegex(token), "i"));

  if (regexes.length === 0) return false;

  const product = await Product.findOne({
    status: "active",
    $or: [
      { name: { $in: regexes } },
      { brand: { $in: regexes } },
      { sku: { $in: regexes } },
    ],
  }).select("_id");

  return Boolean(product);
};

const isCommerceRelated = async (normalizedMessage, criteria) => {
  const current = criteria.current || {};
  if (COMMERCE_KEYWORDS.some((keyword) => normalizedMessage.includes(keyword))) return true;
  if (criteria.sort && criteria.sort !== "relevance") return true;
  if (current.matchedCategory || current.needProfile || current.brand) return true;
  if (current.minPrice || current.maxPrice || current.onlyInStock) return true;
  return hasDirectProductMatch(current.tokens || []);
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
    .limit(3);
};

const describeCoupon = (coupon) => {
  if (coupon.type === "percentage") return `mã ${coupon.code} giảm ${coupon.value}%`;
  if (coupon.type === "fixed") return `mã ${coupon.code} giảm ${coupon.value.toLocaleString("vi-VN")}đ`;
  return `mã ${coupon.code} miễn phí vận chuyển`;
};

const COUPON_QUICK_REPLIES = [
  "Có khuyến mãi nào không?",
  "Tìm sản phẩm đang giảm giá",
  "Gặp nhân viên tư vấn",
];

const COUPON_CODE_IGNORED_WORDS = new Set([
  "ap",
  "ban",
  "code",
  "con",
  "coupon",
  "dai",
  "dc",
  "do",
  "don",
  "duoc",
  "dung",
  "giam",
  "gia",
  "hang",
  "han",
  "het",
  "khong",
  "khuyen",
  "ma",
  "mai",
  "mien",
  "nay",
  "pham",
  "phi",
  "promo",
  "san",
  "ship",
  "su",
  "toi",
  "uu",
  "voucher",
  "xai",
]);

const isLikelyCouponCode = (value) => {
  const code = String(value || "").toLowerCase().replace(/[^a-z0-9_-]/g, "");
  return code.length >= 3 && code.length <= 24 && !COUPON_CODE_IGNORED_WORDS.has(code);
};

const extractCouponCode = (message, normalizedMessage = normalizeText(message)) => {
  const normalized = normalizedMessage.replace(/[^a-z0-9_\-\s]/g, " ");
  const patterns = [
    /\b(?:ma|code|coupon|voucher|promo)\s+(?:giam\s+gia\s+|giam\s+|khuyen\s+mai\s+|uu\s+dai\s+|voucher\s+|coupon\s+|promo\s+|code\s+|mien\s+phi\s+ship\s+|ship\s+)?([a-z0-9][a-z0-9_-]{2,23})\b/,
    /\b([a-z0-9][a-z0-9_-]{2,23})\s+(?:con\s+)?(?:su\s+dung|dung|ap\s+dung|xai)\s+duoc\b/,
    /\b([a-z0-9][a-z0-9_-]{2,23})\s+(?:con\s+han|het\s+han|valid)\b/,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match && isLikelyCouponCode(match[1])) return match[1].toUpperCase();
  }

  return null;
};

const isCouponQuestion = (message, normalizedMessage) =>
  /(khuyen mai|uu dai|giam gia|coupon|voucher|ma giam|ma khuyen mai|ma uu dai|code|promo)/.test(normalizedMessage) ||
  Boolean(extractCouponCode(message, normalizedMessage));

const getCouponAvailability = (coupon) => {
  const now = new Date();
  if (coupon.status !== "active") return { usable: false, reason: "mã chưa được kích hoạt hoặc đã bị hủy" };
  if (coupon.startDate && coupon.startDate > now) {
    return { usable: false, reason: `mã chưa tới thời gian áp dụng (${coupon.startDate.toLocaleDateString("vi-VN")})` };
  }
  if (coupon.endDate && coupon.endDate < now) return { usable: false, reason: "mã đã hết hạn" };
  if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
    return { usable: false, reason: "mã đã hết lượt sử dụng" };
  }
  return { usable: true, reason: "" };
};

const describeCouponConditions = (coupon) => {
  const conditions = [];
  if (coupon.minOrder > 0) conditions.push(`áp dụng cho đơn từ ${formatMoney(coupon.minOrder)}`);
  if (coupon.endDate) conditions.push(`hạn đến ${coupon.endDate.toLocaleDateString("vi-VN")}`);
  return conditions.length ? ` Điều kiện: ${conditions.join(", ")}.` : "";
};

const getCouponAnswer = async (message, normalizedMessage) => {
  const code = extractCouponCode(message, normalizedMessage);

  if (code) {
    const coupon = await Coupon.findOne({ code });
    if (!coupon) {
      return {
        intent: "coupon_lookup",
        reply: `Mã ${code} không tồn tại hoặc chưa được shop công khai. Bạn có thể hỏi "có khuyến mãi nào không" để mình liệt kê mã đang dùng được.`,
        coupons: [],
        quickReplies: COUPON_QUICK_REPLIES,
        metadata: { code, status: "not_found" },
      };
    }

    const availability = getCouponAvailability(coupon);
    const description = describeCoupon(coupon);
    const conditions = describeCouponConditions(coupon);
    const reply = availability.usable
      ? `Mã ${coupon.code} còn sử dụng được. Ưu đãi: ${description}.${conditions} Bạn nhập mã này ở bước thanh toán.`
      : `Mã ${coupon.code} hiện không sử dụng được vì ${availability.reason}.`;

    return {
      intent: "coupon_lookup",
      reply,
      coupons: [coupon],
      quickReplies: COUPON_QUICK_REPLIES,
      metadata: { code: coupon.code, status: availability.usable ? "usable" : "unusable" },
    };
  }

  const coupons = await getActiveCoupons();
  return {
    intent: "promotion",
    reply:
      coupons.length > 0
        ? `Hiện có ${coupons.map(describeCoupon).join(", ")}. Bạn có thể nhập mã ở bước thanh toán.`
        : "Hiện chưa có mã khuyến mãi công khai. Bạn có thể xem sản phẩm đang giảm giá nếu có giá so sánh cao hơn giá bán.",
    coupons,
    quickReplies: QUICK_REPLIES,
    metadata: { status: coupons.length > 0 ? "available" : "empty" },
  };
};

const isCategoryQuestion = (normalizedMessage) =>
  /(danh muc|loai san pham|nganh hang|category)/.test(normalizedMessage);

const getCategoryAnswer = async () => {
  const categories = await Category.find()
    .select("name slug")
    .sort({ name: 1 })
    .limit(20);

  if (categories.length === 0) {
    return {
      reply: "Hiện shop chưa có danh mục sản phẩm công khai. Bạn có thể hỏi tên sản phẩm hoặc ngân sách để mình tìm giúp.",
      quickReplies: SUPPORT_QUICK_REPLIES,
      categories: [],
    };
  }

  const names = categories.map((category) => category.name).join(", ");
  const quickReplies = [
    ...categories.slice(0, 4).map((category) => `Tìm ${category.name}`),
    "Sản phẩm bán chạy",
    "Gặp nhân viên tư vấn",
  ];

  return {
    reply: `Shop hiện có các danh mục: ${names}. Bạn muốn xem danh mục nào?`,
    quickReplies,
    categories,
  };
};

const isHelpQuestion = (normalizedMessage) =>
  /(giup gi|giup duoc gi|lam duoc gi|ho tro gi|ban co the giup|co the giup|chatbot|tro ly)/.test(normalizedMessage);

const getHelpAnswer = () => ({
  reply:
    "Mình có thể giúp bạn tìm sản phẩm theo nhu cầu/ngân sách, xem danh mục, kiểm tra khuyến mãi, thêm sản phẩm vào giỏ, xem đơn hàng, hỏi giao hàng/thanh toán/bảo hành và chuyển nhân viên tư vấn khi cần.",
  quickReplies: [
    "Có danh mục nào",
    "Laptop dưới 20 triệu",
    "Có khuyến mãi nào không?",
    "Đơn hàng của tôi",
    "Gặp nhân viên tư vấn",
  ],
});

const ORDER_STATUS_LABELS = {
  pending: "chờ xác nhận",
  processing: "đang xử lý",
  shipped: "đang giao",
  delivered: "đã giao",
  cancelled: "đã hủy",
  returned: "đã hoàn trả",
};

const PAYMENT_STATUS_LABELS = {
  pending: "chờ thanh toán",
  completed: "đã thanh toán",
  failed: "thanh toán thất bại",
  refunded: "đã hoàn tiền",
};

const isOrderQuestion = (normalizedMessage) =>
  /(don hang|lich su mua|kiem tra don|trang thai don|order)/.test(normalizedMessage);

const getOrderAnswer = async (user) => {
  if (!user?._id) {
    return {
      reply: "Bạn cần đăng nhập để mình kiểm tra đơn hàng của bạn.",
      action: "login_required",
      quickReplies: ["Đăng nhập", "Gặp nhân viên tư vấn", "Tìm sản phẩm khác"],
      orders: [],
    };
  }

  const orders = await Order.find({ customer: user._id })
    .populate("products.product", "name")
    .sort({ createdAt: -1 })
    .limit(3);

  if (orders.length === 0) {
    return {
      reply: "Bạn chưa có đơn hàng nào. Bạn có thể hỏi mình để tìm sản phẩm phù hợp rồi thêm vào giỏ hàng.",
      action: "open_orders",
      quickReplies: ["Tìm laptop dưới 20 triệu", "Sản phẩm bán chạy", "Có khuyến mãi nào không?"],
      orders: [],
    };
  }

  const summaries = orders.map((order) => {
    const code = order._id.toString().slice(-6).toUpperCase();
    const orderStatus = ORDER_STATUS_LABELS[order.orderStatus] || order.orderStatus;
    const paymentStatus = PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus;
    const firstProduct = order.products?.[0]?.product?.name;
    const productSuffix = firstProduct ? ` - ${firstProduct}` : "";
    return `#${code}: ${orderStatus}, ${paymentStatus}, tổng ${formatMoney(order.totalAmount)}${productSuffix}`;
  });

  return {
    reply: `Mình tìm thấy ${orders.length} đơn hàng gần nhất của bạn: ${summaries.join("; ")}.`,
    action: "open_orders",
    quickReplies: ["Mở lịch sử đơn hàng", "Gặp nhân viên tư vấn", "Tìm sản phẩm khác"],
    orders,
  };
};

const answerStaticQuestion = (normalizedMessage) => {
  if (/^(xin chao|chao|hello|hi)(\s|[!.?]+|$)/.test(normalizedMessage)) {
    return {
      intent: "greeting",
      reply:
        "Chào bạn! Mình có thể gợi ý sản phẩm theo nhu cầu, lọc theo ngân sách, kiểm tra khuyến mãi, thêm vào giỏ và chuyển nhân viên khi bạn cần.",
      quickReplies: SUPPORT_QUICK_REPLIES,
    };
  }

  if (/(giao hang|van chuyen|ship|nhan hang)/.test(normalizedMessage)) {
    return {
      intent: "shipping",
      reply:
        "Shop hỗ trợ giao hàng toàn quốc. Phí ship và thời gian giao dự kiến sẽ hiển thị ở bước thanh toán theo địa chỉ nhận hàng.",
      quickReplies: ["Sản phẩm còn hàng", "Có mã miễn phí ship không?", "Gặp nhân viên tư vấn"],
    };
  }

  if (/(thanh toan|tra tien|cod|vnpay|momo|chuyen khoan)/.test(normalizedMessage)) {
    return {
      intent: "payment",
      reply: "Bạn có thể thanh toán bằng COD, VNPay, MoMo hoặc chuyển khoản tùy cấu hình đơn hàng.",
      quickReplies: ["Có khuyến mãi nào không?", "Hướng dẫn đặt hàng", "Gặp nhân viên tư vấn"],
    };
  }

  if (/(bao hanh|doi tra|hoan tra|tra hang)/.test(normalizedMessage)) {
    return {
      intent: "warranty",
      reply:
        "Với sản phẩm điện tử, bạn nên giữ hóa đơn và hộp sản phẩm. Nếu cần đổi trả hoặc bảo hành, hãy gửi mã đơn hàng để nhân viên kiểm tra nhanh hơn.",
      quickReplies: ["Gặp nhân viên tư vấn", "Kiểm tra đơn hàng", "Tìm sản phẩm khác"],
    };
  }

  if (/(lien he|nhan vien|tu van vien|hotline|ho tro|gap nguoi|gap shop)/.test(normalizedMessage)) {
    return {
      intent: "handoff",
      action: "handoff",
      reply: "Mình có thể chuyển cuộc trò chuyện này cho nhân viên. Bạn bấm nút Gặp nhân viên để tạo tin nhắn hỗ trợ.",
      quickReplies: ["Gặp nhân viên tư vấn", "Tìm laptop dưới 20 triệu", "Có khuyến mãi nào không?"],
    };
  }

  return null;
};

const searchProducts = async (criteria) => {
  const filter = { status: "active" };
  if (criteria.matchedCategory) filter.category = criteria.matchedCategory._id;
  if (criteria.brand) filter.brand = { $regex: escapeRegex(criteria.brand), $options: "i" };
  if (criteria.onlyInStock) filter.stock = { $gt: 0 };
  if (criteria.minPrice || criteria.maxPrice) {
    filter.price = {};
    if (criteria.minPrice) filter.price.$gte = criteria.minPrice;
    if (criteria.maxPrice) filter.price.$lte = criteria.maxPrice;
  }

  const baseFilter = { ...filter, price: filter.price ? { ...filter.price } : undefined };
  if (!baseFilter.price) delete baseFilter.price;
  let usedTokenFilter = false;

  if (!criteria.matchedCategory && !criteria.brand && criteria.tokens.length > 0) {
    const tokenFilter = buildTokenProductFilter(criteria.tokens);
    if (tokenFilter) {
      Object.assign(filter, tokenFilter);
      usedTokenFilter = true;
    }
  }

  if (criteria.sort === "sale") {
    filter.compareAtPrice = { $gt: 0 };
    baseFilter.compareAtPrice = { $gt: 0 };
  }

  const loadProducts = (productFilter, limit = 60) =>
    Product.find(productFilter)
      .populate("category", "name slug")
      .sort({ sales: -1, createdAt: -1 })
      .limit(limit);

  const rankProducts = (items) =>
    items
      .map((product) => ({ product, score: scoreProduct(product, criteria.tokens, criteria) }))
      .filter(
        ({ product, score }) =>
          (criteria.tokens.length === 0 || score > 0 || criteria.matchedCategory || criteria.brand) &&
          hasStrongProductIntentMatch(product, criteria.tokens, criteria),
      );

  let products = await loadProducts(filter);
  let withScores = rankProducts(products);

  if (usedTokenFilter && withScores.length === 0) {
    products = await loadProducts(baseFilter, 120);
    withScores = rankProducts(products);
  }

  if (criteria.sort === "cheapest") {
    withScores.sort((a, b) => a.product.price - b.product.price);
  } else if (criteria.sort === "premium") {
    withScores.sort((a, b) => b.product.price - a.product.price);
  } else if (criteria.sort === "best_selling") {
    withScores.sort((a, b) => Number(b.product.sales || 0) - Number(a.product.sales || 0));
  } else if (criteria.sort === "sale") {
    withScores.sort((a, b) => {
      const aDiscount = Number(a.product.compareAtPrice || 0) - Number(a.product.price || 0);
      const bDiscount = Number(b.product.compareAtPrice || 0) - Number(b.product.price || 0);
      return bDiscount - aDiscount;
    });
  } else {
    withScores.sort((a, b) => b.score - a.score || Number(b.product.sales || 0) - Number(a.product.sales || 0));
  }

  return withScores.slice(0, 4).map(({ product }) => serializeProduct(product));
};

const buildProductReply = (products, criteria) => {
  if (products.length === 0) {
    return "Mình chưa tìm thấy sản phẩm phù hợp. Bạn thử nói rõ hơn về danh mục, thương hiệu hoặc ngân sách, ví dụ: laptop gaming dưới 20 triệu.";
  }

  const parts = ["Mình tìm thấy một vài sản phẩm phù hợp"];
  if (criteria.needProfile) parts.push(`cho nhu cầu ${criteria.needProfile.label}`);
  if (criteria.maxPrice) parts.push(`trong tầm ${formatMoney(criteria.maxPrice)}`);
  if (criteria.brand) parts.push(`của ${criteria.brand}`);
  if (criteria.onlyInStock) parts.push("đang còn hàng");

  return `${parts.join(" ")}. Bạn có thể xem chi tiết hoặc thêm nhanh vào giỏ ngay trong khung chat.`;
};

const toChatMessage = (log) => ({
  id: log._id,
  role: log.role === "user" ? "user" : "bot",
  text: log.content,
  products: log.metadata?.products || [],
  action: log.metadata?.action,
  contactId: log.metadata?.contactId,
  createdAt: log.createdAt,
});

export const getChatbotHistory = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const filter = req.user?._id
      ? { $or: [{ sessionId }, { user: req.user._id }] }
      : { sessionId };

    const logs = await ChatbotLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(60);

    res.json({
      sessionId,
      messages: logs.reverse().filter((log) => log.role !== "system").map(toChatMessage),
    });
  } catch (error) {
    next(error);
  }
};

export const replyToChatbot = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const message = String(req.body?.message || "").trim();
    if (!message) {
      return res.status(400).json({ message: "Vui lòng nhập nội dung cần hỏi." });
    }

    await safeLog({ sessionId, user: req.user, role: "user", content: message, intent: "user_message" });

    const normalizedMessage = normalizeText(message);
    const wantsCoupons = isCouponQuestion(message, normalizedMessage);

    if (isHelpQuestion(normalizedMessage)) {
      const helpAnswer = getHelpAnswer();
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: helpAnswer.reply,
        intent: "help",
      });
      return res.json({
        sessionId,
        intent: "help",
        reply: helpAnswer.reply,
        products: [],
        coupons: [],
        quickReplies: helpAnswer.quickReplies,
      });
    }

    if (isCategoryQuestion(normalizedMessage)) {
      const categoryAnswer = await getCategoryAnswer();
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: categoryAnswer.reply,
        intent: "category_list",
        metadata: {
          categories: categoryAnswer.categories.map((category) => ({
            id: category._id.toString(),
            name: category.name,
            slug: category.slug,
          })),
        },
      });
      return res.json({
        sessionId,
        intent: "category_list",
        reply: categoryAnswer.reply,
        products: [],
        coupons: [],
        quickReplies: categoryAnswer.quickReplies,
      });
    }

    if (isOrderQuestion(normalizedMessage)) {
      const orderAnswer = await getOrderAnswer(req.user);
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: orderAnswer.reply,
        intent: "order_lookup",
        metadata: {
          action: orderAnswer.action,
          orders: orderAnswer.orders.map((order) => ({
            id: order._id.toString(),
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
          })),
        },
      });
      return res.json({
        sessionId,
        intent: "order_lookup",
        action: orderAnswer.action,
        reply: orderAnswer.reply,
        products: [],
        coupons: [],
        quickReplies: orderAnswer.quickReplies,
      });
    }

    if (wantsCoupons) {
      const couponAnswer = await getCouponAnswer(message, normalizedMessage);

      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: couponAnswer.reply,
        intent: couponAnswer.intent,
        metadata: couponAnswer.metadata,
      });
      return res.json({
        sessionId,
        intent: couponAnswer.intent,
        reply: couponAnswer.reply,
        products: [],
        coupons: couponAnswer.coupons,
        quickReplies: couponAnswer.quickReplies,
      });
    }

    const staticReply = answerStaticQuestion(normalizedMessage);
    if (staticReply) {
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: staticReply.reply,
        intent: staticReply.intent,
        metadata: { action: staticReply.action },
      });
      return res.json({
        sessionId,
        intent: staticReply.intent,
        action: staticReply.action,
        reply: staticReply.reply,
        products: [],
        coupons: [],
        quickReplies: staticReply.quickReplies,
      });
    }

    const contextText = await getContextText(sessionId, message);
    const criteria = await parseCriteria(message, contextText);

    if (!(await isCommerceRelated(normalizedMessage, criteria))) {
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: OUT_OF_SCOPE_REPLY,
        intent: "out_of_scope",
      });
      return res.json({
        sessionId,
        intent: "out_of_scope",
        reply: OUT_OF_SCOPE_REPLY,
        products: [],
        coupons: [],
        quickReplies: SUPPORT_QUICK_REPLIES,
      });
    }

    if (shouldAskNeed(message, criteria)) {
      const categoryName = criteria.matchedCategory?.name || "sản phẩm";
      const reply = `Bạn muốn dùng ${categoryName} cho nhu cầu nào? Mình sẽ lọc chính xác hơn theo hiệu năng, ngân sách và tình trạng còn hàng.`;
      const quickReplies = buildNeedQuickReplies(categoryName);
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: reply,
        intent: "clarify_need",
        metadata: { criteria: summarizeCriteria(criteria) },
      });
      return res.json({
        sessionId,
        intent: "clarify_need",
        reply,
        products: [],
        coupons: [],
        quickReplies,
      });
    }

    const products = await searchProducts(criteria);
    const reply = buildProductReply(products, criteria);
    const quickReplies = criteria.maxPrice
      ? ["Rẻ hơn nữa", "Sản phẩm còn hàng", "So với sản phẩm bán chạy", "Gặp nhân viên tư vấn"]
      : ["Dưới 10 triệu", "Từ 10 đến 20 triệu", "Sản phẩm còn hàng", "Gặp nhân viên tư vấn"];

    await safeLog({
      sessionId,
      user: req.user,
      role: "bot",
      content: reply,
      intent: "product_search",
      products,
      metadata: { products, criteria: summarizeCriteria(criteria) },
    });

    return res.json({
      sessionId,
      intent: "product_search",
      reply,
      products,
      coupons: [],
      quickReplies,
    });
  } catch (error) {
    next(error);
  }
};

export const handoffChatbot = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const message = String(req.body?.message || "Khách muốn gặp nhân viên tư vấn").trim();

    if (!req.user?._id) {
      const reply = "Bạn cần đăng nhập để mình chuyển cuộc trò chuyện sang hộp thư nhân viên.";
      await safeLog({
        sessionId,
        role: "bot",
        content: reply,
        intent: "handoff_requires_login",
        metadata: { action: "login_required" },
      });
      return res.status(401).json({
        sessionId,
        requiresLogin: true,
        reply,
        quickReplies: ["Đăng nhập", "Tiếp tục tìm sản phẩm", "Có khuyến mãi nào không?"],
      });
    }

    const staff =
      (await User.findOne({ role: "admin", status: "active" }).select("name email role")) ||
      (await User.findOne({ role: "seller", status: "active" }).select("name email role"));

    if (!staff) {
      const reply = "Hiện chưa tìm thấy nhân viên đang nhận tin. Bạn có thể để lại câu hỏi, shop sẽ kiểm tra sau.";
      await safeLog({ sessionId, user: req.user, role: "bot", content: reply, intent: "handoff_failed" });
      return res.status(404).json({ sessionId, reply });
    }

    const recentLogs = await ChatbotLog.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("role content createdAt");
    const history = recentLogs
      .reverse()
      .map((log) => `${log.role === "user" ? "Khách" : "Bot"}: ${log.content}`)
      .join("\n");

    const content = [
      "Khách cần nhân viên hỗ trợ từ chatbot.",
      "",
      `Nội dung mới: ${message}`,
      "",
      "Tóm tắt hội thoại:",
      history || "Chưa có lịch sử trước đó.",
    ].join("\n");

    await Message.create({
      sender: req.user._id,
      receiver: staff._id,
      content: "Khách cần tư vấn từ chatbot.",
    });

    const reply = `Mình đã chuyển nội dung cho ${staff.name}. Bạn có thể mở hộp thư để tiếp tục trao đổi trực tiếp.`;
    await safeLog({
      sessionId,
      user: req.user,
      role: "bot",
      content: reply,
      intent: "handoff_success",
      metadata: { action: "open_chat", contactId: staff._id.toString() },
      escalated: true,
      staffReceiver: staff._id,
    });

    return res.json({
      sessionId,
      reply,
      action: "open_chat",
      contactId: staff._id,
      staff,
      quickReplies: QUICK_REPLIES,
    });
  } catch (error) {
    next(error);
  }
};
