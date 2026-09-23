export const paymentMethodLabel = (method) =>
  ({
    cod: "Cash on Delivery",
    razorpay: "Online (Razorpay)",
    mock_online: "Online (test mode)",
  })[method] || method;

export const paymentStatusLabel = (order) => {
  if (order.paymentMethod === "cod" && order.paymentStatus === "pending") return "Pay on delivery";
  return (
    {
      pending: "Awaiting payment",
      paid: "Paid",
      failed: "Not completed",
      refunded: "Refunded",
    }[order.paymentStatus] || order.paymentStatus
  );
};
