import SiteContent from "../models/SiteContent.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @route GET /api/site-content
// Returns all editable site content as a { key: value } map.
export const getSiteContent = asyncHandler(async (req, res) => {
  const docs = await SiteContent.find({});
  const content = {};
  docs.forEach((d) => (content[d.key] = d.value));
  res.json({ content });
});

// @route PUT /api/site-content/:key (admin)
export const updateSiteContent = asyncHandler(async (req, res) => {
  const doc = await SiteContent.findOneAndUpdate(
    { key: req.params.key },
    { value: req.body.value },
    { new: true, upsert: true }
  );
  res.json({ key: doc.key, value: doc.value });
});
