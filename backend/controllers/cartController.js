import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateCoupon, computeTotals } from "../services/pricingService.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

const toQuantity = (value) => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) ? n : NaN;
};

const buildCartResponse = async (cart) => {
  await cart.populate("items.product");
  // Drop items whose product was deleted or deactivated.
  const liveItems = cart.items.filter((i) => i.product && i.product.isActive);
  const items = liveItems.map((i) => ({
    product: i.product,
    quantity: i.quantity,
    lineTotal: i.product.price * i.quantity,
  }));

  // A coupon applied earlier may no longer qualify (cart shrank below the
  // minimum, coupon expired or was disabled) — drop it instead of showing a
  // discount that checkout would reject.
  let couponNotice;
  if (cart.coupon?.code) {
    const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
    const { coupon, error } = await validateCoupon(cart.coupon.code, subtotal, cart.user);
    if (error) {
      couponNotice = `Coupon ${cart.coupon.code} removed: ${error}`;
      cart.coupon = undefined;
      await cart.save();
    } else if (coupon.discountPercent !== cart.coupon.discountPercent) {
      cart.coupon.discountPercent = coupon.discountPercent;
      await cart.save();
    }
  }

  const totals = computeTotals(items, cart.coupon?.discountPercent || 0);

  return {
    items,
    coupon: cart.coupon?.code ? cart.coupon : null,
    couponNotice,
    ...totals,
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
  const { productId } = req.body;
  const quantity = toQuantity(req.body.quantity ?? 1);
  if (!(quantity >= 1)) return res.status(400).json({ message: "Invalid quantity" });

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not found" });
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => i.product.toString() === productId);
  // Check against the TOTAL quantity that would end up in the cart, not just
  // the quantity being added this call — otherwise adding 1 more at a time
  // could push the cart past available stock without ever tripping this check.
  const desiredTotal = (existing?.quantity || 0) + quantity;
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
  const quantity = toQuantity(req.body.quantity);
  if (Number.isNaN(quantity)) return res.status(400).json({ message: "Invalid quantity" });

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) return res.status(404).json({ message: "Item not in cart" });

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  } else {
    const product = await Product.findById(req.params.productId);
    if (product && product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} left in stock` });
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
  const items = Array.isArray(req.body.items) ? req.body.items : []; // [{ productId, quantity }]
  const cart = await getOrCreateCart(req.user._id);

  for (const guestItem of items) {
    const quantity = toQuantity(guestItem.quantity ?? 1);
    if (!(quantity >= 1)) continue;
    const product = await Product.findById(guestItem.productId).catch(() => null);
    if (!product || !product.isActive || product.stock <= 0) continue;

    const existing = cart.items.find((i) => i.product.toString() === String(guestItem.productId));
    // Never let the merged quantity exceed what's actually in stock.
    const merged = Math.min((existing?.quantity || 0) + quantity, product.stock);
    if (existing) {
      existing.quantity = merged;
    } else {
      cart.items.push({ product: product._id, quantity: merged, priceAtAdd: product.price });
    }
  }
  await cart.save();
  res.json(await buildCartResponse(cart));
});

// @route POST /api/cart/coupon
export const applyCoupon = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await cart.populate("items.product");
  const subtotal = cart.items
    .filter((i) => i.product && i.product.isActive)
    .reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const { coupon, error } = await validateCoupon(req.body.code, subtotal, req.user._id);
  if (error) return res.status(400).json({ message: error });

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
