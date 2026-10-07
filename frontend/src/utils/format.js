export const formatPrice = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

// Bulk (quote) price per pack — same rounding as the backend (config/store.js).
export const bulkPrice = (price = 0, percent = 0) => Math.round(Number(price) * (1 - percent / 100));

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
