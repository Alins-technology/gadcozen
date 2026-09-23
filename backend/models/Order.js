import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // price at purchase
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },
    contactEmail: { type: String, required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    codFee: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: { type: String },
    // "mock_online" is a dev-only simulated payment (see config/store.js).
    paymentMethod: { type: String, enum: ["cod", "razorpay", "mock_online"], required: true },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    paymentInfo: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      refundId: { type: String },
      paidAt: { type: Date },
    },
    // Stock is reserved when the order is created. This flag makes sure it's
    // only ever released once (payment failure, expiry, or cancellation).
    stockReleased: { type: Boolean, default: false },
    // Guards the one-time "order confirmed" side effects (emails, cart clear),
    // since both the browser callback and the Razorpay webhook can confirm.
    confirmationSent: { type: Boolean, default: false },
    orderStatus: {
      type: String,
      enum: ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    notes: { type: String },
    courierName: { type: String },
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    statusHistory: [
      {
        _id: false,
        status: { type: String },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

orderSchema.index({ user: 1 });
orderSchema.index({ "paymentInfo.razorpayOrderId": 1 }, { sparse: true });
orderSchema.index({ paymentMethod: 1, paymentStatus: 1, orderStatus: 1, createdAt: 1 });
// orderNumber already has a unique index via `unique: true` above — no need to declare it again here.

export default mongoose.model("Order", orderSchema);
