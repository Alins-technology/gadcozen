import { v2 as cloudinary } from "cloudinary";
import { asyncHandler } from "../utils/asyncHandler.js";
import { useCloudinary } from "../middleware/uploadMiddleware.js";

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: process.env.CLOUDINARY_FOLDER || "gadco-zen/products", resource_type: "image" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });

// @route POST /api/upload (admin)
// Returns an absolute URL, so images keep working when the frontend and the
// API are on different domains (e.g. Vercel + Render).
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (useCloudinary) {
    const result = await uploadToCloudinary(req.file.buffer);
    return res.status(201).json({ url: result.secure_url, filename: result.public_id });
  }

  const base = (process.env.PUBLIC_API_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
  res.status(201).json({
    url: `${base}/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
});
