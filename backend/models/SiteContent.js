import mongoose from "mongoose";

// A simple singleton-style key/value document for editable site content
// (announcement bar, hero copy, promo banner, etc.) so the admin panel
// can update homepage content without a redeploy.
const siteContentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("SiteContent", siteContentSchema);
