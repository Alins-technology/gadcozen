import Review from "../models/Review.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const recalculateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId, isApproved: true });
  const reviewCount = reviews.length;
  const rating = reviewCount ? reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : 0;
  await Product.findByIdAndUpdate(productId, {
    rating: Math.round(rating * 10) / 10,
    reviewCount,
  });
};

// @route GET /api/reviews/product/:productId
export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true }).sort({
    createdAt: -1,
  });
  res.json({ reviews });
});

// @route POST /api/reviews/product/:productId
export const createReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  const productId = req.params.productId;

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) {
    return res.status(400).json({ message: "You have already reviewed this product" });
  }

  const verifiedPurchase = await Order.exists({
    user: req.user._id,
    "items.product": productId,
    orderStatus: { $in: ["Delivered", "Shipped", "Confirmed", "Processing"] },
  });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    name: req.user.name,
    rating,
    title,
    comment,
    verifiedPurchase: Boolean(verifiedPurchase),
  });

  await recalculateProductRating(productId);
  res.status(201).json({ review });
});

// ---- Admin ----

// @route GET /api/reviews (admin)
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({})
    .populate("product", "name slug")
    .sort({ createdAt: -1 });
  res.json({ reviews });
});

// @route PUT /api/reviews/:id/moderate (admin)
export const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });
  review.isApproved = req.body.isApproved;
  await review.save();
  await recalculateProductRating(review.product);
  res.json({ review });
});

// @route DELETE /api/reviews/:id (admin)
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: "Review not found" });
  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);
  res.json({ message: "Review deleted" });
});
