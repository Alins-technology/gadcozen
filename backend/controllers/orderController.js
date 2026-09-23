import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateOrderNumber } from "../utils/orderNumber.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { COD_FEE, getEnabledPaymentMethods } from "../config/store.js";
import { validateCoupon, computeTotals } from "../services/pricingService.js";
import {
  reserveStock,
  releaseStock,
  reclaimStock,
  onOrderConfirmed,
  notifyStatusChange,
  markOrderPaid,
  cancelUnpaidOrder,
} from "../services/orderLifecycle.js";
import {
  createRazorpayOrder,
  verifyCheckoutSignature,
  verifyWebhookSignature,
  fetchRazorpayOrderPayments,
  refundRazorpayPayment,
} from "../services/razorpayService.js";

const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

// orderNumber has a random component (see generateOrderNumber) and is unique
// in the schema. Retry a few times on the rare duplicate instead of failing checkout.
const createWithUniqueNumber = async (data) => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await Order.create({ ...data, orderNumber: generateOrderNumber() });
    } catch (err) {
      const isDuplicateOrderNumber = err.code === 11000 && err.keyPattern?.orderNumber;
      if (!isDuplicateOrderNumber || attempt >= 5) throw err;
    }
  }
};

// @route POST /api/orders
// Creates an order from the user's cart. Stock is reserved immediately.
// - cod:         order is confirmed straight away, paid on delivery.
// - razorpay:    order stays "Pending" until the payment is verified
//                (POST /:id/verify-payment or the Razorpay webhook).
// - mock_online: dev-only simulated payment, never enabled in production.
export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, contactEmail, paymentMethod, notes } = req.body;

  if (!getEnabledPaymentMethods().includes(paymentMethod)) {
    return res.status(400).json({ message: "This payment method is not available" });
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }
  if (cart.items.some((i) => !i.product || !i.product.isActive)) {
    return res.status(400).json({
      message: "One of your items is no longer available. Please review your cart.",
    });
  }

  // Re-check the coupon now — it may have expired or been disabled since it was applied.
  let discountPercent = 0;
  let couponCode;
  if (cart.coupon?.code) {
    const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const { coupon, error } = await validateCoupon(cart.coupon.code, subtotal, req.user._id);
    if (error) {
      cart.coupon = undefined;
      await cart.save();
      return res.status(400).json({ message: `Coupon removed: ${error}` });
    }
    discountPercent = coupon.discountPercent;
    couponCode = coupon.code;
  }

  const totals = computeTotals(cart.items, discountPercent);
  const codFee = paymentMethod === "cod" ? COD_FEE : 0;
  const total = totals.total + codFee;

  const orderItems = cart.items.map((i) => ({
    product: i.product._id,
    name: i.product.name,
    image: i.product.images?.[0],
    quantity: i.quantity,
    price: i.product.price,
  }));

  const reservation = await reserveStock(orderItems);
  if (!reservation.ok) return res.status(400).json({ message: reservation.message });

  const isOnline = paymentMethod === "razorpay";
  const isMockPaid = paymentMethod === "mock_online";
  const initialStatus = isOnline ? "Pending" : "Confirmed";

  let order;
  try {
    order = await createWithUniqueNumber({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      contactEmail: contactEmail || req.user.email,
      ...totals,
      codFee,
      total,
      couponCode,
      paymentMethod,
      paymentStatus: isMockPaid ? "paid" : "pending",
      paymentInfo: isMockPaid ? { paidAt: new Date() } : undefined,
      orderStatus: initialStatus,
      statusHistory: [{ status: initialStatus }],
      notes,
    });
  } catch (err) {
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    throw err;
  }

  if (!isOnline) {
    await onOrderConfirmed(order);
    return res.status(201).json({ order });
  }

  let rzpOrder;
  try {
    rzpOrder = await createRazorpayOrder(order);
  } catch (err) {
    console.error(`[orders] Razorpay order creation failed for ${order.orderNumber}:`, err?.error || err);
    await cancelUnpaidOrder(order, "Payment gateway error.");
    return res.status(502).json({
      message: "Could not start the online payment. Please try again or choose another method.",
    });
  }
  order.set("paymentInfo.razorpayOrderId", rzpOrder.id);
  await order.save();

  res.status(201).json({
    order,
    razorpay: {
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    },
  });
});

const findOwnOrder = (req) => Order.findOne({ _id: req.params.id, user: req.user._id });

