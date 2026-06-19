import Product from "../models/Product.js";
import Review from "../models/Review.js";

const normalizeVariants = (variants = []) => {
  if (!Array.isArray(variants)) return [];
  return variants
    .map((variant) => ({
      name: String(variant?.name || "").trim(),
      priceAdd: Number(variant?.priceAdd) || 0,
      stock: Math.max(0, Number(variant?.stock) || 0),
    }))
    .filter((variant) => variant.name.length > 0);
};

export const createProduct = async (req, res, next) => {
  try {
    // Assuming req.user is populated by authMiddleware
    const productData = { ...req.body };
    productData.variants = normalizeVariants(req.body?.variants);
    delete productData.stock;
    
    // Products created by authorized roles (admin/warehouse) are active immediately
    productData.status = 'active';

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { category, status, search } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort({ createdAt: -1 });

    const reviewStats = await Review.aggregate([
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    const statsMap = {};
    reviewStats.forEach(stat => {
      statsMap[stat._id.toString()] = {
        avgRating: Math.round(stat.avgRating * 10) / 10,
        reviewCount: stat.reviewCount
      };
    });

    const productsWithStats = products.map(product => {
      const stats = statsMap[product._id.toString()];
      return {
        ...product.toObject(),
        rating: stats ? stats.avgRating : 5,
        reviewCount: stats ? stats.reviewCount : 0
      };
    });

    res.json(productsWithStats);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug");

    if (!product) return res.status(404).json({ message: "Product not found" });

    const reviewStats = await Review.aggregate([
      { $match: { product: product._id } },
      {
        $group: {
          _id: "$product",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 }
        }
      }
    ]);

    const stats = reviewStats[0];
    const productObj = {
      ...product.toObject(),
      rating: stats ? Math.round(stats.avgRating * 10) / 10 : 5,
      reviewCount: stats ? stats.reviewCount : 0
    };

    res.json(productObj);
  } catch (error) {
    next(error);
  }
};


export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Restrict update to an admin or warehouse staff
    if (req.user.role !== 'admin' && req.user.role !== 'warehouse') {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    const updatePayload = { ...req.body };
    delete updatePayload.stock;
    if (Object.prototype.hasOwnProperty.call(updatePayload, "variants")) {
      updatePayload.variants = normalizeVariants(updatePayload.variants);
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Restrict delete to an admin or warehouse staff
    if (req.user.role !== 'admin' && req.user.role !== 'warehouse') {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
};

export const updateProductStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // e.g., 'active', 'rejected'
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to change product status" });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
};
