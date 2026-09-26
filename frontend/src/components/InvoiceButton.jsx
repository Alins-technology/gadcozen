import { useState } from "react";
import { FileDown } from "lucide-react";
import api, { getErrorMessage } from "../services/api.js";

// The invoice exists only once an order is placed (COD) or paid (online).
export const hasInvoice = (order) =>
  order &&
  order.orderStatus !== "Pending" &&
  (order.paymentMethod === "cod" || ["paid", "refunded"].includes(order.paymentStatus));

// Downloads the PDF invoice. `url` is the API path, e.g. /orders/mine/GZ.../invoice
export default function InvoiceButton({ url, fileName = "invoice.pdf", className = "" }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(url, { responseType: "blob" });
      const disposition = res.headers["content-disposition"] || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const blobUrl = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = match ? match[1] : fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (err) {
      let message = getErrorMessage(err);
      // Error bodies come back as a Blob because of responseType: "blob".
      if (err?.response?.data instanceof Blob) {
        try {
          message = JSON.parse(await err.response.data.text()).message || message;
        } catch {
          /* keep the generic message */
        }
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={download}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full border border-brand-600 px-4 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 disabled:opacity-60"
      >
        <FileDown className="h-4 w-4" />
        {loading ? "Preparing invoice…" : "Download Invoice"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
