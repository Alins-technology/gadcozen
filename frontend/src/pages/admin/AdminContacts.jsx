import { useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import {
  fetchContactSubmissionsAdmin,
  resolveContactSubmissionAdmin,
} from "../../services/contactService.js";
import { formatDate } from "../../utils/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageLoader from "../../components/PageLoader.jsx";

export default function AdminContacts() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("open");
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    fetchContactSubmissionsAdmin()
      .then((data) => setSubmissions(data.submissions))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Contact Messages | GADCO ZEN Admin";
    load();
  }, []);

  const toggleResolved = async (submission) => {
    try {
      const { submission: updated } = await resolveContactSubmissionAdmin(
        submission._id,
        !submission.isResolved
      );
      setSubmissions((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      showToast(updated.isResolved ? "Marked as resolved" : "Reopened", "success");
    } catch {
      showToast("Could not update this message", "error");
    }
  };

  const visible = submissions.filter((s) =>
    filter === "all" ? true : filter === "open" ? !s.isResolved : s.isResolved
  );

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">Contact Messages</h1>
        <div className="flex gap-2">
          {[
            ["open", "Open"],
            ["resolved", "Resolved"],
            ["all", "All"],
          ].map(([value, label]) => (
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
        {visible.map((s) => (
          <div key={s._id} className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink-900">{s.subject}</p>
                <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                  <span>{s.name}</span>
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> {s.email}
                  </span>
                  {s.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={12} /> {s.phone}
                    </span>
                  )}
                  <span>{formatDate(s.createdAt)}</span>
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  s.isResolved ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {s.isResolved ? "Resolved" : "Open"}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink-700">{s.message}</p>
            <div className="mt-3 flex gap-3">
              <button
                onClick={() => toggleResolved(s)}
                className="text-xs font-medium text-brand-700 hover:underline"
              >
                {s.isResolved ? "Reopen" : "Mark as Resolved"}
              </button>
              <a
                href={`mailto:${s.email}`}
                className="text-xs font-medium text-ink-700 hover:underline"
              >
                Reply by Email
              </a>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="text-sm text-ink-500">
            {filter === "open" ? "No open messages." : "No messages found."}
          </p>
        )}
      </div>
    </div>
  );
}
