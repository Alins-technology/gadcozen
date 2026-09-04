import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING = 79;

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const buildCartResponse = async (cart) => {
  const populated = await cart.populate("items.product");
  const items = populated.items
    .filter((i) => i.product) // drop items whose product was deleted
    .map((i) => ({
      product: i.product,
      quantity: i.quantity,
      lineTotal: i.product.price * i.quantity,
    }));

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  let discount = 0;
  if (cart.coupon?.discountPercent) {
    discount = Math.round((subtotal * cart.coupon.discountPercent) / 100);
  }
  const shippingCost = subtotal === 0 || subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = Math.max(subtotal - discount + shippingCost, 0);

  return {
    items,
    coupon: cart.coupon,
    subtotal,
    discount,
    shippingCost,
    total,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
};

// @route GET /api/cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json(await buildCartResponse(cart));
});

// @route POST /api/cart/items
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => i.product.toString() === productId);
  // Check against the TOTAL quantity that would end up in the cart, not just
  // the quantity being added this call — otherwise adding 1 more at a time
  // could push the cart past available stock without ever tripping this check.
  const desiredTotal = (existing?.quantity || 0) + Number(quantity);
  if (product.stock < desiredTotal) {
    return res.status(400).json({ message: "Not enough stock available" });
  }

  if (existing) {
    existing.quantity = desiredTotal;
  } else {
    cart.items.push({ product: productId, quantity, priceAtAdd: product.price });
  }
  await cart.save();
  res.status(201).json(await buildCartResponse(cart));
});

// @route PUT /api/cart/items/:productId
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) return res.status(404).json({ message: "Item not in cart" });

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  } else {
    const product = await Product.findById(req.params.productId);
    if (product && product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }
    item.quantity = quantity;
  }
  await cart.save();
  res.json(await buildCartResponse(cart));
});

// @route DELETE /api/cart/items/:productId
export const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json(await buildCartResponse(cart));
});

// @route DELETE /api/cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.coupon = undefined;
  await cart.save();
  res.json(await buildCartResponse(cart));
});

// @route POST /api/cart/merge - merges a guest (localStorage) cart into the DB cart after login
export const mergeCart = asyncHandler(async (req, res) => {
  const { items = [] } = req.body; // [{ productId, quantity }]
  const cart = await getOrCreateCart(req.user._id);

  for (const guestItem of items) {
    const product = await Product.findById(guestItem.productId);
    if (!product || !product.isActive) continue;
    const existing = cart.items.find((i) => i.product.toString() === guestItem.productId);
    if (existing) {
      existing.quantity += Number(guestItem.quantity || 1);
    } else {
      cart.items.push({
        product: guestItem.productId,
        quantity: guestItem.quantity || 1,
        priceAtAdd: product.price,
      });
    }
  }
  await cart.save();
  res.json(await buildCartResponse(cart));
});

// @route POST /api/cart/coupon
export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ message: "Invalid coupon code" });
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return res.status(400).json({ message: "This coupon has expired" });
  }

  const cart = await getOrCreateCart(req.user._id);
  const populated = await cart.populate("items.product");
  const subtotal = populated.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  if (subtotal < coupon.minOrderValue) {
    return res.status(400).json({
      message: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon`,
    });
  }

  cart.coupon = { code: coupon.code, discountPercent: coupon.discountPercent };
  await cart.save();
  res.json(await buildCartResponse(cart));
});

// @route DELETE /api/cart/coupon
export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.coupon = undefined;
  await cart.save();
  res.json(await buildCartResponse(cart));
});