// @route POST /api/orders/:id/verify-payment
// Called by the browser after Razorpay Checkout reports success.
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const order = await findOwnOrder(req);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (
    order.paymentMethod !== "razorpay" ||
    order.paymentInfo?.razorpayOrderId !== razorpay_order_id ||
    !verifyCheckoutSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })
  ) {
    return res.status(400).json({ message: "Payment verification failed" });
  }

  const updated = await markOrderPaid(order, razorpay_payment_id);
  res.json({ order: updated });
});

// @route POST /api/orders/:id/payment-cancelled
// Called when the customer closes the Razorpay window without paying. Before
// releasing the stock we ask Razorpay whether a payment actually went through
// (e.g. a UPI payment that completed after the window closed).
export const paymentCancelled = asyncHandler(async (req, res) => {
  const order = await findOwnOrder(req);
  if (!order) return res.status(404).json({ message: "Order not found" });
  if (order.paymentMethod !== "razorpay" || order.paymentStatus !== "pending") {
    return res.json({ order });
  }

  const payments = await fetchRazorpayOrderPayments(order.paymentInfo.razorpayOrderId);
  const captured = payments.items?.find((p) => p.status === "captured");
  const updated = captured
    ? await markOrderPaid(order, captured.id)
    : await cancelUnpaidOrder(order, "Payment cancelled by customer.");
  res.json({ order: updated });
});

// @route POST /api/payments/razorpay/webhook  (mounted in server.js with a raw body)
// Server-to-server confirmation from Razorpay — makes sure an order is marked
// paid even if the customer's browser closed before the verify call.
export const razorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  try {
    const event = JSON.parse(req.body.toString("utf8"));
    if (event.event === "payment.captured" || event.event === "order.paid") {
      const payment = event.payload?.payment?.entity;
      if (payment?.order_id) {
        const order = await Order.findOne({ "paymentInfo.razorpayOrderId": payment.order_id });
        if (order) await markOrderPaid(order, payment.id);
      }
    }
  } catch (err) {
    console.error("[webhook] Razorpay webhook handling failed:", err.message);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
  res.json({ received: true });
};

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
  const { status, paymentStatus, search } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

  const query = {};
  if (status) query.orderStatus = status;
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    query.$or = [
      { orderNumber: pattern },
      { contactEmail: pattern },
      { "shippingAddress.fullName": pattern },
      { "shippingAddress.phone": pattern },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(query),
  ]);

  res.json({ orders, total, page, pages: Math.ceil(total / limit) });
});

// @route GET /api/orders/:id (admin)
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email phone");
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json({ order });
});

// @route PUT /api/orders/:id/status (admin)
// Body: { orderStatus, courierName?, trackingNumber?, trackingUrl? }
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  const { courierName, trackingNumber, trackingUrl } = req.body;
  const previousStatus = order.orderStatus;
  const nextStatus = req.body.orderStatus || previousStatus;

  if (!ORDER_STATUSES.includes(nextStatus)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  if (courierName !== undefined) order.courierName = courierName;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;

  const isUnpaidOnline = order.paymentMethod === "razorpay" && order.paymentStatus !== "paid";

  if (nextStatus !== previousStatus) {
    if (nextStatus === "Cancelled") {
      if (order.paymentStatus === "paid" && order.paymentMethod === "razorpay") {
        // Refund the customer through Razorpay before cancelling.
        try {
          const refund = await refundRazorpayPayment(
            order.paymentInfo.razorpayPaymentId,
            order.total
          );
          order.set("paymentInfo.refundId", refund.id);
          order.paymentStatus = "refunded";
        } catch (err) {
          const reason = err?.error?.description || err.message;
          return res.status(502).json({ message: `Refund failed, order not cancelled: ${reason}` });
        }
      } else if (order.paymentStatus === "paid") {
        // COD cash already collected / test payment — refund must be done manually.
        order.paymentStatus = "refunded";
      } else if (isUnpaidOnline) {
        order.paymentStatus = "failed";
      }
      await releaseStock(order);
    } else if (previousStatus === "Cancelled") {
      if (order.paymentMethod === "razorpay") {
        return res.status(400).json({
          message: "Cancelled online orders can't be re-opened. Ask the customer to order again.",
        });
      }
      const result = await reclaimStock(order);
      if (!result.ok) return res.status(400).json({ message: result.message });
    } else if (isUnpaidOnline) {
      return res.status(400).json({
        message: "Payment for this order hasn't been received yet, so it can't be processed.",
      });
    }

    if (nextStatus === "Delivered" && order.paymentMethod === "cod") {
      order.paymentStatus = "paid";
      order.set("paymentInfo.paidAt", new Date());
    }

    order.orderStatus = nextStatus;
    order.statusHistory.push({ status: nextStatus });
  }

  await order.save();
  if (nextStatus !== previousStatus) notifyStatusChange(order);
  res.json({ order });
});
