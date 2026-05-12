import Product from "../models/Product.js";

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
    const seller = req.user._id; 
    const productData = { ...req.body, seller };
    productData.variants = normalizeVariants(req.body?.variants);
    delete productData.stock;
    
    // Status can be default 'pending' initially when a seller creates it.
    if (req.user.role !== 'admin') {
      productData.status = 'pending';
    }

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const { seller, category, status, search } = req.query;
    
    let filter = {};
    if (seller) filter.seller = seller;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name slug")
      .populate("seller", "name email");

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Restrict update to the seller who owns it or an admin
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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

    // Restrict delete to the seller who owns it or an admin
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
