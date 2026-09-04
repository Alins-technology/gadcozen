import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    brand: { type: String, default: "GADCO ZEN" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    quantity: { type: String, required: true }, // e.g. "100 ml", "50 g"
    images: [{ type: String }],
    ingredients: [{ name: String, benefit: String }],
    benefits: [{ type: String }],
    howToUse: { type: String, default: "" },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.pre("validate", function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

productSchema.index({ name: "text", shortDescription: "text", tags: "text" });
productSchema.index({ category: 1 });
// slug already has a unique index via `unique: true` above — no need to declare it again here.

export default mongoose.model("Product", productSchema);
