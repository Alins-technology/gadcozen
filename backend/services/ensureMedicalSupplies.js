import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { medicalCategory, medicalProducts } from "../seed/medicalSuppliesData.js";

// Runs when the API starts: makes sure the Medical Supplies category and its
// products exist, so they show up without anyone having to run a seed script.
// Insert-only — it never edits anything that already exists, so prices/stock
// changed in the admin panel are always kept. To hide a product, mark it
// inactive in the admin panel (a deleted one would be re-added on restart),
// or set AUTO_ADD_MEDICAL_SUPPLIES=false.
export const ensureMedicalSupplies = async () => {
  if (process.env.AUTO_ADD_MEDICAL_SUPPLIES === "false") return;
  try {
    let category = await Category.findOne({ name: medicalCategory.name });
    if (!category) {
      category = await Category.create(medicalCategory);
      console.log(`[medical] Added category "${category.name}"`);
    }
    const skus = medicalProducts.map((p) => p.sku);
    const existing = new Set((await Product.find({ sku: { $in: skus } }).select("sku")).map((p) => p.sku));
    for (const data of medicalProducts.filter((p) => !existing.has(p.sku))) {
      await Product.create({ ...data, category: category._id });
      console.log(`[medical] Added product "${data.name}"`);
    }
  } catch (err) {
    console.error("[medical] Could not add Medical Supplies:", err.message);
  }
};
