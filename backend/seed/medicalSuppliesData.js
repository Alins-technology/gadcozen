// Medical Supplies range — sold per pack in the shop AND available for bulk
// orders (clinics, hospitals, pharmacies) via /bulk-orders.
//
// Shared by seed.js (fresh databases) and addMedicalSupplies.js (adds/updates
// these on the LIVE database without touching anything else).
//
// Prices: researched from current Indian online/wholesale prices (Oct 2026)
// and the MRP printed on the pack where visible — see the comment on each
// price. compareAtPrice = MRP / strike-through price. Edit any time in
// Admin -> Products, or here + `npm run seed:medical:prices`.
// Specs come only from what is printed on the supplied pack photos.

export const medicalCategory = {
  name: "Medical Supplies",
  description:
    "Clinic & hospital consumables — syringes, IV & scalp vein sets, gloves, dressings, gauze, caps, masks, sanitizer, ultrasound gel and more. Buy per pack, or get bulk pricing for your clinic.",
  image: "/images/products/disposable-surgical-cap/disposable-surgical-cap.png",
};

const professionalUseNote =
  "For use by or under the supervision of a qualified healthcare professional. Check that the pack seal is intact and the product is within its expiry date before use. Single use only — do not reuse or re-sterilise. Dispose of used syringes and needles safely in a sharps container.";

