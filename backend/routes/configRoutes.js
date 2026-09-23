import express from "express";
import { getPublicStoreConfig } from "../config/store.js";

const router = express.Router();

// @route GET /api/config — public store settings (shipping rules, payment methods)
router.get("/", (req, res) => {
  res.json(getPublicStoreConfig());
});

export default router;
