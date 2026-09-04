import User from "../models/User.js";
import Cart from "../models/Cart.js";
import Wishlist from "../models/Wishlist.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import crypto from "crypto";

const sendAuthResponse = (res, user, statusCode = 200) => {
  const token = generateToken(user._id, user.role);
  res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  });
};

// @route POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: "An account with this email already exists" });
  }

  const user = await User.create({ name, email, password, phone });
  await Cart.create({ user: user._id, items: [] });
  await Wishlist.create({ user: user._id, products: [] });

  sendAuthResponse(res, user, 201);
});

// @route POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: "This account has been disabled" });
  }

  sendAuthResponse(res, user);
});

// @route GET /api/auth/me
export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

// @route POST /api/auth/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond the same way to avoid leaking which emails exist
  if (!user) {
    return res.json({ message: "If that email exists, a reset link has been generated." });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  // SECURITY: the reset token must only ever reach the account owner's inbox.
  // TODO: wire up a real email provider (e.g. Nodemailer + SMTP, SendGrid,
  // Resend) here and email `resetToken` as a /reset-password/:token link.
  // Until that's connected, we log it server-side so it's still usable while
  // testing, but we NEVER send it back in the API response in production —
  // doing so would let anyone reset ANY account's password just by knowing
  // their email address.
  if (process.env.NODE_ENV !== "production") {
    console.log(`[auth] Password reset token for ${user.email}: ${resetToken}`);
  }

  const payload = {
    message: "If that email exists, a reset link has been generated.",
  };
  // Only exposed outside production, and only to make local/dev testing of
  // the reset flow possible without an email provider configured.
  if (process.env.NODE_ENV !== "production") {
    payload.devResetToken = resetToken;
  }
  res.json(payload);
});

// @route POST /api/auth/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password +resetPasswordToken +resetPasswordExpires");

  if (!user) {
    return res.status(400).json({ message: "Reset token is invalid or has expired" });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  sendAuthResponse(res, user);
});
