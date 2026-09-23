import crypto from "crypto";
import Razorpay from "razorpay";
import { isRazorpayConfigured } from "../config/store.js";

let instance;

const getInstance = () => {
  if (!isRazorpayConfigured()) {
    throw new Error("Online payments are not configured. Please choose another payment method.");
  }
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
};

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a || ""));
  const bufB = Buffer.from(String(b || ""));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

// Razorpay amounts are in paise.
export const createRazorpayOrder = (order) =>
  getInstance().orders.create({
    amount: Math.round(order.total * 100),
    currency: "INR",
    receipt: order.orderNumber,
    notes: { orderId: String(order._id), orderNumber: order.orderNumber },
  });

export const fetchRazorpayOrderPayments = (razorpayOrderId) =>
  getInstance().orders.fetchPayments(razorpayOrderId);

export const refundRazorpayPayment = (paymentId, amountInRupees) =>
  getInstance().payments.refund(paymentId, { amount: Math.round(amountInRupees * 100) });

// Signature sent to the browser's success handler after checkout.
export const verifyCheckoutSignature = ({ razorpayOrderId, razorpayPaymentId, signature }) => {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  return safeEqual(expected, signature);
};

// Signature on server-to-server webhook calls (uses the separate webhook secret).
export const verifyWebhookSignature = (rawBody, signature) => {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return safeEqual(expected, signature);
};
