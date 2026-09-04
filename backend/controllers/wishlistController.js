import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
};

// @route GET /api/wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  await wishlist.populate("products");
  res.json({ products: wishlist.products.filter((p) => p.isActive) });
});

// @route POST /api/wishlist/:productId
export const addToWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const wishlist = await getOrCreateWishlist(req.user._id);
  if (!wishlist.products.some((p) => p.toString() === req.params.productId)) {
    wishlist.products.push(req.params.productId);
    await wishlist.save();
  }
  await wishlist.populate("products");
  res.status(201).json({ products: wishlist.products });
});

// @route DELETE /api/wishlist/:productId
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
  await wishlist.save();
  await wishlist.populate("products");
  res.json({ products: wishlist.products });
});
