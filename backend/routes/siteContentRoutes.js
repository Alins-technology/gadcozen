import express from "express";
import { getSiteContent, updateSiteContent } from "../controllers/siteContentController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getSiteContent);
router.put("/:key", protect, admin, updateSiteContent);

export default router;
