import express from "express";
import { body } from "express-validator";
import {
  createBulkEnquiry,
  getBulkEnquiries,
  updateBulkEnquiry,
} from "../controllers/bulkEnquiryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required").isLength({ max: 120 }),
    body("email").isEmail().withMessage("A valid email is required"),
    body("phone")
      .trim()
      .matches(/^[+\d][\d\s-]{7,16}$/)
      .withMessage("A valid phone number is required"),
    body("organization").optional().trim().isLength({ max: 200 }),
    body("businessType").optional().trim().isLength({ max: 60 }),
    body("city").optional().trim().isLength({ max: 100 }),
    body("gstin").optional().trim().isLength({ max: 20 }),
    body("message").optional().trim().isLength({ max: 3000 }),
    body("items").isArray({ min: 1 }).withMessage("Please add at least one product"),
  ],
  validate,
  createBulkEnquiry
);

router.get("/", protect, admin, getBulkEnquiries);
router.put("/:id", protect, admin, updateBulkEnquiry);

export default router;
