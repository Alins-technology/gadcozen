import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import { calculateShipping } from "../config/store.js";

// Returns { coupon } when the code is currently usable for this subtotal,
// or { error } with a customer-facing message.
export const validateCoupon = async (code, subtotal, userId) => {
  if (!code) return { error: "Please enter a coupon code" };
  const coupon = await Coupon.findOne({ code: String(code).toUpperCase().trim(), isActive: true });
  if (!coupon) return { error: "Invalid coupon code" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { error: "This coupon has expired" };
  if (coupon.firstOrderOnly && userId) {
    // Unpaid (Pending) and cancelled orders don't count as a "first order".
    const hasOrdered = await Order.exists({
      user: userId,
      orderStatus: { $nin: ["Pending", "Cancelled"] },
    });
    if (hasOrdered) return { error: "This coupon is valid on your first order only" };
  }
  if (subtotal < (coupon.minOrderValue || 0)) {
    return { error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon` };
  }
  return { coupon };
};

// items: [{ product, quantity }] with product populated.
export const computeTotals = (items, discountPercent = 0) => {
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discount = discountPercent ? Math.round((subtotal * discountPercent) / 100) : 0;
  const shippingCost = calculateShipping(subtotal - discount);
  const total = Math.max(subtotal - discount + shippingCost, 0);
  return { subtotal, discount, shippingCost, total };
};
