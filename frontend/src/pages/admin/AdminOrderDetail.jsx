import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchOrderByIdAdmin, updateOrderStatusAdmin } from "../../services/orderService.js";
import { formatPrice, formatDate } from "../../utils/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageLoader from "../../components/PageLoader.jsx";

const statuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    document.title = "Order Details | GADCO ZEN Admin";
    fetchOrderByIdAdmin(id)
      .then((data) => setOrder(data.order))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      const { order: updated } = await updateOrderStatusAdmin(id, newStatus);
      setOrder(updated);
      showToast(`Order marked as ${newStatus}`, "success");
    } catch {
      showToast("Could not update order status", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!order) return <p className="text-sm text-ink-500">Order not found.</p>;

  return (
    <div>
      <Link to="/admin/orders" className="text-sm text-brand-700 hover:underline">
        &larr; Back to Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-ink-900">{order.orderNumber}</h1>
          <p className="text-sm text-ink-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <select
          value={order.orderStatus}
          disabled={updating}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="input-field !w-auto"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h3 className="font-display text-base text-ink-900">Items</h3>
          <div className="mt-3 divide-y divide-brand-50">
            {order.items.map((item) => (
              <div key={item.product} className="flex items-center gap-3 py-3">
                {item.image && <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink-900">{item.name}</p>
                  <p className="text-xs text-ink-500">Qty {item.quantity} × {formatPrice(item.price)}</p>
                </div>
                <span className="text-sm font-semibold text-ink-900">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display text-base text-ink-900">Customer</h3>
            <p className="mt-2 text-sm text-ink-700">
              {order.user?.name}
              <br />
              {order.user?.email}
              <br />
              {order.user?.phone}
            </p>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display text-base text-ink-900">Shipping Address</h3>
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

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display text-base text-ink-900">Payment</h3>
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
              <div className="flex justify-between border-t border-brand-50 pt-1 font-semibold text-ink-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <p className="pt-1 text-xs text-ink-500">
                {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online (Demo)"} · {order.paymentStatus}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
