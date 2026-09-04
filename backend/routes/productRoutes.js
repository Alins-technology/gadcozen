import express from "express";
import {
  getProducts,
  getProductBySlug,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAdmin,
  getProductById,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/admin/all", protect, admin, getAllProductsAdmin);
router.get("/id/:id", protect, admin, getProductById);
router.get("/:slug", getProductBySlug);
router.get("/:slug/related", getRelatedProducts);

router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
