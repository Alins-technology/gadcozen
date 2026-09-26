import mongoose from "mongoose";

// Simple atomic counters, e.g. one sequential invoice series per financial year.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export default mongoose.model("Counter", counterSchema);
