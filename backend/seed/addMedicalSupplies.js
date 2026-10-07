// Adds (or updates) the Medical Supplies category and its products on an
// EXISTING database — safe to run on the live store.
//
// Unlike seed.js it deletes nothing: orders, users, reviews, coupons and the
// existing skincare products are left exactly as they are. Products are
// matched by SKU, so running it again only refreshes their details.
//
// Usage (from backend/):
//   npm run seed:medical
//
// Note: price and stock are only written when a product is first created, so
// any changes made later in the Admin panel are never overwritten. Pass
// --update-prices to force the values from medicalSuppliesData.js.

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { medicalCategory, medicalProducts } from "./medicalSuppliesData.js";

dotenv.config();

const run = async () => {
  const updatePrices = process.argv.includes("--update-prices");
  await connectDB();

  let category = await Category.findOne({ name: medicalCategory.name });
  if (!category) {
    category = await Category.create(medicalCategory);
    console.log(`[medical] Created category "${category.name}" (/category/${category.slug})`);
  } else {
    Object.assign(category, { description: medicalCategory.description, image: medicalCategory.image, isActive: true });
    await category.save();
    console.log(`[medical] Category "${category.name}" already exists — details refreshed.`);
  }

  for (const data of medicalProducts) {
    const existing = await Product.findOne({ sku: data.sku });
    if (!existing) {
      const product = await Product.create({ ...data, category: category._id });
      console.log(`[medical] + ${product.name}  ->  /product/${product.slug}`);
      continue;
    }
    const { price, compareAtPrice, stock, ...content } = data;
    Object.assign(existing, content, { category: category._id });
    if (updatePrices) Object.assign(existing, { price, compareAtPrice });
    await existing.save();
    console.log(`[medical] ~ ${existing.name} (updated${updatePrices ? ", prices reset" : ""})`);
  }

  console.log("\n[medical] Done. Review prices & stock in Admin -> Products.");
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("[medical] Failed:", err);
  process.exit(1);
});
