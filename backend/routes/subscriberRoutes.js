import express from "express";
import { body } from "express-validator";
import { subscribe, getSubscribers, deleteSubscriber } from "../controllers/subscriberController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validateMiddleware.js";

const router = express.Router();

router.post(
  "/",
  [body("email").isEmail().withMessage("A valid email is required")],
  validate,
  subscribe
);

router.get("/", protect, admin, getSubscribers);
router.delete("/:id", protect, admin, deleteSubscriber);

export default router;
