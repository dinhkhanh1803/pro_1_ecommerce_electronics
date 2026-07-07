import { randomUUID } from "node:crypto";
import Category from "../models/Category.js";
import Cart from "../models/Cart.js";
import ChatbotLog from "../models/ChatbotLog.js";
import Coupon from "../models/Coupon.js";
import Message from "../models/Message.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import { getSiteIntelligenceAnswer } from "../services/chatbotSiteKnowledge.js";

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
  "so",
  "sanh",
  "khac",
  "nhau",
  "nen",
  "chon",
  "cai",
  "nay",
  "do",
  "qua",
  "ben",
  "biet",
]);

const QUICK_REPLIES = [
  "T\u01b0 v\u1ea5n laptop theo nhu c\u1ea7u",
  "Ng\u00e2n s\u00e1ch d\u01b0\u1edbi 20 tri\u1ec7u",
  "So s\u00e1nh chi ti\u1ebft",
  "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n",
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
    keywords: ["pin trau", "pin lâu", "dung lau", "sac nhanh"],
    terms: ["pin", "battery", "mah", "sac nhanh", "fast charge"],
  },
];

const DETAIL_PREFERENCES = [
  {
    key: "thin_light",
    label: "mỏng nhẹ, dễ mang theo",
    keywords: ["mong nhe", "nhe", "di hoc", "di lam", "mang theo", "co dong"],
    terms: ["mong", "nhe", "slim", "ultrabook", "pin", "hoc tap"],
  },
  {
    key: "performance",
    label: "hiệu năng mạnh",
    keywords: ["cau hinh manh", "hieu nang", "manh", "da nhiem", "render", "lap trinh"],
    terms: ["i7", "i9", "ryzen 7", "ryzen 9", "rtx", "ram", "ssd", "pro"],
  },
  {
    key: "value",
    label: "giá tốt",
    keywords: ["giá tốt", "re", "tiet kiem", "dang tien", "p/p", "khong qua dat"],
    terms: ["sale", "khuyen mai", "giam", "student", "essential"],
  },
  {
    key: "battery",
    label: "pin lâu",
    keywords: ["pin lâu", "pin trau", "dung lau", "sac nhanh", "khong can sac nhieu"],
    terms: ["pin", "battery", "mah", "sac nhanh", "fast charge"],
  },
  {
    key: "display",
    label: "màn hình đẹp",
    keywords: ["màn hình đẹp", "oled", "2k", "4k", "mau dep", "tan so quet", "hz"],
    terms: ["oled", "ips", "2k", "4k", "hz", "144hz", "165hz"],
  },
];

const findMatchedPreferences = (normalizedMessage) =>
  DETAIL_PREFERENCES.filter((preference) =>
    preference.keywords.some((keyword) => normalizedMessage.includes(keyword)),
  );

const SUPPORT_QUICK_REPLIES = [
  "T\u00f4i c\u1ea7n laptop ch\u01a1i game",
  "T\u00f4i c\u1ea7n m\u00e1y v\u0103n ph\u00f2ng",
  "Ng\u00e2n s\u00e1ch d\u01b0\u1edbi 15 tri\u1ec7u",
  "Ch\u1ed1t gi\u00fap t\u00f4i",
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
  "còn hàng",
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
  "ram",
  "ssd",
  "hz",
  "mah",
  "sac",
  "phu kien",
  "mua kem",
  "tuong thich",
  "so sanh",
  "khac nhau",
];

const OUT_OF_SCOPE_REPLY =
  "D\u1ea1, ph\u1ea7n n\u00e0y m\u00ecnh ch\u01b0a h\u1ed7 tr\u1ee3 s\u00e2u. M\u00ecnh c\u00f3 th\u1ec3 t\u01b0 v\u1ea5n s\u1ea3n ph\u1ea9m, gi\u00e1, khuy\u1ebfn m\u00e3i, gi\u1ecf h\u00e0ng, \u0111\u01a1n h\u00e0ng, giao h\u00e0ng, b\u1ea3o h\u00e0nh ho\u1eb7c chuy\u1ec3n nh\u00e2n vi\u00ean. B\u1ea1n \u0111ang mu\u1ed1n mua s\u1ea3n ph\u1ea9m n\u00e0o, m\u00ecnh h\u1ed7 tr\u1ee3 ch\u1ecdn nhanh cho m\u00ecnh nh\u00e9?";

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

const getSalesDiscoveryReply = (categoryName = "s\u1ea3n ph\u1ea9m") =>
  "D\u1ea1, \u0111\u1ec3 m\u00ecnh t\u01b0 v\u1ea5n s\u00e1t nh\u01b0 nh\u00e2n vi\u00ean sale, b\u1ea1n cho m\u00ecnh xin th\u00eam 2 \u00fd nh\u00e9: b\u1ea1n d\u00f9ng " + categoryName + " cho nhu c\u1ea7u ch\u00ednh n\u00e0o v\u00e0 ng\u00e2n s\u00e1ch kho\u1ea3ng bao nhi\u00eau? C\u00f3 th\u00eam \u01b0u ti\u00ean nh\u01b0 pin l\u00e2u, m\u1ecfng nh\u1eb9, m\u00e0n h\u00ecnh \u0111\u1eb9p hay hi\u1ec7u n\u0103ng m\u1ea1nh th\u00ec m\u00ecnh l\u1ecdc chu\u1ea9n h\u01a1n.";

const getSalesClosingText = (product) => {
  if (!product) return "B\u1ea1n c\u00f3 th\u1ec3 n\u00f3i th\u00eam nhu c\u1ea7u, m\u00ecnh s\u1ebd l\u1ecdc l\u1ea1i cho s\u00e1t h\u01a1n.";
  const stockText = product.inStock ? "M\u1eabu n\u00e0y \u0111ang c\u00f2n h\u00e0ng, b\u1ea1n c\u00f3 th\u1ec3 b\u1ea5m Th\u00eam \u0111\u1ec3 gi\u1eef trong gi\u1ecf tr\u01b0\u1edbc." : "M\u1eabu n\u00e0y \u0111ang t\u1ea1m h\u1ebft h\u00e0ng, m\u00ecnh c\u00f3 th\u1ec3 g\u1ee3i \u00fd m\u1eabu thay th\u1ebf c\u00f2n h\u00e0ng.";
  return stockText + " N\u1ebfu b\u1ea1n c\u00f2n ph\u00e2n v\u00e2n, nh\u1eafn 'so s\u00e1nh chi ti\u1ebft' l\u00e0 m\u00ecnh \u0111\u1ed1i chi\u1ebfu ngay.";
};

const buildSalesReasonSentence = (product) => {
  if (!product?.reasons?.length) return "m\u1ee9c gi\u00e1 v\u00e0 t\u00ecnh tr\u1ea1ng h\u00e0ng kh\u00e1 d\u1ec5 ch\u1ed1t";
  return product.reasons.slice(0, 2).join(", ").toLowerCase();
};

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

