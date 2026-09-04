import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import { fetchMyOrders } from "../../services/orderService.js";
import { formatPrice, formatDate } from "../../utils/format.js";
import EmptyState from "../../components/EmptyState.jsx";

const statusColors = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-brand-50 text-brand-700",
  Processing: "bg-blue-50 text-blue-700",
  Shipped: "bg-indigo-50 text-indigo-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders()
      .then((data) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-ink-500">Loading orders…</p>;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        message="When you place an order, it will show up here."
        actionLabel="Start Shopping"
        actionTo="/shop"
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link
          key={order._id}
          to={`/account/orders/${order.orderNumber}`}
          className="block rounded-2xl border border-slate-100 p-5 transition hover:border-brand-200 hover:shadow-soft"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-ink-900">{order.orderNumber}</p>
              <p className="text-xs text-ink-500">{formatDate(order.createdAt)}</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusColors[order.orderStatus] || "bg-slate-100 text-ink-700"
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-ink-500">{order.items.length} item(s)</span>
            <span className="font-semibold text-ink-900">{formatPrice(order.total)}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
