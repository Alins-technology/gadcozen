import express from "express";
import {
  getProductReviews,
  getFeaturedReviews,
  createReview,
  getAllReviews,
  moderateReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/featured", getFeaturedReviews);
router.get("/product/:productId", getProductReviews);
router.post("/product/:productId", protect, createReview);

router.get("/", protect, admin, getAllReviews);
router.put("/:id/moderate", protect, admin, moderateReview);
router.delete("/:id", protect, admin, deleteReview);

export default router;
