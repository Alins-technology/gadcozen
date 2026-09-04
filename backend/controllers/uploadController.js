import { asyncHandler } from "../utils/asyncHandler.js";

// @route POST /api/upload (admin)
export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  res.status(201).json({
    url: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
});
