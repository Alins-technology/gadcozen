import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchOrderByIdAdmin, updateOrderStatusAdmin } from "../../services/orderService.js";
import { formatPrice, formatDate } from "../../utils/format.js";
import { paymentMethodLabel, paymentStatusLabel } from "../../utils/orderLabels.js";
import { getErrorMessage } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageLoader from "../../components/PageLoader.jsx";
import { imgProps } from "../../utils/image.js";
import InvoiceButton, { hasInvoice } from "../../components/InvoiceButton.jsx";

const statuses = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [tracking, setTracking] = useState({ courierName: "", trackingNumber: "", trackingUrl: "" });
  const { showToast } = useToast();

  // Orders ship via Shiprocket: default the courier name and build the public
  // tracking link from the AWB number when no link was entered.
  const withTrackingLink = (t) => {
    const awb = t.trackingNumber.trim();
    const isShiprocket = !t.courierName.trim() || /shiprocket/i.test(t.courierName);
    return {
      ...t,
      courierName: t.courierName.trim() || (awb ? "Shiprocket" : ""),
      trackingUrl:
        t.trackingUrl.trim() || (awb && isShiprocket ? `https://shiprocket.co/tracking/${encodeURIComponent(awb)}` : ""),
    };
  };

  useEffect(() => {
    document.title = "Order Details | GADCO ZEN Admin";
    fetchOrderByIdAdmin(id)
      .then((data) => {
        setOrder(data.order);
        setTracking({
          courierName: data.order.courierName || "",
          trackingNumber: data.order.trackingNumber || "",
          trackingUrl: data.order.trackingUrl || "",
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (
      newStatus === "Cancelled" &&
      order.paymentStatus === "paid" &&
      order.paymentMethod === "razorpay" &&
      !window.confirm(`Cancelling will refund ${formatPrice(order.total)} to the customer via Razorpay. Continue?`)
    ) {
      return;
    }
    setUpdating(true);
    try {
      const { order: updated } = await updateOrderStatusAdmin(id, { orderStatus: newStatus, ...withTrackingLink(tracking) });
      setOrder(updated);
      showToast(`Order marked as ${newStatus}`, "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveTracking = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = withTrackingLink(tracking);
      const { order: updated } = await updateOrderStatusAdmin(id, payload);
      setOrder(updated);
      setTracking(payload);
      showToast("Tracking details saved", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
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
          {order.invoiceNumber && <p className="text-xs text-ink-500">Invoice {order.invoiceNumber}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {hasInvoice(order) && (
            <InvoiceButton url={`/orders/${order._id}/invoice`} fileName={`Invoice-${order.orderNumber}.pdf`} />
          )}
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
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h3 className="font-display text-base text-ink-900">Items</h3>
          <div className="mt-3 divide-y divide-brand-50">
            {order.items.map((item) => (
              <div key={item.product} className="flex items-center gap-3 py-3">
                {item.image && <img {...imgProps(item.image, 200)} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />}
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
              {order.codFee > 0 && (
                <div className="flex justify-between">
                  <span>COD fee</span>
                  <span>{formatPrice(order.codFee)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-brand-50 pt-1 font-semibold text-ink-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <p className="pt-1 text-xs text-ink-500">
                {paymentMethodLabel(order.paymentMethod)} · {paymentStatusLabel(order)}
              </p>
              {order.paymentInfo?.razorpayPaymentId && (
                <p className="break-all text-xs text-ink-500">
                  Razorpay payment: {order.paymentInfo.razorpayPaymentId}
                  {order.paymentInfo.refundId && <> · Refund: {order.paymentInfo.refundId}</>}
                </p>
              )}
              {order.notes && <p className="text-xs text-amber-700">{order.notes}</p>}
            </div>
          </div>

          <form onSubmit={handleSaveTracking} className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display text-base text-ink-900">Shipment Tracking</h3>
            <p className="mt-1 text-xs text-ink-500">
              Shown to the customer and included in the &quot;Shipped&quot; email.
            </p>
            <div className="mt-3 space-y-2">
              <input
                placeholder="Courier (default: Shiprocket)"
                value={tracking.courierName}
                onChange={(e) => setTracking((t) => ({ ...t, courierName: e.target.value }))}
                className="input-field"
              />
              <input
                placeholder="Tracking / AWB number"
                value={tracking.trackingNumber}
                onChange={(e) => setTracking((t) => ({ ...t, trackingNumber: e.target.value }))}
                className="input-field"
              />
              <input
                type="url"
                placeholder="Tracking link (auto-filled for Shiprocket)"
                value={tracking.trackingUrl}
                onChange={(e) => setTracking((t) => ({ ...t, trackingUrl: e.target.value }))}
                className="input-field"
              />
            </div>
            <button type="submit" disabled={updating} className="btn-outline mt-3 w-full">
              Save Tracking
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
