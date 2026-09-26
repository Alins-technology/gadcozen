import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  orderConfirmationEmail,
  adminNewOrderEmail,
  orderStatusEmail,
} from "../utils/emailTemplates.js";
import { PENDING_PAYMENT_TTL_MINUTES } from "../config/store.js";
import { fetchRazorpayOrderPayments, refundRazorpayPayment } from "./razorpayService.js";
import { ensureInvoiceNumber, buildInvoicePdf, invoiceFileName } from "./invoiceService.js";

// Atomically takes stock for every item. Each decrement only succeeds if
// enough stock is left at that instant, so two customers can't both buy the
// last unit. If any item fails, everything taken so far is put back.
export const reserveStock = async (items) => {
  const taken = [];
  for (const item of items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );
    if (!updated) {
      for (const t of taken) {
        await Product.findByIdAndUpdate(t.product, { $inc: { stock: t.quantity } });
      }
      const product = await Product.findById(item.product).select("name stock");
      return {
        ok: false,
        message: product
          ? `Not enough stock for ${product.name}. Only ${product.stock} left.`
          : "One of your items is no longer available",
      };
    }
    taken.push(item);
  }
  return { ok: true };
};

// Puts an order's stock back exactly once.
export const releaseStock = async (order) => {
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, stockReleased: false },
    { $set: { stockReleased: true } }
  );
  if (!claimed) return false;
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
  order.stockReleased = true;
  return true;
};

// Re-takes stock for an order whose stock was released (e.g. admin un-cancels).
export const reclaimStock = async (order) => {
  if (!order.stockReleased) return { ok: true };
  const result = await reserveStock(order.items);
  if (result.ok) {
    await Order.updateOne({ _id: order._id }, { $set: { stockReleased: false } });
    order.stockReleased = false;
  }
  return result;
};

const removeOrderedItemsFromCart = async (order) => {
  const cart = await Cart.findOne({ user: order.user });
  if (!cart) return;
  const orderedIds = new Set(order.items.map((i) => String(i.product)));
  cart.items = cart.items.filter((i) => !orderedIds.has(String(i.product)));
  cart.coupon = undefined;
  await cart.save();
};

// One-time side effects once an order is really placed (COD) or paid (online).
export const onOrderConfirmed = async (order) => {
  const claimed = await Order.findOneAndUpdate(
    { _id: order._id, confirmationSent: false },
    { $set: { confirmationSent: true } }
  );
  if (!claimed) return;

  await removeOrderedItemsFromCart(order);

  // Assign the invoice number and build the PDF. A failure here must never
  // block the order, so the emails still go out (just without the attachment).
  let attachments;
  try {
    const invoiced = await ensureInvoiceNumber(order);
    if (invoiced) {
      order.invoiceNumber = invoiced.invoiceNumber;
      order.invoiceDate = invoiced.invoiceDate;
    }
    const pdf = await buildInvoicePdf(order);
    attachments = [{ filename: invoiceFileName(order), content: pdf, contentType: "application/pdf" }];
  } catch (err) {
    console.error(`[invoice] Could not create invoice for ${order.orderNumber}: ${err.message}`);
  }

  const customerMail = orderConfirmationEmail(order);
  sendEmail({ to: order.contactEmail, ...customerMail, attachments });
  if (process.env.ADMIN_NOTIFY_EMAIL) {
    sendEmail({ to: process.env.ADMIN_NOTIFY_EMAIL, ...adminNewOrderEmail(order), attachments });
  }
};

export const notifyStatusChange = (order) => {
  if (!["Shipped", "Delivered", "Cancelled"].includes(order.orderStatus)) return;
  sendEmail({ to: order.contactEmail, ...orderStatusEmail(order) });
};

// Marks an online order as paid. Safe to call more than once and from both
// the browser callback and the webhook.
export const markOrderPaid = async (orderRef, razorpayPaymentId) => {
  const now = new Date();
  // Atomic claim: only one caller can flip a pending order to paid.
  const updated = await Order.findOneAndUpdate(
    { _id: orderRef._id, paymentStatus: "pending", orderStatus: "Pending" },
    {
      $set: {
        paymentStatus: "paid",
        orderStatus: "Confirmed",
        "paymentInfo.razorpayPaymentId": razorpayPaymentId,
        "paymentInfo.paidAt": now,
      },
      $push: { statusHistory: { status: "Confirmed", at: now } },
    },
    { new: true }
  );
  if (updated) {
    await onOrderConfirmed(updated);
    return updated;
  }

  // The payment landed after the order had already expired and given its
  // stock back. Claim it atomically (so the webhook and browser callback
  // can't both handle it), then re-take the stock or refund the customer.
  const order = await Order.findOneAndUpdate(
    {
      _id: orderRef._id,
      paymentStatus: "failed",
      orderStatus: "Cancelled",
      "paymentInfo.razorpayPaymentId": { $exists: false },
    },
    { $set: { "paymentInfo.razorpayPaymentId": razorpayPaymentId, "paymentInfo.paidAt": now } },
    { new: true }
  );
  if (!order) return Order.findById(orderRef._id);

  const result = await reclaimStock(order);
  if (!result.ok) {
    const refund = await refundRazorpayPayment(razorpayPaymentId, order.total);
    order.paymentStatus = "refunded";
    order.set("paymentInfo.refundId", refund.id);
    order.notes = [order.notes, "Paid after expiry but stock was unavailable — auto-refunded."]
      .filter(Boolean)
      .join(" ");
    await order.save();
    return order;
  }

  order.paymentStatus = "paid";
  order.orderStatus = "Confirmed";
  order.statusHistory.push({ status: "Confirmed" });
  await order.save();
  await onOrderConfirmed(order);
  return order;
};

// Cancels an unpaid online order and frees its stock.
export const cancelUnpaidOrder = async (orderRef, reason = "Payment not completed.") => {
  const order = await Order.findOneAndUpdate(
    { _id: orderRef._id, paymentStatus: "pending", orderStatus: "Pending" },
    {
      $set: { orderStatus: "Cancelled", paymentStatus: "failed" },
      $push: { statusHistory: { status: "Cancelled", at: new Date() } },
    },
    { new: true }
  );
  if (!order) return Order.findById(orderRef._id);
  order.notes = [order.notes, reason].filter(Boolean).join(" ");
  await order.save();
  await releaseStock(order);
  return order;
};

// Runs on an interval: unpaid online orders older than the TTL are checked
// against Razorpay one last time, then cancelled so their stock is released.
export const expireStalePendingPayments = async () => {
  const cutoff = new Date(Date.now() - PENDING_PAYMENT_TTL_MINUTES * 60 * 1000);
  const stale = await Order.find({
    paymentMethod: "razorpay",
    paymentStatus: "pending",
    orderStatus: "Pending",
    createdAt: { $lt: cutoff },
  }).limit(50);

  for (const order of stale) {
    try {
      const rzpOrderId = order.paymentInfo?.razorpayOrderId;
      if (rzpOrderId) {
        const payments = await fetchRazorpayOrderPayments(rzpOrderId);
        const captured = payments.items?.find((p) => p.status === "captured");
        if (captured) {
          await markOrderPaid(order, captured.id);
          continue;
        }
      }
      await cancelUnpaidOrder(order, "Payment not completed in time.");
    } catch (err) {
      console.error(`[orders] Could not expire ${order.orderNumber}: ${err.message}`);
    }
  }
};
