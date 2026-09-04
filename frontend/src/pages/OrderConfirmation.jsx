import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { fetchMyOrderByNumber } from "../services/orderService.js";
import { formatPrice, formatDate } from "../utils/format.js";
import PageLoader from "../components/PageLoader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { PackageSearch } from "lucide-react";

export default function OrderConfirmation() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    document.title = "Order Confirmed | GADCO ZEN";
    fetchMyOrderByNumber(orderNumber)
      .then((data) => setOrder(data.order))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) return <PageLoader />;
  if (notFound || !order) {
    return (
      <div className="container-app py-16">
        <EmptyState icon={PackageSearch} title="Order not found" actionLabel="Go to Shop" actionTo="/shop" />
      </div>
    );
  }

  return (
    <div className="container-app flex justify-center py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl rounded-3xl border border-slate-100 p-8 text-center shadow-soft"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600"
        >
          <CheckCircle2 size={32} />
        </motion.div>
        <h1 className="mt-5 font-display text-2xl text-ink-900">Order Confirmed!</h1>
        <p className="mt-2 text-sm text-ink-500">
          Thank you — your order <strong>{order.orderNumber}</strong> has been placed on{" "}
          {formatDate(order.createdAt)}.
        </p>

        <div className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-100 text-left">
          {order.items.map((item) => (
            <div key={item.product} className="flex items-center gap-3 p-4">
              {item.image && (
                <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900">{item.name}</p>
                <p className="text-xs text-ink-500">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-ink-900">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="space-y-1 p-4 text-sm text-ink-700">
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
            <div className="flex justify-between text-base font-semibold text-ink-900">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/account/orders" className="btn-outline">
            View My Orders
          </Link>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
