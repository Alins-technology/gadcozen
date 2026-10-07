import BulkEnquiry, { BULK_STATUSES } from "../models/BulkEnquiry.js";
import Product from "../models/Product.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BULK_DISCOUNT_PERCENT, bulkUnitPrice } from "../config/store.js";
import { sendEmail } from "../utils/sendEmail.js";
import { bulkEnquiryAdminEmail, bulkEnquiryAckEmail } from "../utils/emailTemplates.js";

// @route POST /api/bulk-enquiries
export const createBulkEnquiry = asyncHandler(async (req, res) => {
  const { name, organization, businessType, email, phone, city, gstin, message } = req.body;

  // Never trust product names/prices from the client — resolve them from the DB.
  const requested = (req.body.items || []).slice(0, 30);
  const ids = requested.map((i) => i.product).filter(Boolean);
  const products = ids.length ? await Product.find({ _id: { $in: ids } }).select("name price") : [];
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const items = requested
    .map((i) => {
      const quantity = Math.floor(Number(i.quantity));
      const product = i.product ? byId.get(String(i.product)) : null;
      const productName = product ? product.name : i.product ? null : String(i.productName || "").trim().slice(0, 200);
      if (!productName || !Number.isFinite(quantity) || quantity < 1) return null;
      if (!product) return { productName, quantity };
      return {
        product: product._id,
        productName,
        quantity,
        unitPrice: product.price,
        bulkUnitPrice: bulkUnitPrice(product.price),
      };
    })
    .filter(Boolean);

  if (items.length === 0) {
    return res.status(400).json({ message: "Please add at least one product with a quantity." });
  }

  const priced = items.filter((i) => i.unitPrice != null);
  const retailTotal = priced.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const estimatedTotal = priced.reduce((sum, i) => sum + i.bulkUnitPrice * i.quantity, 0);

  const enquiry = await BulkEnquiry.create({
    name, organization, businessType, email, phone, city, gstin, message, items,
    discountPercent: BULK_DISCOUNT_PERCENT,
    retailTotal,
    estimatedTotal,
  });

  if (process.env.ADMIN_NOTIFY_EMAIL) {
    sendEmail({ to: process.env.ADMIN_NOTIFY_EMAIL, replyTo: enquiry.email, ...bulkEnquiryAdminEmail(enquiry) });
  }
  sendEmail({ to: enquiry.email, ...bulkEnquiryAckEmail(enquiry) });

  res.status(201).json({
    message: "Thanks! Our team will share a quote within 1 business day.",
    enquiryId: enquiry._id,
  });
});

// @route GET /api/bulk-enquiries (admin)
export const getBulkEnquiries = asyncHandler(async (req, res) => {
  const enquiries = await BulkEnquiry.find({}).sort({ createdAt: -1 }).limit(500);
  res.json({ enquiries, statuses: BULK_STATUSES });
});

// @route PUT /api/bulk-enquiries/:id (admin)
export const updateBulkEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await BulkEnquiry.findById(req.params.id);
  if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });
  if (req.body.status !== undefined) {
    if (!BULK_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    enquiry.status = req.body.status;
  }
  if (req.body.adminNotes !== undefined) enquiry.adminNotes = String(req.body.adminNotes).slice(0, 2000);
  await enquiry.save();
  res.json({ enquiry });
});
