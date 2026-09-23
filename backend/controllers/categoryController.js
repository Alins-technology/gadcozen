import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import slugify from "slugify";

// @route GET /api/categories
export const getCategories = asyncHandler(async (req, res) => {
  // One aggregate for all counts instead of one query per category.
  const [categories, counts] = await Promise.all([
    Category.find({ isActive: true }).sort({ name: 1 }).lean(),
    Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);
  const countById = new Map(counts.map((c) => [String(c._id), c.count]));
  const withCounts = categories.map((cat) => ({
    ...cat,
    productCount: countById.get(String(cat._id)) || 0,
  }));
  res.json({ categories: withCounts });
});

// @route GET /api/categories/:slug
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).json({ message: "Category not found" });
  const productCount = await Product.countDocuments({ category: category._id, isActive: true });
  res.json({ category: { ...category.toObject(), productCount } });
});

// ---- Admin ----

export const createCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.name && !data.slug) data.slug = slugify(data.name, { lower: true, strict: true });
  const category = await Category.create(data);
  res.status(201).json({ category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  Object.assign(category, req.body);
  if (req.body.name && !req.body.slug) {
    category.slug = slugify(req.body.name, { lower: true, strict: true });
  }
  await category.save();
  res.json({ category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const inUse = await Product.countDocuments({ category: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({
      message: `Cannot delete: ${inUse} product(s) are assigned to this category`,
    });
  }
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "Category not found" });
  await category.deleteOne();
  res.json({ message: "Category deleted" });
});

export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.json({ categories });
});