export const medicalProducts = [
  {
    name: "Hi-Tech 1 ml Insulin Syringe with Micro-Fine Needle (Pack of 100)",
    brand: "Hi-Tech",
    quantity: "100 pcs",
    price: 549, // market: Dispovan U-100 box of 100 sells ~₹897 (MRP ₹1,031); Hi-Tech is the value brand
    compareAtPrice: 799,
    stock: 200,
    sku: "GZ-MS-INS1-100",
    images: ["/images/products/insulin-syringe-1ml/insulin-syringe-1ml.png"],
    shortDescription:
      "Sterile, single-use 1 ml insulin syringes with a micro-fine fixed needle. Multi pack of 100.",
    description:
      "Hi-Tech 1 ml Insulin Syringes come with a micro-fine needle for comfortable injections and a clearly marked 10–100 unit scale for accurate dosing. Each syringe is EO sterilised, latex free and meant for single use only. Supplied as a multi pack of 100 — a dependable everyday consumable for clinics, diabetic care centres and pharmacies. Bulk quantities available on request.",
    benefits: [
      "1 ml Insulin Syringe",
      "Micro-Fine Needle",
      "Sterile (EO) & Single Use",
      "Latex Free",
      "100 Pieces per Pack",
      "CE & ISO 13485 Marked Pack",
    ],
    ingredients: [
      { name: "Capacity", benefit: "1 ml (insulin syringe, 10–100 unit graduations)" },
      { name: "Needle", benefit: "Micro-fine, fixed needle" },
      { name: "Sterilisation", benefit: "Ethylene Oxide (EO) sterile" },
      { name: "Usage", benefit: "Single use only — do not reuse" },
      { name: "Material", benefit: "Latex free" },
      { name: "Pack Size", benefit: "100 syringes (multi pack)" },
      { name: "Certification (as on pack)", benefit: "CE, ISO 13485; ISO 9001:2015 certified company" },
    ],
    howToUse: professionalUseNote,
    tags: ["syringe", "insulin syringe", "1ml", "medical supplies", "bulk", "hi-tech"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Hi-Tech 2 ml Single Use Syringe (Pack of 100)",
    brand: "Hi-Tech",
    quantity: "100 pcs",
    price: 399, // market: Moglix ₹436, MRP ₹800 for this exact Hi-Tech 2 ml box of 100
    compareAtPrice: 800,
    stock: 200,
    sku: "GZ-MS-SYR2-100",
    images: ["/images/products/hi-tech-syringe-2ml/hi-tech-syringe-2ml.png"],
    shortDescription:
      "Sterile 2 ml disposable syringes with needle and central luer slip tip, individually ribbon packed. Box of 100.",
    description:
      "Hi-Tech 2 ml Single Use Syringes feature a central luer slip tip and clear barrel markings, and each syringe comes individually sealed in a ribbon pack for hygiene. EO sterilised and latex free. Box of 100 — ideal for clinics, nursing homes, labs and pharmacies. Bulk quantities available on request.",
    benefits: [
      "2 ml Single Use Syringe",
      "Central Luer Slip Tip",
      "Sterile (EO), Safe & Hygienic",
      "Latex Free",
      "Individually Ribbon Packed",
      "100 Pieces per Box",
    ],
    ingredients: [
      { name: "Capacity", benefit: "2 ml" },
      { name: "Tip", benefit: "Central luer slip" },
      { name: "Sterilisation", benefit: "Ethylene Oxide (EO) sterile" },
      { name: "Usage", benefit: "Single use only — do not reuse" },
      { name: "Material", benefit: "Latex free" },
      { name: "Packaging", benefit: "Individually sealed ribbon pack" },
      { name: "Pack Size", benefit: "100 syringes" },
      { name: "Certification (as on pack)", benefit: "CE 0123, ISO 13485" },
    ],
    howToUse: professionalUseNote,
    tags: ["syringe", "2ml syringe", "disposable syringe", "medical supplies", "bulk", "hi-tech"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "AI-DISPO 10 ml Single Use Syringe (Pack of 50)",
    brand: "AI-DISPO",
    quantity: "50 pcs",
    price: 349, // market: Dispovan 10 ml x50 MRP ₹675, wholesale ~₹225/box
    compareAtPrice: 599,
    stock: 150,
    sku: "GZ-MS-SYR10-50",
    images: ["/images/products/ai-dispo-syringe-10ml/ai-dispo-syringe-10ml.png"],
    shortDescription:
      "Sterile 10 ml / cc disposable syringes, individually ribbon packed. Box of 50.",
    description:
      "AI-DISPO 10 ml / cc Single Use Syringes are EO sterilised and individually sealed in ribbon packs. The larger 10 ml barrel suits higher-volume injections, irrigation and sample handling in clinics and hospitals. Box of 50. Bulk quantities available on request.",
    benefits: [
      "10 ml / cc Syringe",
      "Single Use",
      "Sterile (EO)",
      "Individually Ribbon Packed",
      "50 Pieces per Box",
    ],
    ingredients: [
      { name: "Capacity", benefit: "10 ml / cc" },
      { name: "Sterilisation", benefit: "Ethylene Oxide (EO) sterile" },
      { name: "Usage", benefit: "Single use only — discard after single use" },
      { name: "Packaging", benefit: "Individually sealed ribbon pack" },
      { name: "Pack Size", benefit: "50 syringes" },
      { name: "Certification (as on pack)", benefit: "CE; ISO 9001:2015 certified company" },
    ],
    howToUse: professionalUseNote,
    tags: ["syringe", "10ml syringe", "disposable syringe", "medical supplies", "bulk", "ai-dispo"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Disposable Surgical Cap — Non-Woven Bouffant (Pack of 100)",
    brand: "Generic",
    quantity: "100 pcs",
    price: 249, // market: bouffant caps x100 ~₹260 (MRP ₹500)
    compareAtPrice: 500,
    stock: 200,
    sku: "GZ-MS-CAP-100",
    images: ["/images/products/disposable-surgical-cap/disposable-surgical-cap.png"],
    shortDescription:
      "Breathable non-woven bouffant caps with an elastic band for a comfortable, secure fit. Pack of 100.",
    description:
      "Disposable non-woven surgical caps (bouffant style) keep hair covered and contained during procedures, dressings and treatments. The breathable fabric stays comfortable through long shifts and the elastic edge gives a snug, one-size fit. Ideal for clinics, OTs, dental and dermatology practices, salons and food handling. Pack of 100. Bulk quantities available on request.",
    benefits: [
      "Disposable Surgical Cap",
      "Non-Woven, Breathable Material",
      "Hygienic & Safe to Use",
      "Elastic Fit, Comfortable Wear",
      "Pack of 100 Pieces",
    ],
    ingredients: [
      { name: "Type", benefit: "Bouffant / clip cap, disposable" },
      { name: "Material", benefit: "Non-woven, breathable fabric" },
      { name: "Fit", benefit: "Elastic band, one size" },
      { name: "Colour", benefit: "Blue" },
      { name: "Pack Size", benefit: "100 caps" },
    ],
    howToUse:
      "Open the cap and stretch the elastic edge. Place it over the head so that all hair is fully covered, adjusting around the ears and hairline. Single use — discard after use or if it becomes soiled or torn.",
    tags: ["surgical cap", "bouffant cap", "head cap", "disposable", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "JCM 3 Ply Disposable Face Mask (Pack of 50)",
    brand: "JCM",
    quantity: "50 pcs",
    price: 149, // market: 3-ply x50 boxes ~₹150–330
    compareAtPrice: 299,
    stock: 300,
    sku: "GZ-MS-MASK-50",
    images: ["/images/products/jcm-3-ply-face-mask/jcm-3-ply-face-mask.png"],
    shortDescription:
      "3-ply disposable face masks with soft ear loops — breathable, skin friendly and comfortable. Box of 50.",
    description:
      "JCM 3 Ply Face Masks offer three layers of protection in a lightweight, breathable design with soft elastic ear loops for a comfortable fit. Skin friendly and hygienic for everyday use at clinics, hospitals, pharmacies and workplaces. Made in India. Box of 50. Bulk quantities available on request.",
    benefits: [
      "3 Ply Protection",
      "Comfortable Fit",
      "Breathable Material",
      "Skin Friendly & Hygienic",
      "50 Pieces per Box",
      "Made in India",
    ],
    ingredients: [
      { name: "Layers", benefit: "3 ply" },
      { name: "Fit", benefit: "Elastic ear loops" },
      { name: "Use", benefit: "Disposable, single use" },
      { name: "Pack Size", benefit: "50 masks" },
      { name: "Marks (as on pack)", benefit: "ISO 9001:2015, CE, Make in India" },
    ],
    howToUse:
      "Wash or sanitise your hands. Hold the mask by the ear loops with the coloured side facing out, place it over your nose and mouth and loop the elastics behind your ears. Adjust so it fits snugly with no gaps. Replace when damp or soiled, and remove by the ear loops only. Single use — discard after use.",
    tags: ["face mask", "3 ply mask", "surgical mask", "disposable", "medical supplies", "bulk", "jcm"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  // ---- Batch 2 ---------------------------------------------------------
  {
    name: "Disposable Non-Woven Headband (Pack of 100)",
    brand: "Generic",
    quantity: "100 pcs",
    price: 249, // market: non-woven headbands x100 ~₹200–300 online
    compareAtPrice: 449,
    stock: 200,
    sku: "GZ-MS-HB-100",
    images: ["/images/products/disposable-headband/disposable-headband.png"],
    shortDescription:
      "Soft, lightweight non-woven disposable headbands that keep hair off the face during facials, treatments and procedures. Pack of 100.",
    description:
      "Disposable non-woven headbands hold hair neatly away from the face and hairline during facials, peels, laser and skin treatments, makeup and clinical procedures. The soft, lightweight fabric is comfortable on the skin and the flexible band fits most head sizes. Single use for better hygiene between clients. Pack of 100. Bulk quantities available on request.",
    benefits: [
      "Disposable Headband",
      "Non-Woven, Soft Material",
      "Lightweight & Comfortable",
      "Flexible Fit — Salon & Clinical Use",
      "Pack of 100 Pieces",
    ],
    ingredients: [
      { name: "Type", benefit: "Disposable headband" },
      { name: "Material", benefit: "Non-woven, soft fabric" },
      { name: "Fit", benefit: "Flexible, one size" },
      { name: "Colour", benefit: "White with blue edging" },
      { name: "Use", benefit: "Single use" },
      { name: "Pack Size", benefit: "100 headbands" },
    ],
    howToUse:
      "Slip the headband over the head and position it along the hairline so that hair is held back from the face. Adjust for a comfortable fit. Single use — discard after each client or treatment.",
    tags: ["headband", "disposable headband", "facial", "salon", "spa", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Hi-Aid Medicated Dressing Spot (Jar of 100)",
    brand: "Hi-Aid",
    quantity: "100 pcs",
    price: 179, // Hi-Aid spot MRP ~₹2 per piece; assumed 100 per jar — confirm count
    compareAtPrice: 200,
    stock: 100,
    sku: "GZ-MS-HIAID-JAR",
    images: ["/images/products/hi-aid-medicated-dressing-spot/hi-aid-medicated-dressing-spot.png"],
    shortDescription:
      "Individually sealed medicated spot dressings with Benzalkonium Chloride 0.5% w/w, for cuts, grazes and burns. Convenient jar pack.",
    description:
      "Hi-Aid Medicated Dressing Spot by Flexus Surgicals is a small round spot dressing (22 mm spread spot) for minor cuts, grazes and burns. Each pad contains Benzalkonium Chloride Solution IP equivalent to Benzalkonium Chloride 0.5% w/w, an antiseptic. Every dressing is individually sealed and supplied in a hygienic, easy-dispensing jar — ideal for clinics, first-aid stations, schools, offices and pharmacies. Bulk quantities available on request.",
    benefits: [
      "Medicated Dressing for Cuts, Grazes & Burns",
      "Benzalkonium Chloride 0.5% w/w",
      "Individually Sealed Strips",
      "Easy to Apply, Change Daily",
      "Convenient, Hygienic Jar Pack",
    ],
    ingredients: [
      { name: "Active (each pad)", benefit: "Benzalkonium Chloride Solution IP eq. to Benzalkonium Chloride 0.5% w/w" },
      { name: "Other", benefit: "Impregnated with Tartrazine Yellow; aqueous excipients" },
      { name: "Spread Spot Size", benefit: "22 mm diameter" },
      { name: "Use", benefit: "Cuts, grazes and burns" },
      { name: "Packaging", benefit: "100 individually sealed dressings in a jar" },
      { name: "Manufacturer", benefit: "Flexus Surgicals Pvt Ltd, Rajkot, Gujarat (M.L. No. MFG/MD/2019/000103)" },
    ],
    howToUse:
      "Clean and dry the wound. Tear open one sachet, remove the protective backing and apply the medicated spot directly over the wound, pressing the edges down gently. Change the dressing daily. For minor wounds only — see a doctor for deep, large or infected wounds. Keep in a cool, dry place.",
    tags: ["bandage", "band aid", "dressing", "first aid", "medicated dressing", "hi-aid", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Harsons Shield Super Latex Examination Gloves (Box of 100)",
    brand: "Harsons Shield",
    quantity: "100 pcs",
    price: 349, // market: latex exam gloves x100 ~₹380 (MRP up to ₹1,000)
    compareAtPrice: 600,
    stock: 150,
    sku: "GZ-MS-GLOVE-100",
    images: ["/images/products/shield-latex-examination-gloves/shield-latex-examination-gloves.png"],
    shortDescription:
      "Disposable, non-sterile latex examination gloves with ultra light powder — comfortable, flexible fit for examinations and general use.",
    description:
      "Harsons Shield Super Latex Examination Gloves give a dependable barrier for patient examinations, dental and dermatology procedures, salons, labs and everyday hygiene tasks. The flexible latex offers a snug, comfortable fit and good touch sensitivity, while the ultra light powder makes them easy to put on and remove. Disposable and non-sterile — for single use only. Bulk quantities available on request.",
    benefits: [
      "Barrier Against Contaminants",
      "Super Latex — Comfortable & Flexible",
      "Ultra Light Powder — Easy to Wear & Remove",
      "Disposable, Single Use",
      "Non-Sterile — Examination & General Use",
    ],
    ingredients: [
      { name: "Material", benefit: "Natural latex" },
      { name: "Powder", benefit: "Ultra light powdered" },
      { name: "Sterility", benefit: "Non-sterile" },
      { name: "Use", benefit: "Disposable, examination & general use" },
      { name: "Pack Size", benefit: "Box of 100" },
      { name: "Certification (as on pack)", benefit: "ISO 9001:2008 certified company" },
      { name: "Note", benefit: "Contains natural rubber latex — not for people with latex allergy" },
    ],
    howToUse:
      "Wash and dry your hands. Pick a glove by the cuff and slide your hand in, then pull the cuff up over the wrist. Change gloves between patients/tasks and whenever torn. Remove by peeling from the cuff inside-out without touching the outer surface, and dispose of as per bio-medical waste guidelines. Not for use by people with a latex allergy.",
    tags: ["gloves", "latex gloves", "examination gloves", "surgical gloves", "harsons", "shield", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Romsons In Flow Set — Non-Vented Infusion Set (Pack of 25)",
    brand: "Romsons",
    quantity: "25 units",
    price: 384, // Romsons official store: Inflow set ₹384 for 25 units
    stock: 500,
    sku: "GZ-MS-IVSET-1",
    images: ["/images/products/romsons-in-flow-infusion-set/romsons-in-flow-infusion-set.png"],
    shortDescription:
      "Sterile, single-use non-vented IV infusion sets with flow regulator. Non-toxic, non-pyrogenic, DEHP free. Ref SS-3085. Pack of 25 individually sealed sets.",
    description:
      "Romsons In Flow Set (Ref SS-3085) is a single-use, non-vented infusion set for gravity-feed IV administration. It has a piercing spike, drip chamber (20 drops ≈ 1 ml of distilled water), roller flow regulator and injection site. EO sterilised, non-toxic, non-pyrogenic and DEHP free. Made in India by Romsons Group. Pack of 25 individually sealed sets. Bulk quantities available on request.",
    benefits: [
      "Single Use Infusion Set",
      "Sterile (EO) & Non-Pyrogenic",
      "Easy to Use with Flow Regulator",
      "Leak-Proof, Secure Connection",
      "Non-Toxic, DEHP Free",
    ],
    ingredients: [
      { name: "Type", benefit: "Non-vented infusion set, gravity feed only" },
      { name: "Drop Factor", benefit: "20 drops of distilled water ≈ 1 ml ± 0.1 ml" },
      { name: "Sterilisation", benefit: "Ethylene Oxide (EO) sterile, non-pyrogenic" },
      { name: "Material", benefit: "Non-toxic, DEHP free" },
      { name: "Reference", benefit: "REF SS-3085" },
      { name: "Pack Size", benefit: "25 sets (1 unit per sealed pouch)" },
      { name: "Manufacturer", benefit: "Romsons Group Pvt Ltd, Agra (U.P.), India" },
    ],
    howToUse:
      "For use by a qualified healthcare professional only. Do not use if the pack is damaged or protective caps are missing. Close the flow regulator, remove the spike cap and insert the spike fully into the solution container. Squeeze the drip chamber until half filled, remove the needle protector, open the regulator to purge air, then adjust the flow rate. Not for blood or blood components. Single use — do not re-sterilise; dispose of as per bio-medical waste rules.",
    tags: ["iv set", "infusion set", "drip set", "romsons", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Soft Facial Tissue (200 Pulls)",
    brand: "Generic",
    quantity: "200 pulls",
    price: 79, // market: 2-ply 200-pull facial tissue ~₹70–100 — confirm pulls
    compareAtPrice: 99,
    stock: 300,
    sku: "GZ-MS-TISSUE-1",
    images: ["/images/products/facial-tissue/facial-tissue.png"],
    shortDescription:
      "Soft, absorbent multipurpose facial tissues — gentle on skin, for clinics, salons, reception desks and everyday use.",
    description:
      "Soft facial tissues that are gentle on the skin and highly absorbent. Ideal for clinic treatment rooms, skin and dental clinics, salons, reception areas, offices and homes. Hygienically packed. Bulk quantities available on request.",
    benefits: [
      "Soft & Gentle on Skin",
      "High Absorbency for Everyday Use",
      "Hygienically Packed",
      "Multipurpose Facial Tissue",
    ],
    ingredients: [
      { name: "Type", benefit: "Facial tissue" },
      { name: "Texture", benefit: "Soft, absorbent" },
      { name: "Use", benefit: "Multipurpose — clinics, salons, offices, home" },
      { name: "Pack", benefit: "200 pulls" },
    ],
    howToUse: "Pull out one tissue at a time. Single use — discard after use. Store in a clean, dry place.",
    tags: ["tissue", "facial tissue", "tissue paper", "clinic supplies", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Absorbent Gauze Than — Surgical Gauze Cloth (90 cm x 18 m)",
    brand: "Generic",
    quantity: "90 cm x 18 m",
    price: 399, // market: gauze than 90cm x 18m ₹150 wholesale – ₹600 retail (MRP ~₹703) — confirm size
    compareAtPrice: 700,
    stock: 100,
    sku: "GZ-MS-GAUZE-THAN",
    images: ["/images/products/gauze-than/gauze-than.png"],
    shortDescription:
      "Soft, absorbent cotton gauze than for dressings, swabs and wound care — cut to the size you need.",
    description:
      "Absorbent cotton gauze than (gauze cloth roll/bundle) used in hospitals, clinics and nursing homes to make dressings, pads and swabs. Soft, breathable and highly absorbent, it can be cut and folded to the size required. Hygienically packed. Bulk quantities available on request.",
    benefits: [
      "Soft, Absorbent Cotton Gauze",
      "Breathable Open Weave",
      "Cut & Fold to Any Size",
      "For Dressings, Pads & Swabs",
      "Hygienically Packed",
    ],
    ingredients: [
      { name: "Material", benefit: "Absorbent cotton gauze" },
      { name: "Form", benefit: "Than (folded gauze cloth)" },
      { name: "Use", benefit: "Dressings, swabs, wound care" },
      { name: "Size", benefit: "90 cm x 18 m" },
      { name: "Sterility", benefit: "Non-sterile — sterilise before use on open wounds" },
    ],
    howToUse:
      "Wash hands before handling. Cut the required length with clean scissors and fold into a pad of the needed size. Sterilise before applying directly to open wounds, or use as a secondary dressing. Store in a clean, dry place.",
    tags: ["gauze", "gauze than", "gauze cloth", "dressing", "cotton", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Vni Klassic Scalp Vein Set — Butterfly Needle (Size 23)",
    brand: "Vni Klassic",
    quantity: "1 unit",
    price: 45, // MRP ₹120 on pack; scalp vein sets retail ~₹30–50
    compareAtPrice: 120,
    stock: 500,
    sku: "GZ-MS-SVS-23",
    images: ["/images/products/scalp-vein-set-23g/scalp-vein-set-23g.png"],
    shortDescription:
      "Sterile butterfly (scalp vein) set, size 23, with flexible tubing — non-toxic, pyrogen free, gravity feed only.",
    description:
      "Vni Klassic Scalp Vein Set (butterfly needle) in size 23 has easy-grip butterfly wings for precise placement and flexible, kink-resistant tubing with a luer connector. Commonly used for short-term IV access and drawing blood from small or fragile veins, including in children and elderly patients. Individually blister packed, non-toxic and pyrogen free. Bulk quantities available on request.",
    benefits: [
      "Butterfly Needle — Size 23",
      "Easy-Grip Wings for Precise Placement",
      "Flexible Tubing with Luer Connector",
      "Non-Toxic & Pyrogen Free",
      "Individually Blister Packed",
    ],
    ingredients: [
      { name: "Type", benefit: "Scalp vein set (butterfly needle)" },
      { name: "Size", benefit: "23" },
      { name: "Features", benefit: "Butterfly wings, flexible tubing, luer connector" },
      { name: "Safety", benefit: "Non-toxic, pyrogen free, gravity feed only" },
      { name: "Packaging", benefit: "Individual blister pack" },
      { name: "MRP (as on pack)", benefit: "₹120 per piece, incl. of all taxes" },
      { name: "Marks (as on pack)", benefit: "ISO, GMP, CE" },
    ],
    howToUse:
      "For use by a qualified healthcare professional only. Check that the blister pack is intact and within expiry. Hold the set by the wings, insert the needle into the vein, secure the wings with tape and connect the luer end to the line or syringe. Single use only — dispose of in a sharps container immediately after use.",
    tags: ["scalp vein set", "butterfly needle", "butterfly", "iv cannula", "vni", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Scottley Instant Hand Sanitizer — 75% Alcohol (5 Litre)",
    brand: "Scottley",
    quantity: "5 L",
    price: 899, // MRP ₹2,500 on can; 5 L sanitizers sell ~₹600–1,000
    compareAtPrice: 2500,
    stock: 60,
    sku: "GZ-MS-SANI-5L",
    images: ["/images/products/scottley-hand-sanitizer-5l/scottley-hand-sanitizer-5l.png"],
    shortDescription:
      "75% alcohol (IPA) instant hand sanitizer in a 5 litre refill can — kills 99.9% of germs without water.",
    description:
      "Scottley Instant Hand Sanitizer contains 75% Isopropyl Alcohol with glycerol and hydrogen peroxide, and kills 99.9% of germs without water (as stated on the pack). The 5 litre can is ideal for refilling dispensers in clinics, hospitals, offices, schools and shops. Best before 36 months from manufacture. Bulk quantities available on request.",
    benefits: [
      "75% Alcohol (IPA)",
      "Kills 99.9% of Germs Without Water",
      "Economical 5 L Refill Can",
      "Ideal for Dispensers in Clinics & Offices",
    ],
    ingredients: [
      { name: "Isopropyl Alcohol (IPA)", benefit: "75% — kills germs on hands" },
      { name: "Glycerol", benefit: "1.45% — helps prevent skin dryness" },
      { name: "Hydrogen Peroxide", benefit: "0.125% — helps keep the formula free of contaminating spores" },
      { name: "Others", benefit: "Colouring agent & perfume" },
      { name: "Net Volume", benefit: "5 litre" },
      { name: "MRP (as on can)", benefit: "₹2,500 incl. of taxes" },
      { name: "Manufacturer", benefit: "R.H Chemicals, Indore (M.P.), India" },
    ],
    howToUse:
      "Apply enough sanitizer to cover both hands and rub palms, backs of hands, between fingers and fingertips until dry (about 20–30 seconds). No water needed. For external use only. Flammable — keep away from flame and direct sunlight, store below 30°C and do not freeze. In case of contact with eyes, rinse immediately with water. Keep out of reach of children; children should use under adult supervision.",
    tags: ["sanitizer", "hand sanitizer", "5 litre", "alcohol", "scottley", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Royal PDS Ultrasound Gel (5 Litre)",
    brand: "Royal PDS",
    quantity: "5 L",
    price: 549, // MRP ₹850 on can; 5 L gels sell ~₹500–600 online
    compareAtPrice: 850,
    stock: 60,
    sku: "GZ-MS-USG-5L",
    images: ["/images/products/royal-ultrasound-gel-5l/royal-ultrasound-gel-5l.png"],
    shortDescription:
      "Blue, water-soluble ultrasound gel for clear conductivity — non-staining, odourless, hypo-allergenic. 5 litre can.",
    description:
      "Royal PDS Ultrasound Gel has a stabilised formula for better conductivity during ultrasound, sonography, ECG/physiotherapy and laser hair-removal procedures. It is non-staining, odourless, hypo-allergenic, water soluble and of natural pH, so it wipes off easily from skin and probes. Economical 5 litre can for clinics, diagnostic centres and hospitals. For external application only. Bulk quantities available on request.",
    benefits: [
      "Stabilised Formula for Better Conductivity",
      "Non-Staining & Odourless",
      "Hypo-Allergenic, Natural pH",
      "Water Soluble — Easy to Wipe Off",
      "Economical 5 L Can",
    ],
    ingredients: [
      { name: "Type", benefit: "Ultrasound / conductivity gel" },
      { name: "Properties", benefit: "Non-staining, odourless, hypo-allergenic, water soluble, natural pH" },
      { name: "Net Volume", benefit: "5 litre" },
      { name: "Use", benefit: "External application only" },
      { name: "MRP (as on can)", benefit: "₹850" },
      { name: "Manufacturer", benefit: "Malhotra Surgical Sales, Delhi" },
    ],
    howToUse:
      "Apply an adequate layer of gel to the skin over the area to be scanned (or to the probe). After the procedure, wipe off with a tissue or damp cloth — it is water soluble and does not stain. For external application only. Close the cap after use and store in a cool place.",
    tags: ["ultrasound gel", "usg gel", "sonography gel", "conductive gel", "laser gel", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "Disposable Non-Woven Bed Sheet (Pack of 10)",
    brand: "Generic",
    quantity: "10 sheets",
    price: 179, // market: 25 GSM 32x72" x10 ~₹159; x20 ₹460 — confirm count
    compareAtPrice: 299,
    stock: 150,
    sku: "GZ-MS-BEDSHEET",
    images: ["/images/products/disposable-bed-sheet/disposable-bed-sheet.png"],
    shortDescription:
      "Soft, white non-woven disposable bed sheets for examination tables, treatment beds, spa and salon couches.",
    description:
      "Disposable non-woven bed sheets give every patient or client a fresh, clean surface on examination tables, procedure beds, massage/spa couches and salon chairs. The soft, breathable non-woven fabric is comfortable to lie on and saves on laundry. Single use — change between patients. Bulk quantities available on request.",
    benefits: [
      "Fresh Sheet for Every Patient / Client",
      "Soft, Breathable Non-Woven Fabric",
      "Saves Laundry Time & Cost",
      "For Clinics, Spas & Salons",
    ],
    ingredients: [
      { name: "Material", benefit: "Non-woven fabric" },
      { name: "Colour", benefit: "White" },
      { name: "Use", benefit: "Examination tables, treatment beds, spa & salon couches" },
      { name: "Pack", benefit: "10 sheets" },
    ],
    howToUse:
      "Unfold a fresh sheet and spread it over the table, bed or couch before each patient or client. Single use — remove and discard after use.",
    tags: ["bed sheet", "disposable bed sheet", "bedsheet", "spa", "salon", "non woven", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  // ---- Batch 3 ---------------------------------------------------------
  {
    name: "Vitamin E Facial Oil Capsules (60 Softgels)",
    brand: "Generic",
    quantity: "60 capsules",
    price: 199, // market: generic Vit E facial capsules x60 ~₹150–300
    compareAtPrice: 399,
    stock: 100,
    sku: "GZ-MS-VITE-60",
    images: ["/images/products/vitamin-e-facial-oil-capsules/vitamin-e-facial-oil-capsules.png"],
    shortDescription:
      "Vitamin E facial oil in easy single-use softgel capsules — moisturises, nourishes and softens skin. For external use only. 60 capsules.",
    description:
      "Vitamin E Facial Oil comes in convenient softgel capsules — snip or pierce one capsule and apply the oil to the face, neck and hands before sleep. It moisturises and nourishes the skin, helps reduce the look of fine lines, improves skin softness and supports healthy-looking skin. Paraben free and suitable for daily use. For external use only — not to be swallowed. Popular with skin clinics and salons as an add-on for facials and post-treatment care. Bulk quantities available on request.",
    benefits: [
      "Moisturises & Nourishes",
      "Helps Reduce Fine Lines",
      "Improves Skin Softness",
      "Supports Healthy Skin",
      "Paraben Free, Suitable for Daily Use",
    ],
    ingredients: [
      { name: "Vitamin E oil", benefit: "Antioxidant oil that moisturises and nourishes the skin" },
      { name: "Form", benefit: "60 softgel capsules (oil for external application)" },
      { name: "Free from", benefit: "Parabens" },
      { name: "Use", benefit: "External use only — face, neck & hands" },
    ],
    howToUse:
      "For EXTERNAL use only — do not swallow. Snip or pierce one capsule, squeeze out the oil and gently massage onto clean face, neck and hands before sleep. Avoid contact with eyes. Do a patch test first if you have sensitive skin. Keep out of reach of children; store in a cool, dry place with the cap closed.",
    tags: ["vitamin e", "vitamin e capsule", "facial oil", "skin care", "face oil", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
  {
    name: "BD Vacutainer Safety-Lok Blood Collection Needle 21G x 1\" (Box of 48)",
    brand: "BD",
    quantity: "48 units",
    price: 1449, // MRP ₹1,824 on box (₹38/unit)
    compareAtPrice: 1824,
    stock: 50,
    sku: "GZ-MS-BDVAC-21G-48",
    images: ["/images/products/bd-vacutainer-needle-21g/bd-vacutainer-needle-21g.png"],
    shortDescription:
      "BD Vacutainer Safety-Lok multi-sample blood collection needles, 21G x 1\" (0.8 x 25 mm), sterile, with safety shield. Box of 48 (Ref 368607).",
    description:
      "BD Vacutainer Safety-Lok Blood Collection Needles (REF / Cat. 368607) are 21G x 1\" (0.8 x 25 mm) sterile, single-use needles for multi-sample venous blood collection with BD Vacutainer tube holders and tubes. The pink Safety-Lok shield is hinged to the needle hub and is locked over the needle right after use to help protect against needlestick injuries. Green colour-coded 21G hub. Box of 48 individually packed needles — MRP ₹1,824 (₹38 per unit). Imported by Becton Dickinson India Pvt. Ltd. Individual units are not sold separately. Bulk quantities available on request for labs, hospitals and collection centres.",
    benefits: [
      "21G x 1\" (0.8 x 25 mm) — Green Hub",
      "Safety-Lok Shield Helps Prevent Needlestick Injuries",
      "Multi-Sample Blood Collection",
      "Sterile, Single Use, Individually Packed",
      "Box of 48 — Genuine BD",
    ],
    ingredients: [
      { name: "Product", benefit: "BD Vacutainer Safety-Lok Blood Collection Needle" },
      { name: "Gauge / Length", benefit: "21G x 1\" (0.8 x 25 mm)" },
      { name: "Reference", benefit: "REF / Cat. 368607" },
      { name: "Safety Feature", benefit: "Hinged Safety-Lok shield" },
      { name: "Sterility", benefit: "Sterile (radiation), do not reuse" },
      { name: "Pack Size", benefit: "48 units per box" },
      { name: "MRP (as on box)", benefit: "₹1,824 for 48 units (₹38 per unit), incl. of all taxes" },
      { name: "Imported by", benefit: "Becton Dickinson India Pvt. Ltd., Thane (Import Lic. M/MD/2019/000066)" },
    ],
    howToUse:
      "For use by trained phlebotomists / healthcare professionals only. Check that the pack is intact and within expiry. Thread the needle into a BD Vacutainer holder, perform venepuncture and fill the required tubes. Immediately after withdrawing, push the Safety-Lok shield over the needle until it locks. Single use — do not reuse; dispose of the needle and holder in a sharps container.",
    tags: ["vacutainer", "vacutainer needle", "blood collection needle", "bd", "21g", "phlebotomy", "medical supplies", "bulk"],
    featured: false,
    bestseller: false,
    newArrival: true,
  },
];