const buildProductReasons = (product, criteria = {}, stats = {}) => {
  const reasons = [];
  const haystack = normalizeText(
    `${product.name} ${product.brand || ""} ${product.description || ""} ${product.category?.name || ""}`,
  );
  const stock = Number(product.totalVariantStock ?? product.stock ?? 0);
  const discount = Number(product.compareAtPrice || 0) - Number(product.price || 0);

  if (criteria.needProfile) reasons.push(`Phù hợp nhu cầu ${criteria.needProfile.label}`);

  (criteria.preferences || []).forEach((preference) => {
    const matched = preference.terms.some((term) => haystack.includes(normalizeText(term)));
    if (matched) reasons.push(`Hợp ưu tiên ${preference.label}`);
  });

  if (criteria.maxPrice && Number(product.price || 0) <= criteria.maxPrice) {
    reasons.push(`Nằm trong ngân sách ${formatMoney(criteria.maxPrice)}`);
  }
  if (stock > 0) reasons.push(`Còn ${stock} sản phẩm`);
  if (discount > 0) reasons.push(`Đang giảm ${formatMoney(discount)}`);
  if (Number(product.sales || 0) > 0) reasons.push(`Đã bán ${product.sales}`);
  if (stats.reviewCount > 0) reasons.push(`${stats.rating}/5 từ ${stats.reviewCount} đánh giá`);
  if (stats.reviewPros?.length) reasons.push("Kh\u00e1ch khen " + stats.reviewPros[0]);

  return [...new Set(reasons)].slice(0, 3);
};

