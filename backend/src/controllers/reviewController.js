import Review from "../models/Review.js";
import Product from "../models/Product.js";

// GET /api/reviews/product/:id - Get all reviews for a specific product
export const getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// GET /api/reviews/seller - Get all reviews for products owned by the authenticated seller
export const getSellerReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ seller: req.user._id })
      .populate("customer", "name email")
      .populate("product", "name images")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

// POST /api/reviews - Add a new review
export const addReview = async (req, res, next) => {
  try {
    const { product, rating, comment } = req.body;
    const targetProduct = await Product.findById(product);
    
    if (!targetProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = await Review.create({
      product,
      customer: req.user._id,
      seller: targetProduct.seller,
      rating,
      comment,
    });
    
    // Send back fully populated review so the UI updates
    const populatedReview = await Review.findById(review._id).populate("customer", "name email");
    res.status(201).json(populatedReview);
  } catch (err) {
    next(err);
  }
};

// PUT /api/reviews/:id/reply - Add a reply to a review
export const replyReview = async (req, res, next) => {
  try {
    const { reply } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Not authorized to reply to this review" });
    }

    review.reply = reply;
    await review.save();
    
    const populatedReview = await Review.findById(review._id).populate("customer", "name email").populate("product", "name images");
    res.json(populatedReview);
  } catch (err) {
    next(err);
  }
};
