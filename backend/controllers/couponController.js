import Coupon from "../models/Coupon.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @route GET /api/coupons (admin)
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json({ coupons });
});

// @route POST /api/coupons (admin)
export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ coupon });
});

// @route PUT /api/coupons/:id (admin)
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });
  Object.assign(coupon, req.body);
  await coupon.save();
  res.json({ coupon });
});

// @route DELETE /api/coupons/:id (admin)
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) return res.status(404).json({ message: "Coupon not found" });
  await coupon.deleteOne();
  res.json({ message: "Coupon deleted" });
});
