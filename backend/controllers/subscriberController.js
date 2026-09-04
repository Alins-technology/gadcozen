import Subscriber from "../models/Subscriber.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// @route POST /api/subscribers
// Public newsletter signup (footer form). Idempotent — re-subscribing an
// existing (possibly unsubscribed) email just reactivates it.
export const subscribe = asyncHandler(async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "A valid email address is required" });
  }

  const subscriber = await Subscriber.findOneAndUpdate(
    { email },
    { email, isActive: true },
    { new: true, upsert: true }
  );

  res.status(201).json({
    message: "Thanks for subscribing to GADCO ZEN updates!",
    subscriber,
  });
});

// @route GET /api/subscribers (admin)
export const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
  res.json({ subscribers });
});

// @route DELETE /api/subscribers/:id (admin)
export const deleteSubscriber = asyncHandler(async (req, res) => {
  const subscriber = await Subscriber.findById(req.params.id);
  if (!subscriber) return res.status(404).json({ message: "Subscriber not found" });
  await subscriber.deleteOne();
  res.json({ message: "Subscriber removed" });
});
