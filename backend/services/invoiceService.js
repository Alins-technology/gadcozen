import PDFDocument from "pdfkit";
import Order from "../models/Order.js";
import Counter from "../models/Counter.js";

// ---------------------------------------------------------------------------
// Invoices
// Seller details come from backend/.env (BUSINESS_*), so the client's legal
// details can be filled in without touching code. Product prices on the site
// are GST-inclusive; the tax shown on the invoice is the GST contained in
// the total, split into CGST+SGST (same state) or IGST (other state).
// ---------------------------------------------------------------------------

export const getSeller = () => ({
  brand: process.env.BUSINESS_BRAND_NAME || "GADCO ZEN",
  legalName: process.env.BUSINESS_LEGAL_NAME || "",
  address: process.env.BUSINESS_ADDRESS || "",
  state: process.env.BUSINESS_STATE || "",
  gstin: process.env.BUSINESS_GSTIN || "",
  email: process.env.BUSINESS_EMAIL || "",
  phone: process.env.BUSINESS_PHONE || "",
  hsn: process.env.INVOICE_HSN_CODE || "",
  gstRate: Number(process.env.GST_RATE_PERCENT ?? 18) || 0,
  prefix: process.env.INVOICE_PREFIX || "GZ",
});

// Indian financial year (Apr–Mar), e.g. "2026-27".
const financialYear = (date = new Date()) => {
  const y = date.getFullYear();
  const start = date.getMonth() >= 3 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
};

