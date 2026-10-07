import mongoose from "mongoose";

// A "Get a Quote" request from the /bulk-orders page (clinics, hospitals,
// pharmacies, distributors). Handled manually by the team from the admin panel.
export const BULK_STATUSES = ["New", "Contacted", "Quoted", "Converted", "Closed"];

const bulkEnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    organization: { type: String, trim: true, default: "" },
    businessType: { type: String, trim: true, default: "" },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, trim: true, default: "" },
    gstin: { type: String, trim: true, default: "" },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        // per pack, at the time of the request (catalogue products only)
        unitPrice: { type: Number },
        bulkUnitPrice: { type: Number },
      },
    ],
    message: { type: String, default: "" },
    discountPercent: { type: Number, default: 0 },
    retailTotal: { type: Number, default: 0 },
    estimatedTotal: { type: Number, default: 0 },
    status: { type: String, enum: BULK_STATUSES, default: "New" },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

bulkEnquirySchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("BulkEnquiry", bulkEnquirySchema);