const serializeProduct = (product, criteria = {}, stats = {}) => {
  const defaultVariant = getDefaultVariant(product);
  const priceAdd = Number(defaultVariant?.priceAdd || 0);
  const compareAtPrice = Number(product.compareAtPrice || 0);
  const finalPrice = Number(product.price || 0) + priceAdd;
  const discountPercent = compareAtPrice > finalPrice
    ? Math.round(((compareAtPrice - finalPrice) / compareAtPrice) * 100)
    : 0;

  return {
    id: product._id.toString(),
    name: product.name,
    brand: product.brand,
    price: finalPrice,
    basePrice: product.price,
    compareAtPrice: product.compareAtPrice,
    discountPercent,
    image: product.images?.[0] || "",
    stock: product.stock,
    inStock: Number(product.totalVariantStock ?? product.stock ?? 0) > 0,
    category: product.category?.name || "",
    sales: product.sales || 0,
    rating: stats.rating || null,
    reviewCount: stats.reviewCount || 0,
    reviewPros: stats.reviewPros || [],
    reviewCons: stats.reviewCons || [],
    reviewSummary: stats.reviewSummary || "",
    reasons: buildProductReasons(product, criteria, stats),
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

  if (criteria.preferences?.length) {
    score += criteria.preferences.reduce((total, preference) => {
      const hits = preference.terms.filter((term) => haystack.includes(normalizeText(term))).length;
      return total + hits * 2;
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
  const currentPreferences = findMatchedPreferences(normalizedMessage);
  const contextPreferences = findMatchedPreferences(normalizedContext);
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

  const currentOnlyInStock = /(còn hàng|san hang|co san|ton kho)/.test(normalizedMessage);
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
  const preferences = currentPreferences.length ? currentPreferences : canUseContext ? contextPreferences : [];
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
    preferences,
    tokens,
    current: {
      matchedCategory: currentCategory,
      needProfile: currentNeedProfile,
      preferences: currentPreferences,
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

const buildNeedQuickReplies = (categoryName = "s\u1ea3n ph\u1ea9m") => [
  categoryName + " ch\u01a1i game",
  categoryName + " v\u0103n ph\u00f2ng",
  categoryName + " \u0111\u1ed3 h\u1ecda",
  categoryName + " pin l\u00e2u",
  categoryName + " d\u01b0\u1edbi 15 tri\u1ec7u",
  "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n",
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
  preferences: (criteria.preferences || []).map((preference) => preference.key),
  tokens: criteria.tokens.slice(0, 8),
});

const shouldAskNeed = (message, criteria) => {
  const normalizedMessage = normalizeText(message);
  const isConsulting = /(tu van|goi y|nen mua|chon|phu hop|can mua|mua gi|loai nao)/.test(normalizedMessage);
  const hasSpecificProductSignal = (criteria.current?.tokens || []).length >= 2 || Boolean(criteria.brand);
  return isConsulting && criteria.matchedCategory && !criteria.needProfile && !hasSpecificProductSignal;
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


const SYSTEM_GUIDE_QUICK_REPLIES = [
  "H\u01b0\u1edbng d\u1eabn \u0111\u1eb7t h\u00e0ng",
  "M\u1edf gi\u1ecf h\u00e0ng",
  "C\u1eadp nh\u1eadt \u0111\u1ecba ch\u1ec9",
  "Xem \u0111\u01a1n h\u00e0ng",
  "S\u1ea3n ph\u1ea9m y\u00eau th\u00edch",
];

const getSystemGuideAnswer = (normalizedMessage) => {
  if (/(huong dan dat hang|cach dat hang|cach mua hang|mua hang nhu the nao|dat hang nhu the nao|quy trinh mua)/.test(normalizedMessage)) {
    return {
      intent: "shopping_guide",
      action: "open_products",
      reply: "\u0110\u1ec3 \u0111\u1eb7t h\u00e0ng, b\u1ea1n ch\u1ecdn s\u1ea3n ph\u1ea9m, xem bi\u1ebfn th\u1ec3 c\u00f2n h\u00e0ng, b\u1ea5m Th\u00eam v\u00e0o gi\u1ecf, m\u1edf gi\u1ecf h\u00e0ng, ki\u1ec3m tra s\u1ed1 l\u01b0\u1ee3ng/m\u00e3 gi\u1ea3m gi\u00e1 r\u1ed3i sang thanh to\u00e1n. \u1ede b\u01b0\u1edbc thanh to\u00e1n b\u1ea1n nh\u1eadp \u0111\u1ecba ch\u1ec9 nh\u1eadn h\u00e0ng v\u00e0 ch\u1ecdn COD, VNPay ho\u1eb7c MoMo n\u1ebfu \u0111\u01b0\u1ee3c h\u1ed7 tr\u1ee3.",
      quickReplies: ["M\u1edf gi\u1ecf h\u00e0ng", "C\u00f3 khuy\u1ebfn m\u00e3i n\u00e0o kh\u00f4ng?", "Ki\u1ec3m tra \u0111\u01a1n h\u00e0ng", "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n"],
    };
  }

  if (/(gio hang o dau|mo gio hang|xem gio hang|vao gio hang|kiem tra gio hang)/.test(normalizedMessage)) {
    return {
      intent: "cart_guide",
      action: "open_cart",
      reply: "B\u1ea1n c\u00f3 th\u1ec3 m\u1edf gi\u1ecf h\u00e0ng \u0111\u1ec3 xem s\u1ea3n ph\u1ea9m \u0111\u00e3 th\u00eam, ch\u1ec9nh s\u1ed1 l\u01b0\u1ee3ng, x\u00f3a s\u1ea3n ph\u1ea9m v\u00e0 nh\u1eadp m\u00e3 gi\u1ea3m gi\u00e1 tr\u01b0\u1edbc khi thanh to\u00e1n.",
      quickReplies: ["M\u1edf gi\u1ecf h\u00e0ng", "C\u00f3 khuy\u1ebfn m\u00e3i n\u00e0o kh\u00f4ng?", "H\u01b0\u1edbng d\u1eabn \u0111\u1eb7t h\u00e0ng"],
    };
  }

  if (/(thanh toan o dau|checkout|di den thanh toan|tien hanh thanh toan|hoan tat don)/.test(normalizedMessage)) {
    return {
      intent: "checkout_guide",
      action: "open_checkout",
      reply: "Sau khi c\u00f3 s\u1ea3n ph\u1ea9m trong gi\u1ecf, b\u1ea1n v\u00e0o trang thanh to\u00e1n \u0111\u1ec3 ki\u1ec3m tra \u0111\u1ecba ch\u1ec9, ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n, ph\u00ed ship v\u00e0 t\u1ed5ng ti\u1ec1n cu\u1ed1i c\u00f9ng tr\u01b0\u1edbc khi t\u1ea1o \u0111\u01a1n.",
      quickReplies: ["M\u1edf gi\u1ecf h\u00e0ng", "C\u00f3 khuy\u1ebfn m\u00e3i n\u00e0o kh\u00f4ng?", "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n"],
    };
  }

  if (/(dia chi|cap nhat thong tin|thong tin ca nhan|so dien thoai|profile|tai khoan cua toi)/.test(normalizedMessage)) {
    return {
      intent: "profile_guide",
      action: "open_profile",
      reply: "B\u1ea1n c\u00f3 th\u1ec3 c\u1eadp nh\u1eadt h\u1ecd t\u00ean, s\u1ed1 \u0111i\u1ec7n tho\u1ea1i v\u00e0 \u0111\u1ecba ch\u1ec9 trong trang H\u1ed3 s\u01a1. Th\u00f4ng tin n\u00e0y gi\u00fap b\u01b0\u1edbc thanh to\u00e1n v\u00e0 giao h\u00e0ng nhanh h\u01a1n.",
      quickReplies: ["M\u1edf h\u1ed3 s\u01a1", "Ki\u1ec3m tra \u0111\u01a1n h\u00e0ng", "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n"],
    };
  }

  if (/(yeu thich|wishlist|san pham da luu|danh sach yeu thich|luu san pham)/.test(normalizedMessage)) {
    return {
      intent: "wishlist_guide",
      action: "open_wishlist",
      reply: "Trang y\u00eau th\u00edch l\u01b0u c\u00e1c s\u1ea3n ph\u1ea9m b\u1ea1n quan t\u00e2m \u0111\u1ec3 xem l\u1ea1i sau. Khi t\u00ecm th\u1ea5y s\u1ea3n ph\u1ea9m ph\u00f9 h\u1ee3p, b\u1ea1n c\u00f3 th\u1ec3 m\u1edf chi ti\u1ebft ho\u1eb7c th\u00eam v\u00e0o gi\u1ecf.",
      quickReplies: ["M\u1edf y\u00eau th\u00edch", "S\u1ea3n ph\u1ea9m b\u00e1n ch\u1ea1y", "C\u00f3 khuy\u1ebfn m\u00e3i n\u00e0o kh\u00f4ng?"],
    };
  }

  if (/(huy don|huy hang|cancel order|khong muon mua nua)/.test(normalizedMessage)) {
    return {
      intent: "cancel_order_guide",
      action: "open_orders",
      reply: "B\u1ea1n c\u00f3 th\u1ec3 h\u1ee7y \u0111\u01a1n trong l\u1ecbch s\u1eed \u0111\u01a1n h\u00e0ng n\u1ebfu \u0111\u01a1n v\u1eabn \u1edf tr\u1ea1ng th\u00e1i ch\u1edd x\u00e1c nh\u1eadn ho\u1eb7c \u0111ang x\u1eed l\u00fd. N\u1ebfu \u0111\u01a1n \u0111\u00e3 giao cho v\u1eadn chuy\u1ec3n, b\u1ea1n n\u00ean li\u00ean h\u1ec7 nh\u00e2n vi\u00ean \u0111\u1ec3 \u0111\u01b0\u1ee3c h\u1ed7 tr\u1ee3.",
      quickReplies: ["M\u1edf l\u1ecbch s\u1eed \u0111\u01a1n h\u00e0ng", "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n", "Ch\u00ednh s\u00e1ch \u0111\u1ed5i tr\u1ea3"],
    };
  }

  if (/(danh gia|review|nhan xet|phan hoi san pham)/.test(normalizedMessage)) {
    return {
      intent: "review_guide",
      action: "open_orders",
      reply: "Sau khi mua h\u00e0ng, b\u1ea1n c\u00f3 th\u1ec3 v\u00e0o chi ti\u1ebft \u0111\u01a1n h\u00e0ng ho\u1eb7c trang s\u1ea3n ph\u1ea9m \u0111\u1ec3 g\u1eedi \u0111\u00e1nh gi\u00e1. \u0110\u00e1nh gi\u00e1 gi\u00fap shop v\u00e0 kh\u00e1ch kh\u00e1c hi\u1ec3u ch\u1ea5t l\u01b0\u1ee3ng s\u1ea3n ph\u1ea9m t\u1ed1t h\u01a1n.",
      quickReplies: ["M\u1edf \u0111\u01a1n h\u00e0ng", "T\u00ecm s\u1ea3n ph\u1ea9m kh\u00e1c", "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n"],
    };
  }

  if (/(web co gi|he thong co gi|chuc nang|su dung website|lam duoc gi tren web|trang nay co gi)/.test(normalizedMessage)) {
    return {
      intent: "system_capabilities",
      action: "open_products",
      reply: "H\u1ec7 th\u1ed1ng h\u1ed7 tr\u1ee3 t\u00ecm ki\u1ebfm s\u1ea3n ph\u1ea9m, l\u1ecdc theo danh m\u1ee5c/ng\u00e2n s\u00e1ch, gi\u1ecf h\u00e0ng, m\u00e3 gi\u1ea3m gi\u00e1, thanh to\u00e1n COD/VNPay/MoMo, theo d\u00f5i \u0111\u01a1n h\u00e0ng, y\u00eau th\u00edch s\u1ea3n ph\u1ea9m, \u0111\u00e1nh gi\u00e1 sau mua v\u00e0 nh\u1eafn tin v\u1edbi nh\u00e2n vi\u00ean khi c\u1ea7n.",
      quickReplies: SYSTEM_GUIDE_QUICK_REPLIES,
    };
  }

  return null;
};

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
        "D\u1ea1 ch\u00e0o b\u1ea1n, m\u00ecnh l\u00e0 tr\u1ee3 l\u00fd sale c\u1ee7a shop. B\u1ea1n c\u1ee9 n\u00f3i nhu c\u1ea7u, ng\u00e2n s\u00e1ch ho\u1eb7c m\u1eabu \u0111ang ph\u00e2n v\u00e2n, m\u00ecnh s\u1ebd l\u1ecdc h\u00e0ng, so s\u00e1nh v\u00e0 ch\u1ed1t ph\u01b0\u01a1ng \u00e1n ph\u00f9 h\u1ee3p nh\u1ea5t cho b\u1ea1n.",
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

const POSITIVE_REVIEW_SIGNALS = [
  { label: "pin \u1ed5n", terms: ["pin lau", "pin trau", "pin tot", "dung lau", "thoi luong pin"] },
  { label: "m\u00e0n h\u00ecnh \u0111\u1eb9p", terms: ["man hinh dep", "man dep", "hien thi dep", "mau dep", "sac net", "muot"] },
  { label: "hi\u1ec7u n\u0103ng m\u01b0\u1ee3t", terms: ["may muot", "chay muot", "nhanh", "hieu nang tot", "choi game tot", "khong lag"] },
  { label: "gi\u00e1 \u0111\u00e1ng ti\u1ec1n", terms: ["dang tien", "gia tot", "hop gia", "re", "p/p", "khuyen mai"] },
  { label: "thi\u1ebft k\u1ebf \u0111\u1eb9p", terms: ["dep", "sang", "mong nhe", "nhe", "cam chac", "hoan thien tot"] },
  { label: "giao h\u00e0ng/\u0111\u00f3ng g\u00f3i t\u1ed1t", terms: ["giao nhanh", "dong goi ky", "dong goi tot", "nguyen seal", "ship nhanh"] },
];

const NEGATIVE_REVIEW_SIGNALS = [
  { label: "m\u00e1y h\u01a1i n\u00f3ng", terms: ["nong", "nhiet", "qua nhiet", "tan nhiet", "nong may"] },
  { label: "pin ch\u01b0a \u1ed5n", terms: ["pin yeu", "hao pin", "pin nhanh het", "pin kem", "tut pin"] },
  { label: "c\u00f3 l\u00fac lag/ch\u1eadm", terms: ["lag", "cham", "giat", "treo", "khong muot"] },
  { label: "m\u00e0n h\u00ecnh ch\u01b0a \u01b0ng \u00fd", terms: ["man toi", "man hinh toi", "am mau", "le sang", "soc man"] },
  { label: "giao h\u00e0ng ch\u01b0a t\u1ed1t", terms: ["giao cham", "ship cham", "mop hop", "vo hop", "dong goi kem"] },
  { label: "c\u00f3 ph\u1ea3n h\u1ed3i l\u1ed7i", terms: ["loi", "doi tra", "bao hanh", "hong", "khong nhan", "khong len"] },
  { label: "h\u01a1i n\u1eb7ng", terms: ["nang", "hoi nang", "cong kenh"] },
];

const scoreReviewSignals = (comments, signals) => {
  const scores = new Map();
  comments.forEach((item) => {
    const normalizedComment = normalizeText(item.comment || "");
    signals.forEach((signal) => {
      if (!signal.terms.some((term) => normalizedComment.includes(normalizeText(term)))) return;
      scores.set(signal.label, (scores.get(signal.label) || 0) + 1);
    });
  });

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "vi"))
    .slice(0, 3)
    .map(([label]) => label);
};

const analyzeReviewComments = (comments = []) => {
  const validComments = comments.filter((item) => String(item.comment || "").trim());
  const pros = scoreReviewSignals(validComments, POSITIVE_REVIEW_SIGNALS);
  const cons = scoreReviewSignals(validComments, NEGATIVE_REVIEW_SIGNALS);

  const positiveCount = validComments.filter((item) => Number(item.rating || 0) >= 4).length;
  const negativeCount = validComments.filter((item) => Number(item.rating || 0) <= 2).length;
  if (pros.length === 0 && positiveCount > 0) pros.push("nhi\u1ec1u kh\u00e1ch \u0111\u00e1nh gi\u00e1 t\u00edch c\u1ef1c");
  if (cons.length === 0 && negativeCount > 0) cons.push("c\u00f3 \u0111\u00e1nh gi\u00e1 ch\u01b0a h\u00e0i l\u00f2ng");

  const summaryParts = [];
  if (pros.length) summaryParts.push("Kh\u00e1ch hay khen " + pros.slice(0, 2).join(", "));
  if (cons.length) summaryParts.push("l\u01b0u \u00fd " + cons.slice(0, 2).join(", "));
  return {
    reviewPros: pros,
    reviewCons: cons,
    reviewSummary: summaryParts.length ? summaryParts.join("; ") + "." : "",
  };
};

const getReviewStatsMap = async (products) => {
  if (!products.length) return {};
  const ids = products.map((product) => product._id);
  const [stats, reviewComments] = await Promise.all([
    Review.aggregate([
      { $match: { product: { $in: ids } } },
      {
        $group: {
          _id: "$product",
          rating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]),
    Review.find({ product: { $in: ids } })
      .select("product rating comment createdAt")
      .sort({ createdAt: -1 })
      .limit(Math.max(ids.length * 12, 24)),
  ]);

  const commentsByProduct = reviewComments.reduce((map, review) => {
    const key = review.product?.toString();
    if (!key) return map;
    if (!map[key]) map[key] = [];
    map[key].push({ rating: review.rating, comment: review.comment || "" });
    return map;
  }, {});

  return stats.reduce((map, item) => {
    const key = item._id.toString();
    map[key] = {
      rating: Math.round(Number(item.rating || 0) * 10) / 10,
      reviewCount: item.reviewCount,
      ...analyzeReviewComments(commentsByProduct[key] || []),
    };
    return map;
  }, {});
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

  const selectedProducts = withScores.slice(0, 4).map(({ product }) => product);
  const reviewStats = await getReviewStatsMap(selectedProducts);
  return selectedProducts.map((product) =>
    serializeProduct(product, criteria, reviewStats[product._id.toString()] || {}),
  );
};

const buildProductReply = (products, criteria) => {
  if (products.length === 0) {
    return "D\u1ea1, m\u00ecnh ch\u01b0a th\u1ea5y m\u1eabu n\u00e0o kh\u1edbp \u0111\u1ee7 v\u1edbi y\u00eau c\u1ea7u hi\u1ec7n t\u1ea1i. B\u1ea1n cho m\u00ecnh xin th\u00eam kho\u1ea3ng gi\u00e1, th\u01b0\u01a1ng hi\u1ec7u ho\u1eb7c nhu c\u1ea7u ch\u00ednh, v\u00ed d\u1ee5: laptop gaming d\u01b0\u1edbi 20 tri\u1ec7u, m\u00ecnh s\u1ebd l\u1ecdc l\u1ea1i ngay.";
  }

  const parts = ["D\u1ea1, m\u00ecnh \u0111\u00e3 l\u1ecdc cho b\u1ea1n m\u1ed9t v\u00e0i l\u1ef1a ch\u1ecdn \u0111\u00e1ng xem"];
  if (criteria.needProfile) parts.push("cho nhu c\u1ea7u " + criteria.needProfile.label);
  if (criteria.preferences?.length) {
    parts.push("\u01b0u ti\u00ean " + criteria.preferences.map((item) => item.label).join(", "));
  }
  if (criteria.maxPrice) parts.push("trong t\u1ea7m " + formatMoney(criteria.maxPrice));
  if (criteria.brand) parts.push("c\u1ee7a " + criteria.brand);
  if (criteria.onlyInStock) parts.push("v\u00e0 \u01b0u ti\u00ean h\u00e0ng c\u00f3 s\u1eb5n");

  const topProduct = products[0];
  const reasonText = topProduct
    ? " M\u1eabu m\u00ecnh \u0111\u1ec1 xu\u1ea5t xem tr\u01b0\u1edbc l\u00e0 " + topProduct.name + " v\u00ec " + buildSalesReasonSentence(topProduct) + "."
    : "";

  return (parts.join(" ") + "." + reasonText + " " + getSalesClosingText(topProduct)).replace(" .", ".");
};

const getLastProductSuggestions = async (sessionId) => {
  const log = await ChatbotLog.findOne({
    sessionId,
    "metadata.products.0": { $exists: true },
  })
    .sort({ createdAt: -1 })
    .select("metadata.products metadata.criteria");

  return {
    products: Array.isArray(log?.metadata?.products) ? log.metadata.products : [],
    criteria: log?.metadata?.criteria || null,
  };
};

const FOLLOW_UP_TOKENS = new Set([
  "so",
  "sanh",
  "chi",
  "tiet",
  "chon",
  "cai",
  "nao",
  "hon",
  "phan",
  "van",
  "chot",
  "giup",
  "toi",
  "minh",
  "lay",
  "mua",
]);

const hasCurrentSpecificSignal = (criteria) => {
  const current = criteria.current || {};
  if (current.matchedCategory || current.needProfile || current.brand || current.minPrice || current.maxPrice || current.onlyInStock) return true;
  return (current.tokens || []).some((token) => token.length >= 3 && !FOLLOW_UP_TOKENS.has(token));
};

const isDecisionQuestion = (normalizedMessage) =>
  /(phan van|dang phan van|nen chon|chon cai nao|lay cai nao|mua cai nao|chot giup|quyet giup|co nen mua)/.test(normalizedMessage);

const isCompareQuestion = (normalizedMessage) =>
  /(so sanh|khac nhau|cai nao hon|hon nhau|doi chieu)/.test(normalizedMessage);

const getProductSellingPoints = (product) => {
  const points = [];
  if (product.discountPercent > 0) points.push("\u0110ang gi\u1ea3m " + product.discountPercent + "%");
  if (product.rating) points.push(product.rating + "/5 t\u1eeb " + (product.reviewCount || 0) + " \u0111\u00e1nh gi\u00e1");
  if (product.reviewPros?.length) points.push(...product.reviewPros.slice(0, 2).map((item) => "Kh\u00e1ch khen " + item));
  if (product.inStock) points.push("C\u00f2n h\u00e0ng, c\u00f3 th\u1ec3 ch\u1ed1t nhanh");
  if (Number(product.sales || 0) > 0) points.push("\u0110\u00e3 b\u00e1n " + product.sales);
  if (product.reasons?.length) points.push(...product.reasons.slice(0, 2));
  return [...new Set(points)].slice(0, 4);
};

const getProductCaution = (product, products) => {
  const cheapest = [...products].sort((a, b) => a.price - b.price)[0];
  if (product.reviewCons?.length) return "Review l\u01b0u \u00fd: " + product.reviewCons.slice(0, 2).join(", ");
  if (!product.inStock) return "T\u1ea1m h\u1ebft h\u00e0ng, n\u00ean ch\u1ecdn m\u1eabu kh\u00e1c n\u1ebfu c\u1ea7n mua ngay";
  if (cheapest && product.id !== cheapest.id && product.price > cheapest.price) return "Gi\u00e1 cao h\u01a1n l\u1ef1a ch\u1ecdn ti\u1ebft ki\u1ec7m";
  if (!product.rating) return "Ch\u01b0a c\u00f3 nhi\u1ec1u \u0111\u00e1nh gi\u00e1 \u0111\u1ec3 \u0111\u1ed1i chi\u1ebfu";
  return "Kh\u00f4ng c\u00f3 \u0111i\u1ec3m tr\u1eeb l\u1edbn theo d\u1eef li\u1ec7u hi\u1ec7n t\u1ea1i";
};

const inferBestFor = (product, criteria, index) => {
  const reasonText = normalizeText((product.reasons || []).join(" ") + " " + product.name + " " + (product.category || ""));
  if (criteria.needProfile?.label) return "Ph\u00f9 h\u1ee3p nh\u1ea5t cho nhu c\u1ea7u " + criteria.needProfile.label;
  if (reasonText.includes("gaming") || reasonText.includes("game") || reasonText.includes("rtx")) return "Ph\u00f9 h\u1ee3p khi \u01b0u ti\u00ean hi\u1ec7u n\u0103ng/ch\u01a1i game";
  if (reasonText.includes("pin") || reasonText.includes("mong") || reasonText.includes("nhe")) return "Ph\u00f9 h\u1ee3p khi c\u1ea7n mang theo v\u00e0 d\u00f9ng l\u00e2u";
  if (product.discountPercent > 0 || index === 0) return "Ph\u00f9 h\u1ee3p khi mu\u1ed1n gi\u00e1 t\u1ed1t v\u00e0 d\u1ec5 ch\u1ed1t";
  return "Ph\u00f9 h\u1ee3p \u0111\u1ec3 so s\u00e1nh th\u00eam v\u1ec1 gi\u00e1 v\u00e0 t\u00ednh n\u0103ng";
};

const buildComparisonPayload = (products, criteria = {}, mode = "compare") => {
  const compared = products.slice(0, 3);
  const cheapest = [...compared].sort((a, b) => a.price - b.price)[0];
  const bestRated = [...compared].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))[0];
  const bestStock = [...compared].sort((a, b) => Number(b.stock || 0) - Number(a.stock || 0))[0];
  const bestDiscount = [...compared].sort((a, b) => Number(b.discountPercent || 0) - Number(a.discountPercent || 0))[0];

  const winner = bestRated?.rating ? bestRated : bestDiscount?.discountPercent ? bestDiscount : cheapest || compared[0];
  const reasonParts = [];
  if (winner?.id === cheapest?.id) reasonParts.push("gi\u00e1 t\u1ed1t nh\u1ea5t");
  if (winner?.id === bestRated?.id && bestRated?.rating) reasonParts.push("\u0111\u00e1nh gi\u00e1 t\u1ed1t");
  if (winner?.id === bestStock?.id && Number(bestStock?.stock || 0) > 0) reasonParts.push("t\u1ed3n kho t\u1ed1t");
  if (winner?.id === bestDiscount?.id && bestDiscount?.discountPercent) reasonParts.push("\u01b0u \u0111\u00e3i m\u1ea1nh");

  return {
    title: mode === "decision" ? "Ch\u1ed1t l\u1ef1a ch\u1ecdn" : "So s\u00e1nh chi ti\u1ebft",
    rows: compared.map((product, index) => ({
      productId: product.id,
      name: product.name,
      priceLabel: formatMoney(product.price),
      stockLabel: product.inStock ? "C\u00f2n h\u00e0ng" + (product.stock ? " (" + product.stock + ")" : "") : "T\u1ea1m h\u1ebft h\u00e0ng",
      ratingLabel: product.rating ? product.rating + "/5 (" + (product.reviewCount || 0) + ")" : "Ch\u01b0a c\u00f3 \u0111\u00e1nh gi\u00e1",
      discountLabel: product.discountPercent > 0 ? "Gi\u1ea3m " + product.discountPercent + "%" : "Ch\u01b0a c\u00f3 gi\u1ea3m gi\u00e1",
      bestFor: inferBestFor(product, criteria, index),
      sellingPoints: getProductSellingPoints(product),
      caution: getProductCaution(product, compared),
      reviewPros: product.reviewPros || [],
      reviewCons: product.reviewCons || [],
    })),
    winner: winner
      ? {
          productId: winner.id,
          name: winner.name,
          reason: reasonParts.length ? reasonParts.join(", ") : "c\u00e2n b\u1eb1ng gi\u00e1 v\u00e0 kh\u1ea3 n\u0103ng mua ngay",
          cta: "N\u1ebfu \u01b0ng m\u1eabu n\u00e0y, b\u1ea1n c\u00f3 th\u1ec3 b\u1ea5m Th\u00eam \u0111\u1ec3 gi\u1eef h\u00e0ng trong gi\u1ecf.",
        }
      : null,
  };
};

const buildComparisonAnswer = (products, comparison) => {
  if (!comparison?.rows?.length) return "D\u1ea1, m\u00ecnh ch\u01b0a \u0111\u1ee7 d\u1eef li\u1ec7u \u0111\u1ec3 so s\u00e1nh chi ti\u1ebft. B\u1ea1n g\u1eedi th\u00eam t\u00ean 2 m\u1eabu mu\u1ed1n so s\u00e1nh gi\u00fap m\u00ecnh nh\u00e9.";
  const lines = comparison.rows.map((row, index) =>
    String(index + 1) + ". " + row.name + ": " + row.priceLabel + ", " + row.stockLabel + ", " + row.ratingLabel + ", " + row.discountLabel + ". " + row.bestFor + ".",
  );
  const winnerText = comparison.winner
    ? " N\u1ebfu \u0111\u1ec3 m\u00ecnh t\u01b0 v\u1ea5n theo ki\u1ec3u ch\u1ed1t \u0111\u01a1n, m\u00ecnh nghi\u00eang v\u1ec1 " + comparison.winner.name + " v\u00ec " + comparison.winner.reason + "."
    : "";
  return "D\u1ea1, m\u00ecnh so s\u00e1nh nhanh theo g\u00f3c nh\u00ecn mua h\u00e0ng th\u1ef1c t\u1ebf: " + lines.join(" | ") + winnerText + " B\u1ea1n mu\u1ed1n m\u00ecnh ch\u1ed1t h\u1eb3n m\u1ed9t m\u1eabu theo ng\u00e2n s\u00e1ch kh\u00f4ng?";
};

const buildDecisionReply = (comparison) => {
  if (!comparison?.winner) return "D\u1ea1, m\u00ecnh c\u1ea7n th\u00eam \u00edt nh\u1ea5t 2 l\u1ef1a ch\u1ecdn \u0111\u1ec3 ch\u1ed1t gi\u00fap b\u1ea1n ch\u00ednh x\u00e1c h\u01a1n.";
  const runner = comparison.rows.find((row) => row.productId !== comparison.winner.productId);
  const runnerText = runner ? " N\u1ebfu b\u1ea1n mu\u1ed1n ph\u01b0\u01a1ng \u00e1n d\u1ef1 ph\u00f2ng, " + runner.name + " c\u0169ng \u0111\u00e1ng xem, nh\u01b0ng m\u00ecnh s\u1ebd \u0111\u1ec3 n\u00f3 \u1edf l\u1ef1a ch\u1ecdn s\u1ed1 2." : "";
  return "D\u1ea1, n\u1ebfu \u0111\u1ec3 m\u00ecnh ch\u1ed1t theo vai tr\u00f2 nh\u00e2n vi\u00ean sale th\u00ec m\u00ecnh ch\u1ecdn " + comparison.winner.name + " cho b\u1ea1n. L\u00fd do l\u00e0 " + comparison.winner.reason + ". " + comparison.winner.cta + runnerText;
};

const getCompareAnswer = async (sessionId, criteria) => {
  const last = await getLastProductSuggestions(sessionId);
  let products = !hasCurrentSpecificSignal(criteria) && last.products.length >= 2 ? last.products : [];

  if (products.length < 2) {
    const searchedProducts = await searchProducts(criteria);
    products = searchedProducts.length >= 2 ? searchedProducts : last.products;
  }

  if (products.length < 2) {
    return {
      reply: "M\u00ecnh c\u1ea7n \u00edt nh\u1ea5t 2 s\u1ea3n ph\u1ea9m \u0111\u1ec3 so s\u00e1nh. B\u1ea1n g\u1eedi t\u00ean hai s\u1ea3n ph\u1ea9m ho\u1eb7c h\u1ecfi m\u00ecnh t\u00ecm m\u1ed9t nh\u00f3m s\u1ea3n ph\u1ea9m tr\u01b0\u1edbc nh\u00e9.",
      products: [],
      comparison: null,
      quickReplies: ["Laptop d\u01b0\u1edbi 20 tri\u1ec7u", "S\u1ea3n ph\u1ea9m b\u00e1n ch\u1ea1y", "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n"],
    };
  }

  const comparison = buildComparisonPayload(products, criteria, "compare");
  return {
    reply: buildComparisonAnswer(products, comparison),
    products: products.slice(0, 3),
    comparison,
    quickReplies: ["Ch\u1ed1t gi\u00fap t\u00f4i", "R\u1ebb h\u01a1n n\u1eefa", "G\u1ee3i \u00fd mua k\u00e8m", "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n"],
  };
};

const getDecisionAnswer = async (sessionId, criteria) => {
  const last = await getLastProductSuggestions(sessionId);
  let products = last.products.length >= 2 ? last.products : [];

  if (products.length < 2) {
    const searchedProducts = await searchProducts({ ...criteria, sort: criteria.sort || "relevance" });
    products = searchedProducts.length >= 2 ? searchedProducts : [];
  }

  if (products.length < 2) {
    return {
      reply: "M\u00ecnh ch\u01b0a \u0111\u1ee7 l\u1ef1a ch\u1ecdn \u0111\u1ec3 ch\u1ed1t. B\u1ea1n cho m\u00ecnh bi\u1ebft nhu c\u1ea7u ch\u00ednh v\u00e0 ng\u00e2n s\u00e1ch, ho\u1eb7c g\u1eedi 2 m\u1eabu b\u1ea1n \u0111ang ph\u00e2n v\u00e2n nh\u00e9.",
      products: [],
      comparison: null,
      quickReplies: buildNeedQuickReplies(criteria.matchedCategory?.name || "s\u1ea3n ph\u1ea9m"),
    };
  }

  const comparison = buildComparisonPayload(products, criteria, "decision");
  return {
    reply: buildDecisionReply(comparison),
    products: products.slice(0, 3),
    comparison,
    quickReplies: ["So s\u00e1nh chi ti\u1ebft", "R\u1ebb h\u01a1n n\u1eefa", "G\u1ee3i \u00fd mua k\u00e8m", "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n"],
  };
};

const isAccessoryQuestion = (normalizedMessage) =>
  /(phu kien|mua kem|di kem|tuong thich|combo|op lung|cuong luc|balo|the nho)/.test(normalizedMessage);

const getAccessoryTerms = (product) => {
  const text = normalizeText(`${product?.name || ""} ${product?.category || ""}`);
  if (/(laptop|may tinh|pc|macbook)/.test(text)) return ["chuot", "ban phim", "tai nghe", "balo", "sac"];
  if (/(dien thoai|phone|iphone|samsung|xiaomi|oppo)/.test(text)) return ["op lung", "cuong luc", "sac", "tai nghe", "cap"];
  if (/(camera|may anh)/.test(text)) return ["the nho", "chan may", "tui", "pin", "lens"];
  return ["tai nghe", "sac", "cap", "chuot", "phu kien"];
};

const getAccessoryAnswer = async (sessionId) => {
  const last = await getLastProductSuggestions(sessionId);
  const baseProduct = last.products[0];
  const terms = getAccessoryTerms(baseProduct);
  const regexes = terms.map((term) => new RegExp(escapeRegex(term), "i"));
  const categories = await Category.find({
    $or: [{ name: { $in: regexes } }, { slug: { $in: regexes } }],
  }).select("_id");

  const products = await Product.find({
    status: "active",
    ...(baseProduct?.id ? { _id: { $ne: baseProduct.id } } : {}),
    $or: [
      { name: { $in: regexes } },
      { description: { $in: regexes } },
      ...(categories.length ? [{ category: { $in: categories.map((item) => item._id) } }] : []),
    ],
  })
    .populate("category", "name slug")
    .sort({ sales: -1, createdAt: -1 })
    .limit(4);

  const reviewStats = await getReviewStatsMap(products);
  const serialized = products.map((product) =>
    serializeProduct(product, {}, reviewStats[product._id.toString()] || {}),
  );

  return {
    reply: serialized.length
      ? `Mình gợi ý vài món mua kèm${baseProduct ? ` cho ${baseProduct.name}` : ""}: ${terms.slice(0, 3).join(", ")} .`.replace(" .", ".")
      : "Mình chưa thấy phụ kiện mua kèm phù hợp trong dữ liệu hiện tại. Bạn có thể hỏi cụ thể như chuột, tai nghe, sạc hoặc ốp lưng.",
    products: serialized,
    quickReplies: ["Tìm sản phẩm khác", "Có khuyến mãi nào không?", "Gặp nhân viên tư vấn"],
  };
};

const isCartQuestion = (normalizedMessage) =>
  /(gio hang|cart|trong gio|da them|gio cua toi|kiem tra gio)/.test(normalizedMessage);

const getCartAnswer = async (user) => {
  if (!user?._id) {
    return {
      reply: "Bạn cần đăng nhập để mình kiểm tra giỏ hàng đã lưu trên tài khoản. Nếu đang dùng giỏ khách, bạn có thể mở trang giỏ hàng để xem ngay trên máy này.",
      action: "open_cart",
      quickReplies: ["Đăng nhập", "Tìm sản phẩm khác", "Gặp nhân viên tư vấn"],
    };
  }

  const cart = await Cart.findOne({ user: user._id }).populate({
    path: "items.product",
    select: "name price images variants status stock",
  });

  const items = (cart?.items || []).filter((item) => item.product);
  if (!items.length) {
    return {
      reply: "Giỏ hàng của bạn đang trống. Bạn nói nhu cầu hoặc ngân sách, mình sẽ gợi ý sản phẩm phù hợp để thêm vào giỏ.",
      action: "open_cart",
      quickReplies: ["Laptop dưới 20 triệu", "Sản phẩm bán chạy", "Có khuyến mãi nào không?"],
    };
  }

  const summaries = items.slice(0, 4).map((item) => {
    const variant = item.product.variants?.find((variantItem) => variantItem.name === item.variantName);
    const price = Number(item.product.price || 0) + Number(variant?.priceAdd || 0);
    return `${item.quantity} x ${item.product.name} (${formatMoney(price)})`;
  });
  const total = items.reduce((sum, item) => {
    const variant = item.product.variants?.find((variantItem) => variantItem.name === item.variantName);
    const price = Number(item.product.price || 0) + Number(variant?.priceAdd || 0);
    return sum + price * Number(item.quantity || 1);
  }, 0);

  return {
    reply: `Giỏ hàng của bạn có ${items.length} dòng sản phẩm: ${summaries.join("; ")} . Tạm tính ${formatMoney(total)}.`.replace(" .", "."),
    action: "open_cart",
    quickReplies: ["Mở giỏ hàng", "Có khuyến mãi nào không?", "Gợi ý mua kèm"],
  };
};

const isPriceObjection = (normalizedMessage) =>
  /(dat qua|mac qua|cao qua|qua ngan sach|re hon|re hon nua|gia thap hon|tiet kiem hon)/.test(normalizedMessage);

const getPriceObjectionAnswer = async (sessionId, criteria) => {
  const last = await getLastProductSuggestions(sessionId);
  const lastPrices = last.products.map((product) => Number(product.price || 0)).filter(Boolean);
  const nextCriteria = {
    ...criteria,
    sort: "cheapest",
    maxPrice: criteria.maxPrice || (lastPrices.length ? Math.max(1, Math.min(...lastPrices) - 1) : null),
  };
  const products = await searchProducts(nextCriteria);

  return {
    reply: products.length
      ? "D\u1ea1 \u0111\u00fang r\u1ed3i, n\u1ebfu m\u00ecnh \u0111\u1eb7t vai tr\u00f2 canh ng\u00e2n s\u00e1ch cho b\u1ea1n th\u00ec m\u00ecnh s\u1ebd h\u1ea1 ti\u00eau ch\u00ed gi\u00e1 xu\u1ed1ng m\u1ed9t n\u1ea5c. M\u1eabu \u0111\u00e1ng xem tr\u01b0\u1edbc l\u00e0 " + products[0].name + " \u1edf m\u1ee9c " + formatMoney(products[0].price) + ". B\u1ea1n v\u1eabn c\u00f3 th\u1ec3 so s\u00e1nh v\u1edbi m\u1eabu tr\u01b0\u1edbc \u0111\u1ec3 xem ph\u1ea7n ch\u00eanh c\u00f3 \u0111\u00e1ng th\u00eam ti\u1ec1n kh\u00f4ng."
      : "D\u1ea1, m\u00ecnh ch\u01b0a th\u1ea5y l\u1ef1a ch\u1ecdn r\u1ebb h\u01a1n m\u00e0 v\u1eabn kh\u1edbp ti\u00eau ch\u00ed tr\u01b0\u1edbc \u0111\u00f3. H\u01b0\u1edbng h\u1ee3p l\u00fd l\u00e0 b\u1ea1n t\u0103ng ng\u00e2n s\u00e1ch m\u1ed9t ch\u00fat ho\u1eb7c cho m\u00ecnh b\u1ecf b\u1edbt m\u1ed9t y\u00eau c\u1ea7u nh\u01b0 th\u01b0\u01a1ng hi\u1ec7u/t\u00ednh n\u0103ng.",
    products,
    quickReplies: ["D\u01b0\u1edbi 10 tri\u1ec7u", "So s\u00e1nh chi ti\u1ebft", "Ch\u1ed1t gi\u00fap t\u00f4i", "G\u1eb7p nh\u00e2n vi\u00ean t\u01b0 v\u1ea5n"],
  };
};

const toChatMessage = (log) => ({
  id: log._id,
  role: log.role === "user" ? "user" : "bot",
  text: log.content,
  products: log.metadata?.products || [],
  action: log.metadata?.action,
  contactId: log.metadata?.contactId,
  comparison: log.metadata?.comparison || null,
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

export const clearChatbotHistory = async (req, res, next) => {
  try {
    const sessionId = getSessionId(req);
    const filter = req.user?._id
      ? { $or: [{ sessionId }, { user: req.user._id }] }
      : { sessionId };

    const result = await ChatbotLog.deleteMany(filter);

    res.json({
      sessionId,
      deletedCount: result.deletedCount || 0,
      message: "Chatbot history cleared",
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
      const helpAnswer =
        (await getSiteIntelligenceAnswer({ message, normalizedMessage, user: req.user })) || getHelpAnswer();
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: helpAnswer.reply,
        intent: helpAnswer.intent || "help",
        metadata: helpAnswer.metadata || {},
      });
      return res.json({
        sessionId,
        intent: helpAnswer.intent || "help",
        action: helpAnswer.action,
        reply: helpAnswer.reply,
        products: helpAnswer.products || [],
        coupons: helpAnswer.coupons || [],
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

    if (isCartQuestion(normalizedMessage)) {
      const cartAnswer = await getCartAnswer(req.user);
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: cartAnswer.reply,
        intent: "cart_lookup",
        metadata: { action: cartAnswer.action },
      });
      return res.json({
        sessionId,
        intent: "cart_lookup",
        action: cartAnswer.action,
        reply: cartAnswer.reply,
        products: [],
        coupons: [],
        quickReplies: cartAnswer.quickReplies,
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

    const siteIntelligenceAnswer = await getSiteIntelligenceAnswer({ message, normalizedMessage, user: req.user });
    if (siteIntelligenceAnswer) {
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: siteIntelligenceAnswer.reply,
        intent: siteIntelligenceAnswer.intent,
        metadata: {
          ...(siteIntelligenceAnswer.metadata || {}),
          action: siteIntelligenceAnswer.action,
        },
      });
      return res.json({
        sessionId,
        intent: siteIntelligenceAnswer.intent,
        action: siteIntelligenceAnswer.action,
        reply: siteIntelligenceAnswer.reply,
        products: siteIntelligenceAnswer.products || [],
        coupons: siteIntelligenceAnswer.coupons || [],
        quickReplies: siteIntelligenceAnswer.quickReplies,
      });
    }
    const systemGuideAnswer = getSystemGuideAnswer(normalizedMessage);
    if (systemGuideAnswer) {
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: systemGuideAnswer.reply,
        intent: systemGuideAnswer.intent,
        metadata: { action: systemGuideAnswer.action },
      });
      return res.json({
        sessionId,
        intent: systemGuideAnswer.intent,
        action: systemGuideAnswer.action,
        reply: systemGuideAnswer.reply,
        products: [],
        coupons: [],
        quickReplies: systemGuideAnswer.quickReplies,
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

    if (isDecisionQuestion(normalizedMessage)) {
      const decisionAnswer = await getDecisionAnswer(sessionId, criteria);
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: decisionAnswer.reply,
        intent: "sales_decision",
        products: decisionAnswer.products,
        metadata: { products: decisionAnswer.products, comparison: decisionAnswer.comparison, criteria: summarizeCriteria(criteria) },
      });
      return res.json({
        sessionId,
        intent: "sales_decision",
        reply: decisionAnswer.reply,
        products: decisionAnswer.products,
        comparison: decisionAnswer.comparison,
        coupons: [],
        quickReplies: decisionAnswer.quickReplies,
      });
    }

    if (isCompareQuestion(normalizedMessage)) {
      const compareAnswer = await getCompareAnswer(sessionId, criteria);
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: compareAnswer.reply,
        intent: "product_compare",
        products: compareAnswer.products,
        metadata: { products: compareAnswer.products, comparison: compareAnswer.comparison, criteria: summarizeCriteria(criteria) },
      });
      return res.json({
        sessionId,
        intent: "product_compare",
        reply: compareAnswer.reply,
        products: compareAnswer.products,
        comparison: compareAnswer.comparison,
        coupons: [],
        quickReplies: compareAnswer.quickReplies,
      });
    }

    if (isAccessoryQuestion(normalizedMessage)) {
      const accessoryAnswer = await getAccessoryAnswer(sessionId);
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: accessoryAnswer.reply,
        intent: "accessory_recommendation",
        products: accessoryAnswer.products,
        metadata: { products: accessoryAnswer.products },
      });
      return res.json({
        sessionId,
        intent: "accessory_recommendation",
        reply: accessoryAnswer.reply,
        products: accessoryAnswer.products,
        coupons: [],
        quickReplies: accessoryAnswer.quickReplies,
      });
    }

    if (isPriceObjection(normalizedMessage)) {
      const priceAnswer = await getPriceObjectionAnswer(sessionId, criteria);
      await safeLog({
        sessionId,
        user: req.user,
        role: "bot",
        content: priceAnswer.reply,
        intent: "price_objection",
        products: priceAnswer.products,
        metadata: { products: priceAnswer.products, criteria: summarizeCriteria(criteria) },
      });
      return res.json({
        sessionId,
        intent: "price_objection",
        reply: priceAnswer.reply,
        products: priceAnswer.products,
        coupons: [],
        quickReplies: priceAnswer.quickReplies,
      });
    }

    if (shouldAskNeed(message, criteria)) {
      const categoryName = criteria.matchedCategory?.name || "sản phẩm";
      const reply = getSalesDiscoveryReply(categoryName);
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
      content,
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
