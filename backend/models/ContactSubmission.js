import mongoose from "mongoose";

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("ContactSubmission", contactSubmissionSchema);
