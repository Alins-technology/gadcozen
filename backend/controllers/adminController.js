import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @route GET /api/admin/dashboard
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalOrders, totalUsers, totalProducts, lowStockProducts, recentOrders, recentUsers, revenueAgg] =
    await Promise.all([
      Order.countDocuments({}),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({}),
      Product.find({ stock: { $lte: 10 }, isActive: true }).select("name stock sku"),
      Order.find({}).sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
      User.find({ role: "customer" }).sort({ createdAt: -1 }).limit(5),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

  res.json({
    totalOrders,
    totalUsers,
    totalProducts,
    totalRevenue: revenueAgg[0]?.total || 0,
    lowStockProducts,
    recentOrders,
    recentUsers,
  });
});
