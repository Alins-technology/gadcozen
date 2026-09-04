import express from "express";
import {
  createOrder,
  getMyOrders,
  getMyOrderByNumber,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createOrder);
router.get("/mine", getMyOrders);
router.get("/mine/:orderNumber", getMyOrderByNumber);

router.get("/", admin, getAllOrders);
router.get("/:id", admin, getOrderById);
router.put("/:id/status", admin, updateOrderStatus);

export default router;
