import express from "express";
import { body } from "express-validator";
import {
  createOrder,
  verifyPayment,
  paymentCancelled,
  getMyOrders,
  getMyOrderByNumber,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getMyInvoice,
  getInvoiceAdmin,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  [
    body("paymentMethod").isString().notEmpty().withMessage("Please choose a payment method"),
    body("contactEmail").optional({ values: "falsy" }).isEmail().withMessage("A valid email is required"),
    body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required"),
    body("shippingAddress.phone")
      .trim()
      .matches(/^(\+?91[\s-]?)?[6-9]\d{9}$/)
      .withMessage("Enter a valid 10-digit mobile number"),
    body("shippingAddress.line1").trim().notEmpty().withMessage("Address is required"),
    body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
    body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),
    body("shippingAddress.postalCode")
      .trim()
      .matches(/^[1-9]\d{5}$/)
      .withMessage("Enter a valid 6-digit PIN code"),
    body("notes").optional().isString().isLength({ max: 500 }),
  ],
  validate,
  createOrder
);
router.post("/:id/verify-payment", verifyPayment);
router.post("/:id/payment-cancelled", paymentCancelled);
router.get("/mine", getMyOrders);
router.get("/mine/:orderNumber", getMyOrderByNumber);
router.get("/mine/:orderNumber/invoice", getMyInvoice);

router.get("/", admin, getAllOrders);
router.get("/:id", admin, getOrderById);
router.get("/:id/invoice", admin, getInvoiceAdmin);
router.put("/:id/status", admin, updateOrderStatus);

export default router;
