import { clientUrl } from "./sendEmail.js";

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const inr = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const layout = (title, body) => `
<div style="background:#f3fafb;padding:24px;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <div style="background:#037D8F;color:#ffffff;padding:20px 24px;font-size:20px;font-weight:bold;letter-spacing:1px">GADCO ZEN</div>
    <div style="padding:24px">
      <h2 style="margin:0 0 16px;font-size:18px;color:#0f172a">${escapeHtml(title)}</h2>
      ${body}
    </div>
    <div style="padding:16px 24px;font-size:12px;color:#64748b;border-top:1px solid #e2e8f0">
      Need help? Reply to this email or visit <a href="${clientUrl()}/contact" style="color:#037D8F">our contact page</a>.
    </div>
  </div>
</div>`;

const paymentLabel = (order) =>
  ({ cod: "Cash on Delivery", razorpay: "Paid online", mock_online: "Online (test)" })[order.paymentMethod] ||
  order.paymentMethod;

const orderTable = (order) => `
<table style="width:100%;border-collapse:collapse;font-size:14px">
  ${order.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9">${escapeHtml(i.name)} × ${i.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right">${inr(i.price * i.quantity)}</td>
      </tr>`
    )
    .join("")}
  <tr><td style="padding:6px 0">Subtotal</td><td style="text-align:right">${inr(order.subtotal)}</td></tr>
  ${order.discount > 0 ? `<tr><td style="padding:6px 0">Discount</td><td style="text-align:right">-${inr(order.discount)}</td></tr>` : ""}
  <tr><td style="padding:6px 0">Shipping</td><td style="text-align:right">${order.shippingCost ? inr(order.shippingCost) : "Free"}</td></tr>
  ${order.codFee > 0 ? `<tr><td style="padding:6px 0">COD fee</td><td style="text-align:right">${inr(order.codFee)}</td></tr>` : ""}
  <tr><td style="padding:8px 0;font-weight:bold">Total</td><td style="text-align:right;font-weight:bold">${inr(order.total)}</td></tr>
</table>`;

const addressBlock = (a) =>
  `${escapeHtml(a.fullName)}<br/>${escapeHtml(a.line1)} ${escapeHtml(a.line2 || "")}<br/>${escapeHtml(a.city)}, ${escapeHtml(a.state)} ${escapeHtml(a.postalCode)}<br/>${escapeHtml(a.phone)}`;

export const orderConfirmationEmail = (order) => ({
  subject: `Order confirmed — ${order.orderNumber}`,
  html: layout(
    "Thank you for your order!",
    `<p style="font-size:14px">Your order <strong>${order.orderNumber}</strong> has been confirmed. Payment: ${paymentLabel(order)}.</p>
     ${orderTable(order)}
     ${order.invoiceNumber ? `<p style="font-size:14px;margin-top:16px">Your invoice <strong>${escapeHtml(order.invoiceNumber)}</strong> is attached to this email as a PDF.</p>` : ""}
     <p style="font-size:14px;margin-top:16px"><strong>Shipping to</strong><br/>${addressBlock(order.shippingAddress)}</p>
     <p style="margin-top:20px"><a href="${clientUrl()}/account/orders/${order.orderNumber}" style="background:#037D8F;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-size:14px">View your order</a></p>`
  ),
});

export const adminNewOrderEmail = (order) => ({
  subject: `New order ${order.orderNumber} — ${inr(order.total)} (${paymentLabel(order)})`,
  html: layout(
    `New order ${order.orderNumber}`,
    `${orderTable(order)}
     <p style="font-size:14px;margin-top:16px"><strong>Customer</strong><br/>${escapeHtml(order.contactEmail)}<br/>${addressBlock(order.shippingAddress)}</p>
     <p><a href="${clientUrl()}/admin/orders/${order._id}" style="color:#037D8F">Open in admin panel</a></p>`
  ),
});

export const orderStatusEmail = (order) => {
  const tracking =
    order.orderStatus === "Shipped" && order.trackingNumber
      ? `<p style="font-size:14px">Courier: <strong>${escapeHtml(order.courierName || "—")}</strong><br/>Tracking number: <strong>${escapeHtml(order.trackingNumber)}</strong>
         ${order.trackingUrl ? `<br/><a href="${escapeHtml(order.trackingUrl)}" style="color:#037D8F">Track your shipment</a>` : ""}</p>`
      : "";
  const refundNote =
    order.orderStatus === "Cancelled" && order.paymentStatus === "refunded"
      ? `<p style="font-size:14px">A refund of <strong>${inr(order.total)}</strong> has been initiated to your original payment method. Banks usually take 5–7 working days to reflect it.</p>`
      : "";
  return {
    subject: `Your order ${order.orderNumber} is ${order.orderStatus.toLowerCase()}`,
    html: layout(
      `Order ${order.orderStatus}`,
      `<p style="font-size:14px">Your order <strong>${order.orderNumber}</strong> is now <strong>${order.orderStatus}</strong>.</p>
       ${tracking}${refundNote}
       <p style="margin-top:20px"><a href="${clientUrl()}/account/orders/${order.orderNumber}" style="color:#037D8F">View order details</a></p>`
    ),
  };
};

export const passwordResetEmail = (resetUrl) => ({
  subject: "Reset your GADCO ZEN password",
  html: layout(
    "Reset your password",
    `<p style="font-size:14px">We received a request to reset your password. This link is valid for 30 minutes.</p>
     <p style="margin:20px 0"><a href="${resetUrl}" style="background:#037D8F;color:#fff;padding:10px 18px;border-radius:999px;text-decoration:none;font-size:14px">Reset password</a></p>
     <p style="font-size:12px;color:#64748b">If you didn't request this, you can safely ignore this email.</p>`
  ),
});

