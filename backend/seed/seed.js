// Seeds the database with an admin user, a demo customer, 4 categories,
// and 8 GADCO ZEN products (7 active + "Body Moisturizing Cream" kept
// inactive until its real photo/content is supplied).
//
// Usage:
//   npm run seed            populate the database
//   npm run seed:destroy    wipe all seeded collections
//
// Credentials come from backend/.env (see .env.example) so they are never
// hardcoded here. Change them before deploying anywhere real.

import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../config/db.js";

import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";

dotenv.config();

const categoriesData = [
  {
    name: "Cleansers",
    description: "Foaming face washes that clear away the day without stripping your skin.",
    image: "/images/products/foaming-face-wash/foaming-face-wash.png",
  },
  {
    name: "Hair Care",
    description: "Scalp-first formulas built around keratin, caffeine, and onion extract.",
    image: "/images/products/hair-growth-shampoo/hair-growth-shampoo.png",
  },
  {
    name: "Body Care",
    description: "Everyday moisturizers for soft, non-greasy skin from head to toe.",
    image: "/images/products/body-moisturizing-lotion/body-moisturizing-lotion.png",
  },
  {
    name: "Sun Care",
    description: "Lightweight, non-comedogenic SPF 50 protection for daily wear.",
    image: "/images/products/SPF50-sunscreen/spf-50-sunscreen-gel.png",
  },
];

