import ContactSubmission from "../models/ContactSubmission.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { contactNotificationEmail } from "../utils/emailTemplates.js";

// @route POST /api/contact
export const submitContactForm = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const submission = await ContactSubmission.create({ name, email, phone, subject, message });
  if (process.env.ADMIN_NOTIFY_EMAIL) {
    sendEmail({ to: process.env.ADMIN_NOTIFY_EMAIL, ...contactNotificationEmail(submission) });
  }
  res.status(201).json({
    message: "Thanks for reaching out — our team will get back to you soon.",
  });
});

// @route GET /api/contact (admin)
export const getContactSubmissions = asyncHandler(async (req, res) => {
  const submissions = await ContactSubmission.find({}).sort({ createdAt: -1 });
  res.json({ submissions });
});

// @route PUT /api/contact/:id/resolve (admin)
export const resolveContactSubmission = asyncHandler(async (req, res) => {
  const submission = await ContactSubmission.findById(req.params.id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  submission.isResolved = req.body.isResolved;
  await submission.save();
  res.json({ submission });
});
