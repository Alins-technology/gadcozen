import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchMyOrderByNumber } from "../../services/orderService.js";
import { formatPrice, formatDate } from "../../utils/format.js";
import PageLoader from "../../components/PageLoader.jsx";
import EmptyState from "../../components/EmptyState.jsx";
import { PackageSearch } from "lucide-react";

const statusSteps = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

export default function OrderDetail() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchMyOrderByNumber(orderNumber)
      .then((data) => setOrder(data.order))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) return <PageLoader />;
  if (notFound || !order) {
    return <EmptyState icon={PackageSearch} title="Order not found" actionLabel="Back to Orders" actionTo="/account/orders" />;
  }

  const currentStepIndex = statusSteps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "Cancelled";

  return (
    <div className="rounded-2xl border border-slate-100 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg text-ink-900">Order {order.orderNumber}</h3>
          <p className="text-xs text-ink-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Link to="/account/orders" className="text-sm text-brand-700 hover:underline">
          &larr; Back to orders
        </Link>
      </div>

      {!isCancelled ? (
        <div className="mt-6">
          <div className="flex items-center">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-1 items-center last:flex-none">
                <div
                  className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                    i <= currentStepIndex ? "bg-brand-600" : "bg-slate-200"
                  }`}
                />
                {i < statusSteps.length - 1 && (
                  <div className={`h-px flex-1 ${i < currentStepIndex ? "bg-brand-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between">
            {statusSteps.map((step, i) => (
              <p
                key={step}
                className={`text-center text-[10px] sm:text-xs ${
                  i <= currentStepIndex ? "text-ink-900 font-medium" : "text-ink-500"
                }`}
                style={{ width: `${100 / statusSteps.length}%` }}
              >
                {step}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl bg-red-50 p-3 text-sm text-red-700">This order was cancelled.</div>
      )}

      <div className="mt-6 divide-y divide-slate-100 rounded-xl border border-slate-100">
        {order.items.map((item) => (
          <div key={item.product} className="flex items-center gap-3 p-4">
            {item.image && <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />}
            <div className="flex-1">
              <p className="text-sm font-medium text-ink-900">{item.name}</p>
              <p className="text-xs text-ink-500">Qty {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-ink-900">{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-ink-900">Shipping Address</h4>
          <p className="mt-2 text-sm text-ink-700">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1} {order.shippingAddress.line2}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.phone}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-900">Payment Summary</h4>
          <div className="mt-2 space-y-1 text-sm text-ink-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-brand-700">
                <span>Discount</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shippingCost === 0 ? "Free" : formatPrice(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between font-semibold text-ink-900">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            <p className="pt-1 text-xs text-ink-500">
              Payment: {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Demo)"} ·{" "}
              {order.paymentStatus}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
