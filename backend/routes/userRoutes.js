import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
} from "../controllers/userController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

router.get("/addresses", getAddresses);
router.post("/addresses", addAddress);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

// Admin-only user management
router.get("/", admin, getUsers);
router.get("/:id", admin, getUserById);
router.put("/:id/role", admin, updateUserRole);
router.put("/:id/status", admin, toggleUserStatus);

export default router;
