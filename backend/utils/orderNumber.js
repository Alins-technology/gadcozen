export const generateOrderNumber = () => {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  // 6-digit random suffix (000000-999999) keeps same-day collisions very
  // unlikely; createOrder() also retries on the rare duplicate anyway.
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `GZ${y}${m}${d}-${rand}`;
};
