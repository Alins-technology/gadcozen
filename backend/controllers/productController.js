import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import slugify from "slugify";

// @route GET /api/products
// Supports: search, category (slug), minPrice, maxPrice, sort, page, limit, featured, bestseller
export const getProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sort = "featured",
    page = 1,
    limit = 12,
    featured,
    bestseller,
    newArrival,
  } = req.query;

  const query = { isActive: true };

  if (search) {
    query.$text = { $search: search };
  }
  if (category) {
    const cat = await Category.findOne({ slug: category });
    if (cat) query.category = cat._id;
    else return res.json({ products: [], total: 0, page: 1, pages: 0 });
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }
  if (featured === "true") query.featured = true;
  if (bestseller === "true") query.bestseller = true;
  if (newArrival === "true") query.newArrival = true;

  const sortMap = {
    featured: { featured: -1, createdAt: -1 },
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    newest: { createdAt: -1 },
    "name-asc": { name: 1 },
  };
  const sortBy = sortMap[sort] || sortMap.featured;

  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort(sortBy)
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Product.countDocuments(query);

  res.json({
    products,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

// @route GET /api/products/:slug
export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    "category",
    "name slug"
  );
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
});

// @route GET /api/products/:slug/related
export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) return res.status(404).json({ message: "Product not found" });

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(4);

  res.json({ products: related });
});

// ---- Admin ----

// @route POST /api/products (admin)
export const createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.name && !data.slug) data.slug = slugify(data.name, { lower: true, strict: true });
  const product = await Product.create(data);
  res.status(201).json({ product });
});

// @route PUT /api/products/:id (admin)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  Object.assign(product, req.body);
  if (req.body.name && !req.body.slug) {
    product.slug = slugify(req.body.name, { lower: true, strict: true });
  }
  await product.save();
  res.json({ product });
});

// @route DELETE /api/products/:id (admin)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  await product.deleteOne();
  res.json({ message: "Product deleted" });
});

// @route GET /api/products/admin/all (admin) - includes inactive products
export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find({}).populate("category", "name slug").sort({ createdAt: -1 });
  res.json({ products });
});

// @route GET /api/products/id/:id (admin) - fetch by mongo id for edit forms
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ product });
});
