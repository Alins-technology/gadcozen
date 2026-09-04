export const formatPrice = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