// name -> category name, keeps the mapping explicit and easy to audit
const productsData = [
  {
    name: "GADCO ZEN Foaming Face Wash",
    categoryName: "Cleansers",
    quantity: "100 ml",
    price: 499,
    compareAtPrice: 599,
    stock: 60,
    sku: "GZ-FW-100",
    images: [
      "/images/products/foaming-face-wash/foaming-face-wash.png",
      "/images/products/foaming-face-wash/foaming-face-wash-ingredients.png",
      "/images/products/foaming-face-wash/foaming-face-wash-who-is-it-for.png",
      "/images/products/foaming-face-wash/foaming-face-wash-how-to-use.png",
    ],
    shortDescription:
      "A foaming cleanser with an advanced formula for oily and acne-prone skin, powered by salicylic and glycolic acid.",
    description:
      "GADCO ZEN Foaming Face Wash is formulated with advanced actives to deep cleanse, control excess oil and help prevent breakouts, while soothing and refreshing oily, acne-prone, and dull, congested skin.",
    benefits: ["Deep Cleanses", "Controls Excess Oil", "Helps Prevent Breakouts", "Refreshes Skin"],
    ingredients: [
      { name: "Aqua", benefit: "Helps hydrate and refresh the skin" },
      { name: "Sodium Laureth Sulfate", benefit: "Cleanses skin by removing dirt, oil and impurities" },
      { name: "Cocamidopropyl Betaine", benefit: "Boosts foam and helps reduce irritation" },
      { name: "Aloe Barbadensis (Leaf) Extract", benefit: "Soothes and hydrates the skin, helps calm irritation" },
      { name: "Salicylic Acid", benefit: "BHA that unclogs pores, reduces excess oil and helps prevent breakouts" },
      { name: "Glycolic Acid", benefit: "AHA that exfoliates dead skin cells and promotes cell renewal" },
      { name: "Panthenol", benefit: "Pro-Vitamin B5 that hydrates, soothes and strengthens the skin barrier" },
      { name: "Triclosan", benefit: "Helps fight acne-causing bacteria and supports clearer skin" },
      { name: "Perfume", benefit: "Gives a pleasant fragrance and refreshing feel" },
    ],
    howToUse:
      "Splash your face with water to wet your skin. Pump an adequate amount onto your palm and gently massage onto your face in circular motions, avoiding the eye area. Rinse thoroughly with water and pat dry, then follow with your serum and moisturizer. Use twice daily (morning & night) as part of your daily skincare routine. For external use only - avoid contact with eyes.",
    featured: true,
    bestseller: true,
    tags: ["face wash", "cleanser", "foaming", "oily skin", "acne"],
  },
  {
    name: "GADCO ZEN Hair Growth Shampoo",
    categoryName: "Hair Care",
    quantity: "100 ml",
    price: 399,
    compareAtPrice: 499,
    stock: 45,
    sku: "GZ-SH-100",
    images: [
      "/images/products/hair-growth-shampoo/hair-growth-shampoo.png",
      "/images/products/hair-growth-shampoo/hair-growth-shampoo-ingredients.png",
      "/images/products/hair-growth-shampoo/hair-growth-shampoo-who-is-it-for.png",
      "/images/products/hair-growth-shampoo/hair-growth-shampoo-how-to-use.png",
    ],
    shortDescription:
      "A scalp-care shampoo with keratin, caffeine, onion extract and saw palmetto that strengthens hair and reduces hair fall.",
    description:
      "GADCO ZEN Hair Growth Shampoo combines keratin, caffeine, onion extract and saw palmetto to strengthen hair, reduce hair fall, promote hair growth and nourish the scalp. Suitable for all hair types, including color-treated hair.",
    benefits: ["Strengthens Hair", "Reduces Hair Fall", "Promotes Hair Growth", "Nourishes the Scalp"],
    ingredients: [
      { name: "Aqua", benefit: "The base ingredient that helps hydrate and cleanse" },
      { name: "Keratin", benefit: "Helps strengthen hair, improves elasticity and reduces breakage" },
      { name: "Caffeine", benefit: "Helps stimulate hair follicles, promotes hair growth and reduces hair fall" },
      { name: "Onion Extract", benefit: "Nourishes the scalp, improves blood circulation and supports healthy hair growth" },
      { name: "Saw Palmetto", benefit: "Helps block DHT, reduces hair fall and supports thicker, healthier hair" },
      {
        name: "Additional Actives (Dimethicone, Polyquaternium-10, Glycerin, Hydrolysed Keratin, Cocamide MEA, Guar Hydroxypropyltrimonium Chloride & more)",
        benefit: "Supporting conditioning and texture actives",
      },
    ],
    howToUse:
      "Thoroughly wet your hair with water. Take an adequate amount of shampoo and apply on scalp and hair, gently massaging with fingertips for 1-2 minutes to stimulate hair roots. Rinse well with water until hair and scalp are completely clean. For best results, follow with a conditioner or hair serum. Use 2-3 times a week as part of a regular hair care routine. For external use only - avoid contact with eyes.",
    featured: true,
    bestseller: true,
    tags: ["shampoo", "hair growth", "keratin", "caffeine", "onion extract"],
  },
  {
    name: "GADCO ZEN Body Moisturizing Lotion",
    categoryName: "Body Care",
    quantity: "100 g",
    price: 499,
    compareAtPrice: 599,
    stock: 70,
    sku: "GZ-BL-100",
    images: [
      "/images/products/body-moisturizing-lotion/body-moisturizing-lotion.png",
      "/images/products/body-moisturizing-lotion/body-moisturizing-lotion-ingredients.png",
      "/images/products/body-moisturizing-lotion/body-moisturizing-lotion-who-is-it-for.png",
      "/images/products/body-moisturizing-lotion/body-moisturizing-lotion-how-to-use.png",
    ],
    shortDescription:
      "A non-greasy body lotion for normal to dry skin that nourishes deeply and locks in long-lasting hydration.",
    description:
      "GADCO ZEN Body Moisturizing Lotion is formulated for normal to dry skin, offering deep nourishment and long-lasting moisture. It soothes and calms the skin, smooths away rough and flaky texture, and absorbs quickly without leaving a greasy residue - ideal for daily hydration and healthy-looking, smooth skin.",
    benefits: [
      "Nourishes & Hydrates Deeply",
      "Soothes & Calms the Skin",
      "Provides Long-Lasting Moisture",
      "Non-Greasy & Fast Absorbing",
    ],
    ingredients: [
      { name: "Aqua", benefit: "Base ingredient that hydrates, refreshes and nourishes the skin" },
      { name: "Aloe Barbadensis Leaf Extract", benefit: "Soothes irritation, hydrates and promotes healthy skin" },
      { name: "Glycerin", benefit: "A powerful humectant that helps lock in moisture and prevents dryness" },
      { name: "Kokum Butter", benefit: "Deeply nourishes and moisturizes, leaving skin soft and smooth" },
      { name: "Tocopheryl Acetate (Vitamin E)", benefit: "An antioxidant that helps protect skin from damage and supports healthy, radiant skin" },
    ],
    howToUse:
      "Pump out the right amount of lotion on your palm. Gently apply all over your body or on dry areas. Massage in circular motions until fully absorbed. Use daily, preferably after bath, for best results. For external use only - avoid contact with eyes, discontinue use if irritation occurs and store in a cool, dry place.",
    featured: true,
    bestseller: false,
    tags: ["body lotion", "moisturizer", "body care"],
  },
  {
    name: "GADCO ZEN SPF 50 Sunscreen Gel",
    categoryName: "Sun Care",
    quantity: "50 g",
    price: 549,
    compareAtPrice: 649,
    stock: 55,
    sku: "GZ-SS-50",
    images: [
      "/images/products/SPF50-sunscreen/spf-50-sunscreen-gel.png",
      "/images/products/SPF50-sunscreen/spf-50-sunscreen-gel-ingredients.png",
      "/images/products/SPF50-sunscreen/spf-50-sunscreen-gel-who-is-it-for.png",
      "/images/products/SPF50-sunscreen/spf-50-sunscreen-gel-how-to-use.png",
    ],
    shortDescription: "A lightweight, non-comedogenic SPF 50 gel with broad spectrum UVA/UVB protection, perfect for every skin type that needs daily sun protection.",
    description:
      "GADCO ZEN SPF 50 Sunscreen Gel offers broad spectrum UVA/UVB protection in a lightweight, non-greasy gel that hydrates and soothes the skin. Suitable for all skin types, it's ideal for daily sun protection, preventing sun damage and maintaining healthy skin - perfect for outdoor exposure and bright sunny days.",
    benefits: [
      "Protects from UVA/UVB Rays",
      "Lightweight & Non-Greasy",
      "Hydrates & Soothes Skin",
      "Non-Comedogenic & Suitable for All Skin Types",
    ],
    ingredients: [
      { name: "Aqua", benefit: "Base ingredient that helps hydrate and refresh the skin" },
      { name: "Homosalate", benefit: "UV filter that helps protect skin from UVB rays" },
      { name: "Octyl Salicylate", benefit: "UV filter that helps absorb UVB rays and prevents sun damage" },
      { name: "Octocrylene", benefit: "Broad spectrum UV filter that helps protect from UVA and UVB rays" },
      { name: "Cetostearyl Alcohol", benefit: "Emollient that helps soften and smooth the skin" },
      { name: "Glycerol Monostearate", benefit: "Emulsifier that helps blend ingredients and keeps skin moisturized" },
    ],
    howToUse:
      "Take an adequate amount of sunscreen gel and apply evenly on face, neck and exposed areas. Massage gently until fully absorbed. Apply 15-20 minutes before stepping out in the sun. Reapply every 2-3 hours for continued protection. Use daily, every morning, for best results. For external use only - avoid contact with eyes; in case of contact, rinse thoroughly with water. Discontinue use if irritation occurs and store in a cool, dry place.",
    featured: true,
    bestseller: true,
    tags: ["sunscreen", "spf 50", "sun care"],
  },
  {
    name: "GADCO ZEN Fusion Sunscreen",
    categoryName: "Sun Care",
    quantity: "50 g",
    price: 549,
    compareAtPrice: 649,
    stock: 40,
    sku: "GZ-FS-50",
    images: [
      "/images/products/fusion-sunscreen/fusion-sunscreen.png",
      "/images/products/fusion-sunscreen/fusion-sunscreen-ingredients.png",
      "/images/products/fusion-sunscreen/fusion-sunscreen-how-to-use.png",
    ],
    shortDescription:
      "A lightweight, non-sticky SPF 50 sunscreen for daily wear, ideal for oily, combination and normal skin.",
    description:
      "GADCO ZEN Fusion Sunscreen SPF 50 is designed for everyday sun protection with a lightweight, non-sticky, non-greasy finish. It offers broad spectrum UVA/UVB protection in a non-comedogenic formula, making it a comfortable daily choice for oily, combination and normal skin during everyday outdoor exposure.",
    benefits: [
      "Broad Spectrum SPF 50 UVA/UVB Protection",
      "Lightweight & Comfortable Everyday Feel",
      "Non-Sticky, No Heavy or Tacky Finish",
      "Non-Comedogenic - Won't Clog Pores",
    ],
    ingredients: [
      { name: "Octyl Methoxycinnamate", benefit: "Absorbs UVB rays and helps prevent sunburn" },
      { name: "Homosalate", benefit: "UVB filter that boosts broad spectrum protection" },
      { name: "Avobenzone", benefit: "Broad spectrum UVA filter, shields against photoaging" },
      { name: "Oxybenzone", benefit: "UVA/UVB filter for broad spectrum coverage" },
      { name: "Titanium Dioxide", benefit: "Physical sunscreen agent" },
      { name: "Glycerine", benefit: "Humectant that helps hydrate the skin" },
      { name: "Shea Butter", benefit: "Nourishes and softens the skin" },
    ],
    howToUse:
      "Start with a clean, dry face using a gentle cleanser. Take an adequate amount (about a coin size) on your fingertips and apply evenly to face and neck, massaging gently until fully absorbed. Reapply every 2-3 hours for best protection, especially after sweating or water exposure. Use daily as the last step of your morning routine; can be worn under makeup.",
    featured: false,
    bestseller: false,
    tags: ["sunscreen", "spf 50", "fusion", "sun care"],
  },
  {
    name: "GADCO ZEN AHA BHA Foaming Face Wash",
    categoryName: "Cleansers",
    quantity: "100 ml",
    price: 499,
    compareAtPrice: 599,
    stock: 65,
    sku: "GZ-AB-100",
    images: [
      "/images/products/aha-bha-foaming-face-wash/aha-bha-foaming-face-wash.png",
      "/images/products/aha-bha-foaming-face-wash/aha-bha-foaming-face-wash-ingredients.png",
      "/images/products/aha-bha-foaming-face-wash/aha-bha-foaming-face-wash-who-is-it-for.png",
    ],
    shortDescription: "A foaming cleanser for oily & acne skin that deep cleanses and controls excess oil.",
    description:
      "GADCO ZEN AHA BHA Foaming Face Wash is formulated for oily and acne-prone skin, deep cleansing and removing impurities while helping control excess oil and refresh the skin.",
    benefits: [
      "For Oily & Acne Skin",
      "Deep Cleanses & Removes Impurities",
      "Controls Excess Oil",
      "Helps Prevent Acne & Breakouts",
      "Refreshes & Revitalizes Skin",
    ],
    ingredients: [
      { name: "Aqua", benefit: "Helps cleanse and refresh the skin" },
      { name: "Aloe Barbadensis (Leaf) Extract", benefit: "Soothes and hydrates irritated skin" },
      { name: "Glycolic Acid", benefit: "Gently exfoliates dead skin cells and promotes renewal" },
      { name: "Glycyrrhiza Glabra (Licorice) Root Extract", benefit: "Helps calm skin and reduces the look of blemishes" },
      { name: "Salicylic Acid", benefit: "Helps unclog pores and control excess oil" },
      { name: "Panthenol", benefit: "Helps hydrate and strengthen the skin barrier" },
      { name: "Triclosan", benefit: "Helps keep skin clean and clear" },
    ],
    // Revised, website-friendly usage copy (replaces the older instruction-manual
    // style draft) - matching graphic still to be redesigned to this text.
    howToUse:
      "Gently wet your face with clean water. Pump a small, adequate amount onto your palm and massage over the face in circular motions, avoiding the eye area. Rinse thoroughly with water and pat dry, then follow with your preferred serum and moisturizer. Use AM & PM as part of your daily routine - the AHA + BHA formula helps cleanse away impurities, excess oil and dead skin buildup.",
    featured: true,
    bestseller: true,
    newArrival: true,
    tags: ["face wash", "aha bha", "oily skin", "acne"],
  },
  {
    name: "GADCO ZEN Hair Mask",
    categoryName: "Hair Care",
    quantity: "200 g",
    price: 999,
    compareAtPrice: 1099,
    stock: 30,
    sku: "GZ-HM-200",
    images: [
      "/images/products/Hair-mask/hair-mask.png",
      "/images/products/Hair-mask/hair-mask-ingredients.png",
      "/images/products/Hair-mask/hair-mask-who-is-it-for.png",
      "/images/products/Hair-mask/hair-mask-how-to-use.png",
    ],
    shortDescription:
      "A deep conditioning hair mask that nourishes dry, damaged hair and leaves it smoother and more manageable.",
    description:
      "GADCO ZEN Deep Conditioning Hair Mask deeply nourishes dry and damaged hair, helping restore moisture and softness. It smoothens frizz, strengthens hair to improve elasticity and reduce breakage, and adds shine for healthier-looking, more manageable hair. Suitable for all hair types.",
    benefits: [
      "Deep Nourishment for Dry & Damaged Hair",
      "Smoother, Shinier Hair",
      "Reduces Frizz & Improves Manageability",
      "Stronger, Healthier-Looking Hair",
    ],
    ingredients: [
      { name: "Aqua", benefit: "Hydrates hair and helps maintain moisture balance" },
      { name: "Cetrimonium Chloride", benefit: "Conditions and detangles hair while reducing frizz" },
      { name: "Cyclomethicone / Cyclopentasiloxane", benefit: "Silicone blend that smooths, softens and adds shine" },
      { name: "Caffeine", benefit: "Helps stimulate hair roots and supports healthy-looking hair" },
      { name: "Seaweed Extract", benefit: "Nourishes hair with essential minerals and helps retain moisture" },
      { name: "Tocopheryl Acetate (Vitamin E)", benefit: "Antioxidant that helps protect hair from damage and supports strength" },
      { name: "Collagen", benefit: "Helps improve hair elasticity, strength and manageability" },
    ],
    howToUse:
      "Shampoo hair and rinse thoroughly. Take an adequate amount of hair mask and apply evenly from mid-lengths to ends, avoiding the scalp. Leave on for 5-10 minutes (up to 15 minutes for extra conditioning), then rinse thoroughly with water. Use 1-2 times a week or as needed. For external use only - avoid contact with eyes.",
    featured: true,
    bestseller: false,
    tags: ["hair mask", "hair care", "deep conditioning"],
  },
  // --- Body Moisturizing Cream: added on request, no real photo/description
  // supplied yet. isActive is false until someone fills in the real product
  // photo, description, ingredients and confirmed pack size via Admin Panel
  // -> Products -> Edit, then flips "Active" back on. It IS visible right
  // now under Admin -> Products (the admin list shows inactive products too).
  {
    name: "GADCO ZEN Body Moisturizing Cream",
    categoryName: "Body Care",
    quantity: "200 g", // PLACEHOLDER - confirm real pack size
    price: 499,
    compareAtPrice: 599,
    stock: 30,
    sku: "GZ-BC-200",
    images: [],
    shortDescription: "PLACEHOLDER - add the real product description before publishing.",
    description: "PLACEHOLDER - add the real product description before publishing.",
    benefits: [],
    ingredients: [],
    howToUse: "PLACEHOLDER - add real usage instructions.",
    featured: false,
    bestseller: false,
    isActive: false,
    tags: ["body cream", "moisturizer", "body care"],
  },
];

