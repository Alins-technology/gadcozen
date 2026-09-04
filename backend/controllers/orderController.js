import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Coupon from "../models/Coupon.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateOrderNumber } from "../utils/orderNumber.js";

const FREE_SHIPPING_THRESHOLD = 999;
const STANDARD_SHIPPING = 79;

// @route POST /api/orders
// Creates an order from the user's current cart, then clears the cart.
// This is a demo/mock payment flow (paymentMethod: "mock_online" or "cod");
// no real money moves. The architecture is ready for a real gateway
// (Razorpay/Stripe) to be dropped in behind this endpoint.
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, contactEmail, paymentMethod = "mock_online", notes } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }

  // Re-validate stock at checkout time
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive) {
      return res.status(400).json({ message: "One of your items is no longer available" });
    }
    if (item.product.stock < item.quantity) {
      return res.status(400).json({
        message: `Not enough stock for ${item.product.name}. Only ${item.product.stock} left.`,
      });
    }
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  let discount = 0;
  let couponCode;
  if (cart.coupon?.discountPercent) {
    discount = Math.round((subtotal * cart.coupon.discountPercent) / 100);
    couponCode = cart.coupon.code;
  }
  const shippingCost = subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  const total = Math.max(subtotal - discount + shippingCost, 0);

  const orderItems = cart.items.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    image: i.product.images?.[0],
    quantity: i.quantity,
    price: i.product.price,
  }));

  // orderNumber has a random component (see generateOrderNumber) — collisions
  // are unlikely but not impossible as order volume grows, and orderNumber
  // is unique in the schema. Retry a few times with a fresh number instead
  // of failing the whole checkout on a duplicate-key error.
  let order;
  let attempts = 0;
  while (!order) {
    attempts += 1;
    try {
      order = await Order.create({
        user: req.user._id,
        orderNumber: generateOrderNumber(),
        items: orderItems,
        shippingAddress,
        contactEmail: contactEmail || req.user.email,
        subtotal,
        discount,
        shippingCost,
        total,
        couponCode,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "paid",
        orderStatus: "Confirmed",
        notes,
      });
    } catch (err) {
      const isDuplicateOrderNumber = err.code === 11000 && err.keyPattern?.orderNumber;
      if (!isDuplicateOrderNumber || attempts >= 5) throw err;
    }
  }

  // Decrement stock
  for (const item of cart.items) {
    await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: -item.quantity } });
  }

  // Clear the cart
  cart.items = [];
  cart.coupon = undefined;
  await cart.save();

  res.status(201).json({ order });
});

// @route GET /api/orders/mine
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

// @route GET /api/orders/mine/:orderNumber
export const getMyOrderByNumber = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ order });
});

// ---- Admin ----

// @route GET /api/orders (admin)
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.orderStatus = status;
  if (search) {
    query.$or = [
      { orderNumber: new RegExp(search, "i") },
      { contactEmail: new RegExp(search, "i") },
    ];
  }

  const orders = await Order.find(query)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await Order.countDocuments(query);

  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
});

// @route GET /api/orders/:id (admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email phone");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ order });
});

// @route PUT /api/orders/:id/status (admin)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const previousStatus = order.orderStatus;
  const nextStatus = req.body.orderStatus;

  order.orderStatus = nextStatus;
  if (nextStatus === "Delivered") order.paymentStatus = "paid";
  if (nextStatus === "Cancelled" && order.paymentStatus === "paid") {
    order.paymentStatus = "refunded";
  }

  // Put stock back when an order is newly cancelled (but only once — not on
  // every save while it stays Cancelled), and take it back out if an admin
  // un-cancels an order after stock was already restored.
  if (nextStatus === "Cancelled" && previousStatus !== "Cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  } else if (previousStatus === "Cancelled" && nextStatus !== "Cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }
  }

  await order.save();
  res.json({ order });
});
