import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { fetchAllOrdersAdmin } from "../../services/orderService.js";
import { formatPrice, formatDate } from "../../utils/format.js";
import PageLoader from "../../components/PageLoader.jsx";

const statuses = ["", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

const statusColors = {
  Pending: "bg-amber-50 text-amber-700",
  Confirmed: "bg-brand-50 text-brand-700",
  Processing: "bg-blue-50 text-blue-700",
  Shipped: "bg-indigo-50 text-indigo-700",
  Delivered: "bg-green-50 text-green-700",
  Cancelled: "bg-red-50 text-red-700",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetchAllOrdersAdmin({ search: search || undefined, status: status || undefined, limit: 50 })
      .then((data) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => {
    document.title = "Manage Orders | GADCO ZEN Admin";
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Orders</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
          <input
            placeholder="Search order # or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field !pl-9 !py-2 text-sm"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field !w-auto !py-2 text-sm">
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s || "All Statuses"}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-brand-50 last:border-0">
                  <td className="p-3 font-medium text-ink-900">{order.orderNumber}</td>
                  <td className="p-3 text-ink-700">
                    {order.user?.name}
                    <br />
                    <span className="text-xs text-ink-500">{order.contactEmail}</span>
                  </td>
                  <td className="p-3 text-ink-700">{formatDate(order.createdAt)}</td>
                  <td className="p-3 text-ink-700">{formatPrice(order.total)}</td>
                  <td className="p-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <Link to={`/admin/orders/${order._id}`} className="text-sm font-medium text-brand-700 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="p-6 text-center text-sm text-ink-500">No orders found.</p>}
        </div>
      )}
    </div>
  );
}