const demoReviews = [
  { rating: 5, title: "Gentle and effective", comment: "My skin feels clean without being tight or dry afterward. This is a demo review for showcase purposes." },
  { rating: 4, title: "Nice everyday product", comment: "Works well as part of my daily routine. This is a demo review for showcase purposes." },
];

const run = async () => {
  await connectDB();
  const destroy = process.argv.includes("--destroy");

  if (destroy) {
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Cart.deleteMany({}),
      Wishlist.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
      Coupon.deleteMany({}),
    ]);
    console.log("[seed] All collections cleared.");
    process.exit(0);
  }

  // Wipe product/category/review/coupon data for a clean re-seed, but leave
  // orders alone so re-running seed doesn't destroy order history.
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Review.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  // --- Users ---
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@gadcozen.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "GADCO ZEN Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
  }

  const customerEmail = (process.env.DEMO_CUSTOMER_EMAIL || "customer@gadcozen.com").toLowerCase();
  const customerPassword = process.env.DEMO_CUSTOMER_PASSWORD || "Customer@12345";
  let customer = await User.findOne({ email: customerEmail });
  if (!customer) {
    customer = await User.create({
      name: "Demo Customer",
      email: customerEmail,
      password: customerPassword,
      role: "customer",
    });
    await Cart.create({ user: customer._id, items: [] });
    await Wishlist.create({ user: customer._id, products: [] });
  }

  // --- Categories ---
  const categoryDocs = await Category.insertMany(categoriesData);
  const categoryByName = {};
  categoryDocs.forEach((c) => (categoryByName[c.name] = c));
  console.log(`[seed] Inserted ${categoryDocs.length} categories.`);

  // --- Products ---
  const productDocs = [];
  for (const p of productsData) {
    const { categoryName, ...rest } = p;
    const category = categoryByName[categoryName];
    const product = await Product.create({ ...rest, category: category._id });
    productDocs.push(product);
  }
  console.log(`[seed] Inserted ${productDocs.length} products.`);

  // --- Demo reviews (clearly marked isDemo, shown as demo content in UI) ---
  let reviewCount = 0;
  for (const product of productDocs.slice(0, 4)) {
    for (const r of demoReviews) {
      await Review.create({
        product: product._id,
        user: customer._id,
        name: "Verified Shopper",
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isDemo: true,
        verifiedPurchase: false,
      });
      reviewCount++;
    }
    const reviews = await Review.find({ product: product._id });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    product.rating = Math.round(avg * 10) / 10;
    product.reviewCount = reviews.length;
    await product.save();
  }
  console.log(`[seed] Inserted ${reviewCount} demo reviews.`);

  // --- Demo coupon ---
  await Coupon.create({
    code: "WELCOME10",
    discountPercent: 10,
    minOrderValue: 499,
    isActive: true,
  });
  console.log("[seed] Inserted demo coupon WELCOME10 (10% off, min order ₹499).");

  console.log("\n[seed] Done!");
  console.log(`[seed] Admin login   -> ${adminEmail} / ${adminPassword}`);
  console.log(`[seed] Customer login -> ${customerEmail} / ${customerPassword}`);
  console.log("[seed] Change these credentials before deploying to production.\n");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
