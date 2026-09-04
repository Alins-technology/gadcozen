import express from "express";
import { body } from "express-validator";
import {
  submitContactForm,
  getContactSubmissions,
  resolveContactSubmission,
} from "../controllers/contactController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
  ],
  validate,
  submitContactForm
);

router.get("/", protect, admin, getContactSubmissions);
router.put("/:id/resolve", protect, admin, resolveContactSubmission);

export default router;