export const contactNotificationEmail = (s) => ({
  subject: `Website enquiry: ${s.subject}`,
  html: layout(
    "New contact form message",
    `<p style="font-size:14px"><strong>${escapeHtml(s.name)}</strong> (${escapeHtml(s.email)}${s.phone ? `, ${escapeHtml(s.phone)}` : ""})</p>
     <p style="font-size:14px"><strong>${escapeHtml(s.subject)}</strong></p>
     <p style="font-size:14px;white-space:pre-wrap">${escapeHtml(s.message)}</p>`
  ),
});

const bulkItemsTable = (e) => `
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <tr>
    <th style="text-align:left;padding:6px 0;border-bottom:1px solid #e2e8f0">Product</th>
    <th style="text-align:right;padding:6px 0;border-bottom:1px solid #e2e8f0">Packs</th>
    <th style="text-align:right;padding:6px 0;border-bottom:1px solid #e2e8f0">Bulk price / pack</th>
  </tr>
  ${e.items
    .map(
      (i) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9">${escapeHtml(i.productName)}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right">${Number(i.quantity).toLocaleString("en-IN")}</td>
        <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right">${
          i.bulkUnitPrice != null
            ? `${inr(i.bulkUnitPrice)} <span style="color:#94a3b8;text-decoration:line-through">${inr(i.unitPrice)}</span>`
            : "On quote"
        }</td>
      </tr>`
    )
    .join("")}
  ${
    e.estimatedTotal > 0
      ? `<tr><td colspan="2" style="padding:6px 0">Retail value</td><td style="text-align:right;color:#94a3b8;text-decoration:line-through">${inr(e.retailTotal)}</td></tr>
         <tr><td colspan="2" style="padding:6px 0;font-weight:bold">Estimated bulk total (${e.discountPercent}% off)</td><td style="text-align:right;font-weight:bold">${inr(e.estimatedTotal)}</td></tr>`
      : ""
  }
</table>
<p style="font-size:12px;color:#64748b">Estimate excludes shipping; final amount is confirmed in the quote.</p>`;

export const bulkEnquiryAdminEmail = (e) => ({
  subject: `Bulk order enquiry — ${e.organization || e.name}${e.city ? ` (${e.city})` : ""}`,
  html: layout(
    "New bulk order / quote request",
    `<p style="font-size:14px">
       <strong>${escapeHtml(e.name)}</strong>${e.organization ? ` · ${escapeHtml(e.organization)}` : ""}${e.businessType ? ` · ${escapeHtml(e.businessType)}` : ""}<br/>
       ${escapeHtml(e.email)} · ${escapeHtml(e.phone)}${e.city ? `<br/>${escapeHtml(e.city)}` : ""}${e.gstin ? `<br/>GSTIN: ${escapeHtml(e.gstin)}` : ""}
     </p>
     ${bulkItemsTable(e)}
     ${e.message ? `<p style="font-size:14px;white-space:pre-wrap;margin-top:16px">${escapeHtml(e.message)}</p>` : ""}
     <p style="margin-top:16px"><a href="${clientUrl()}/admin/bulk-enquiries" style="color:#037D8F">Open in admin panel</a></p>`
  ),
});

export const bulkEnquiryAckEmail = (e) => ({
  subject: "We've received your bulk order enquiry — GADCO ZEN",
  html: layout(
    `Thanks, ${e.name}!`,
    `<p style="font-size:14px">We've received your bulk order request and our team will get back to you with a quote within 1 business day.</p>
     ${bulkItemsTable(e)}
     <p style="font-size:13px;color:#64748b;margin-top:16px">GADCO ZEN is powered by Vama Clinic.</p>`
  ),
});
