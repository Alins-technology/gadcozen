import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Building2, MessageCircle } from "lucide-react";
import {
  fetchBulkEnquiriesAdmin,
  updateBulkEnquiryAdmin,
} from "../../services/bulkEnquiryService.js";
import { formatDate, formatPrice } from "../../utils/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageLoader from "../../components/PageLoader.jsx";

const statusStyles = {
  New: "bg-amber-50 text-amber-700",
  Contacted: "bg-sky-50 text-sky-700",
  Quoted: "bg-violet-50 text-violet-700",
  Converted: "bg-green-50 text-green-700",
  Closed: "bg-slate-100 text-ink-500",
};

const waLink = (phone) => {
  const digits = String(phone).replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${full}`;
};

export default function AdminBulkEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [statuses, setStatuses] = useState(Object.keys(statusStyles));
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const [notes, setNotes] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    document.title = "Bulk Enquiries | GADCO ZEN Admin";
    fetchBulkEnquiriesAdmin()
      .then((data) => {
        setEnquiries(data.enquiries);
        if (data.statuses?.length) setStatuses(data.statuses);
      })
      .catch(() => showToast("Could not load bulk enquiries", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = async (enquiry, data, successMessage) => {
    try {
      const { enquiry: updated } = await updateBulkEnquiryAdmin(enquiry._id, data);
      setEnquiries((prev) => prev.map((e) => (e._id === updated._id ? updated : e)));
      showToast(successMessage, "success");
    } catch {
      showToast("Could not update this enquiry", "error");
    }
  };

  const isOpen = (e) => !["Converted", "Closed"].includes(e.status);
  const visible = enquiries.filter((e) =>
    filter === "all" ? true : filter === "open" ? isOpen(e) : e.status === filter
  );
  const newCount = enquiries.filter((e) => e.status === "New").length;

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">
          Bulk Enquiries
          {newCount > 0 && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 align-middle font-sans text-xs font-semibold text-amber-800">
              {newCount} new
            </span>
          )}
        </h1>
        <div className="flex flex-wrap gap-2">
          {[["open", "Open"], ...statuses.map((s) => [s, s]), ["all", "All"]].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                filter === value ? "bg-brand-600 text-white" : "bg-slate-100 text-ink-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {visible.map((e) => (
          <div key={e._id} className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {e.organization || e.name}
                  {e.businessType && <span className="ml-2 text-xs font-normal text-ink-500">· {e.businessType}</span>}
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                  {e.organization && (
                    <span className="flex items-center gap-1">
                      <Building2 size={12} /> {e.name}
                    </span>
                  )}
                  <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-brand-700">
                    <Mail size={12} /> {e.email}
                  </a>
                  <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-brand-700">
                    <Phone size={12} /> {e.phone}
                  </a>
                  {e.city && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {e.city}
                    </span>
                  )}
                  {e.gstin && <span>GSTIN {e.gstin}</span>}
                  <span>{formatDate(e.createdAt)}</span>
                </p>
              </div>
              <select
                value={e.status}
                onChange={(ev) => update(e, { status: ev.target.value }, `Marked as ${ev.target.value}`)}
                className={`rounded-full border-0 px-3 py-1.5 text-xs font-medium outline-none ${statusStyles[e.status] || ""}`}
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <table className="mt-4 w-full text-sm">
              <tbody>
                {e.items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0">
                    <td className="py-1.5 text-ink-700">{item.productName}</td>
                    <td className="py-1.5 text-right font-medium text-ink-900">
                      {item.quantity.toLocaleString("en-IN")} {item.product ? "packs" : ""}
                    </td>
                    <td className="py-1.5 pl-4 text-right text-xs text-ink-500">
                      {item.bulkUnitPrice != null ? (
                        <>
                          {formatPrice(item.bulkUnitPrice)}/pack{" "}
                          <span className="line-through">{formatPrice(item.unitPrice)}</span>
                        </>
                      ) : (
                        "On quote"
                      )}
                    </td>
                  </tr>
                ))}
                {e.estimatedTotal > 0 && (
                  <tr>
                    <td className="pt-2 font-semibold text-ink-900" colSpan={2}>
                      Estimated bulk total ({e.discountPercent}% off)
                    </td>
                    <td className="pt-2 text-right font-semibold text-ink-900">
                      {formatPrice(e.estimatedTotal)}{" "}
                      <span className="text-xs font-normal text-ink-500 line-through">{formatPrice(e.retailTotal)}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {e.message && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-ink-700">{e.message}</p>}

            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                placeholder="Internal notes (quote sent, price offered…)"
                value={notes[e._id] ?? e.adminNotes ?? ""}
                onChange={(ev) => setNotes((n) => ({ ...n, [e._id]: ev.target.value }))}
                className="input-field !py-2 text-xs"
              />
              <button
                onClick={() => update(e, { adminNotes: notes[e._id] ?? e.adminNotes }, "Notes saved")}
                className="btn-outline !px-4 !py-2 text-xs"
              >
                Save notes
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-4">
              <a
                href={`mailto:${e.email}?subject=${encodeURIComponent("Your bulk order quote — GADCO ZEN")}`}
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                Reply by Email
              </a>
              <a href={waLink(e.phone)} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-medium text-ink-700 hover:underline">
                <MessageCircle size={12} /> WhatsApp
              </a>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-ink-500">
            {filter === "open" ? "No open bulk enquiries." : "No enquiries found."}
          </p>
        )}
      </div>
    </div>
  );
}
