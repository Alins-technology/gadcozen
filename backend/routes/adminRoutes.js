import express from "express";
import { getDashboardStats } from "../controllers/adminController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, admin);

router.get("/dashboard", getDashboardStats);

export default router;