// Gives the order a sequential invoice number exactly once (e.g. GZ/2026-27/0001).
export const ensureInvoiceNumber = async (order) => {
  if (order.invoiceNumber) return order;
  const now = new Date();
  const fy = financialYear(now);
  const { prefix } = getSeller();
  const counter = await Counter.findOneAndUpdate(
    { _id: `invoice-${fy}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const invoiceNumber = `${prefix}/${fy}/${String(counter.seq).padStart(4, "0")}`;
  // Only set if still empty, so two concurrent callers can't overwrite each other.
  const updated = await Order.findOneAndUpdate(
    { _id: order._id, invoiceNumber: { $in: [null, ""] } },
    { $set: { invoiceNumber, invoiceDate: now } },
    { new: true }
  );
  return updated || (await Order.findById(order._id));
};

// Invoices exist only for orders that are actually placed/paid.
export const isInvoiceable = (order) =>
  order &&
  order.orderStatus !== "Pending" &&
  (order.paymentMethod === "cod" || ["paid", "refunded"].includes(order.paymentStatus));

const rs = (n = 0) =>
  `Rs. ${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const round2 = (n) => Math.round(n * 100) / 100;

const paymentText = (order) =>
  ({
    cod: "Cash on Delivery",
    razorpay: `Paid online (Razorpay)${order.paymentInfo?.razorpayPaymentId ? ` - ${order.paymentInfo.razorpayPaymentId}` : ""}`,
    mock_online: "Online (test mode)",
  })[order.paymentMethod] || order.paymentMethod;

export const taxBreakup = (order, seller = getSeller()) => {
  if (!seller.gstin || !seller.gstRate) return null;
  const rate = seller.gstRate / 100;
  const taxable = round2(order.total / (1 + rate));
  const gst = round2(order.total - taxable);
  const sameState =
    seller.state &&
    String(order.shippingAddress?.state || "").trim().toLowerCase() === seller.state.trim().toLowerCase();
  return sameState
    ? { taxable, lines: [[`CGST @ ${seller.gstRate / 2}%`, round2(gst / 2)], [`SGST @ ${seller.gstRate / 2}%`, round2(gst - round2(gst / 2))]] }
    : { taxable, lines: [[`IGST @ ${seller.gstRate}%`, gst]] };
};

// Builds the invoice PDF and resolves with a Buffer.
export const buildInvoicePdf = (order) =>
  new Promise((resolve, reject) => {
    const seller = getSeller();
    const doc = new PDFDocument({ size: "A4", margin: 48 });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const teal = "#037D8F";
    const grey = "#64748b";
    const left = 48;
    const right = doc.page.width - 48;
    const width = right - left;
    const tax = taxBreakup(order, seller);

    // Header
    doc.fillColor(teal).font("Helvetica-Bold").fontSize(22).text(seller.brand, left, 48);
    doc
      .fillColor("#0f172a")
      .fontSize(14)
      .text(tax ? "TAX INVOICE" : "INVOICE", left, 52, { width, align: "right" });

    doc.moveDown(0.6).font("Helvetica").fontSize(9).fillColor(grey);
    const sellerLines = [
      seller.legalName,
      seller.address,
      seller.gstin ? `GSTIN: ${seller.gstin}` : "",
      [seller.email, seller.phone].filter(Boolean).join("  |  "),
    ].filter(Boolean);
    doc.text(sellerLines.join("\n"), left, 80, { width: width / 2 });

    const date = order.invoiceDate || order.paymentInfo?.paidAt || order.createdAt || new Date();
    const meta = [
      ["Invoice No.", order.invoiceNumber || "-"],
      ["Invoice Date", new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
      ["Order No.", order.orderNumber],
      ["Payment", paymentText(order)],
    ];
    let my = 80;
    meta.forEach(([k, v]) => {
      doc.fillColor(grey).text(k, left + width / 2, my, { width: 80 });
      doc.fillColor("#0f172a").text(v, left + width / 2 + 80, my, { width: width / 2 - 80, align: "right" });
      my = doc.y + 3;
    });

    // Bill to
    let y = Math.max(doc.y, 150) + 16;
    doc.moveTo(left, y).lineTo(right, y).strokeColor("#e2e8f0").stroke();
    y += 12;
    const a = order.shippingAddress || {};
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#0f172a").text("Bill / Ship To", left, y);
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#334155")
      .text(
        [
          a.fullName,
          [a.line1, a.line2].filter(Boolean).join(", "),
          `${a.city}, ${a.state} - ${a.postalCode}`,
          a.country || "India",
          `Phone: ${a.phone}`,
          order.contactEmail,
        ]
          .filter(Boolean)
          .join("\n"),
        left,
        y + 14,
        { width: width / 2 }
      );
    const afterAddress = doc.y;
    if (tax) {
      doc.fillColor(grey).text(`Place of supply: ${a.state}`, left + width / 2, y + 14, { width: width / 2, align: "right" });
    }

    // Items table
    y = afterAddress + 18;
    const cols = seller.hsn
      ? [
          ["#", 24, "left"],
          ["Item", width - 24 - 60 - 40 - 80 - 90, "left"],
          ["HSN", 60, "left"],
          ["Qty", 40, "right"],
          ["Rate", 80, "right"],
          ["Amount", 90, "right"],
        ]
      : [
          ["#", 24, "left"],
          ["Item", width - 24 - 40 - 80 - 90, "left"],
          ["Qty", 40, "right"],
          ["Rate", 80, "right"],
          ["Amount", 90, "right"],
        ];
    const drawRow = (values, rowY, opts = {}) => {
      let x = left;
      let h = 0;
      doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica").fontSize(9).fillColor(opts.color || "#0f172a");
      values.forEach((v, i) => {
        const [, w, align] = cols[i];
        doc.text(String(v), x + 4, rowY, { width: w - 8, align });
        h = Math.max(h, doc.heightOfString(String(v), { width: w - 8 }));
        x += w;
      });
      return rowY + h + 8;
    };

    doc.rect(left, y - 4, width, 20).fill("#f1f5f9");
    y = drawRow(cols.map((c) => c[0]), y + 2, { bold: true });
    order.items.forEach((item, idx) => {
      const row = [idx + 1, item.name];
      if (seller.hsn) row.push(seller.hsn);
      row.push(item.quantity, rs(item.price), rs(item.price * item.quantity));
      y = drawRow(row, y);
      doc.moveTo(left, y - 4).lineTo(right, y - 4).strokeColor("#f1f5f9").stroke();
    });

    // Totals
    y += 8;
    const totalRows = [["Subtotal", rs(order.subtotal)]];
    if (order.discount > 0) totalRows.push([`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`, `- ${rs(order.discount)}`]);
    totalRows.push(["Shipping", order.shippingCost ? rs(order.shippingCost) : "Free"]);
    if (order.codFee > 0) totalRows.push(["COD charges", rs(order.codFee)]);
    const labelX = left + width - 260;
    totalRows.forEach(([k, v]) => {
      doc.font("Helvetica").fontSize(9).fillColor("#334155").text(k, labelX, y, { width: 160 });
      doc.text(v, labelX + 160, y, { width: 100, align: "right" });
      y += 16;
    });
    doc.moveTo(labelX, y).lineTo(right, y).strokeColor("#cbd5e1").stroke();
    y += 8;
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#0f172a").text("Grand Total", labelX, y, { width: 160 });
    doc.text(rs(order.total), labelX + 160, y, { width: 100, align: "right" });
    y += 22;

    if (tax) {
      doc.font("Helvetica").fontSize(8.5).fillColor(grey);
      doc.text("Tax included in the above total:", labelX, y, { width: 260 });
      y += 13;
      [["Taxable value", tax.taxable], ...tax.lines].forEach(([k, v]) => {
        doc.text(k, labelX, y, { width: 160 });
        doc.text(rs(v), labelX + 160, y, { width: 100, align: "right" });
        y += 13;
      });
    } else {
      doc.font("Helvetica").fontSize(8.5).fillColor(grey).text("All prices are inclusive of applicable taxes.", labelX, y, { width: 260 });
      y += 13;
    }

    if (order.paymentStatus === "refunded") {
      y += 10;
      doc.font("Helvetica-Bold").fontSize(10).fillColor("#b91c1c").text("This order was cancelled and refunded.", left, y, { width });
      y += 16;
    }

    // Footer
    const footY = doc.page.height - 110;
    doc.moveTo(left, footY).lineTo(right, footY).strokeColor("#e2e8f0").stroke();
    doc
      .font("Helvetica")
      .fontSize(8.5)
      .fillColor(grey)
      .text(
        `Thank you for shopping with ${seller.brand}!\nThis is a computer-generated invoice and does not require a signature.`,
        left,
        footY + 10,
        { width, align: "center" }
      );

    doc.end();
  });

export const invoiceFileName = (order) =>
  `Invoice-${(order.invoiceNumber || order.orderNumber).replace(/[^\w-]+/g, "-")}.pdf`;
