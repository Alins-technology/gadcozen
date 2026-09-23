import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { escapeRegex } from "../utils/escapeRegex.js";

// @route GET /api/users/profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ user });
});

// @route PUT /api/users/profile
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.name = req.body.name ?? user.name;
  user.phone = req.body.phone ?? user.phone;
  if (req.body.email) {
    const email = String(req.body.email).toLowerCase().trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }
    if (email !== user.email && (await User.exists({ email }))) {
      return res.status(400).json({ message: "Another account already uses this email" });
    }
    user.email = email;
  }

  await user.save();
  res.json({ user });
});

// @route PUT /api/users/change-password
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: "Password updated successfully" });
});

// @route GET /api/users/addresses
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ addresses: user.addresses });
});

// @route POST /api/users/addresses
export const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.status(201).json({ addresses: user.addresses });
});

// @route PUT /api/users/addresses/:addressId
export const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);
  if (!address) return res.status(404).json({ message: "Address not found" });

  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  Object.assign(address, req.body);
  await user.save();
  res.json({ addresses: user.addresses });
});

// @route DELETE /api/users/addresses/:addressId
export const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses.id(req.params.addressId)?.deleteOne();
  await user.save();
  res.json({ addresses: user.addresses });
});

// ---- Admin ----

// @route GET /api/users (admin)
export const getUsers = asyncHandler(async (req, res) => {
  const { search = "" } = req.query;
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const pattern = new RegExp(escapeRegex(search), "i");
  const query = search ? { $or: [{ name: pattern }, { email: pattern }] } : {};

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  const total = await User.countDocuments(query);

  res.json({ users, total, page, pages: Math.ceil(total / limit) });
});

// @route GET /api/users/:id (admin)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
});

// @route PUT /api/users/:id/role (admin)
export const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user._id.equals(req.user._id)) {
    return res.status(400).json({ message: "You can't change your own role" });
  }
  user.role = req.body.role === "admin" ? "admin" : "customer";
  await user.save();
  res.json({ user });
});

// @route PUT /api/users/:id/status (admin)
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user._id.equals(req.user._id)) {
    return res.status(400).json({ message: "You can't deactivate your own account" });
  }
  user.isActive = Boolean(req.body.isActive);
  await user.save();
  res.json({ user });
});
