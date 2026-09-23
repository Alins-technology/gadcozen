// Single source of truth for store-wide business rules. Everything here can be
// overridden from backend/.env so the client's final numbers can be plugged in
// without touching code. The frontend reads the public parts via GET /api/config.

const num = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && value !== "" && value !== undefined ? n : fallback;
};

export const FREE_SHIPPING_THRESHOLD = num(process.env.FREE_SHIPPING_THRESHOLD, 999);
export const STANDARD_SHIPPING = num(process.env.STANDARD_SHIPPING_FEE, 79);

// Cash on Delivery is on unless explicitly turned off.
export const COD_ENABLED = process.env.COD_ENABLED !== "false";
// Optional extra fee charged on COD orders (0 = no fee).
export const COD_FEE = num(process.env.COD_FEE, 0);

export const isRazorpayConfigured = () =>
  Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

// The simulated "demo" online payment only exists for local development when
// no real gateway is configured. It is never available in production.
export const isMockPaymentAllowed = () =>
  process.env.NODE_ENV !== "production" && !isRazorpayConfigured();

// How long an unpaid online order holds its stock before it's auto-cancelled.
export const PENDING_PAYMENT_TTL_MINUTES = num(process.env.PENDING_PAYMENT_TTL_MINUTES, 30);

export const calculateShipping = (subtotalAfterDiscount) =>
  subtotalAfterDiscount <= 0 || subtotalAfterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;

export const getEnabledPaymentMethods = () => {
  const methods = [];
  if (isRazorpayConfigured()) methods.push("razorpay");
  if (isMockPaymentAllowed()) methods.push("mock_online");
  if (COD_ENABLED) methods.push("cod");
  return methods;
};

export const getPublicStoreConfig = () => ({
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  standardShipping: STANDARD_SHIPPING,
  codFee: COD_ENABLED ? COD_FEE : 0,
  paymentMethods: getEnabledPaymentMethods(),
  razorpayKeyId: isRazorpayConfigured() ? process.env.RAZORPAY_KEY_ID : null,
});
