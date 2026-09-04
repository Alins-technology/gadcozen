import { useEffect, useState } from "react";
import { Trash2, Download } from "lucide-react";
import { fetchSubscribersAdmin, deleteSubscriberAdmin } from "../../services/subscriberService.js";
import { formatDate } from "../../utils/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageLoader from "../../components/PageLoader.jsx";

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    fetchSubscribersAdmin()
      .then((data) => setSubscribers(data.subscribers))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Newsletter Subscribers | GADCO ZEN Admin";
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteSubscriberAdmin(id);
      setSubscribers((prev) => prev.filter((s) => s._id !== id));
      showToast("Subscriber removed", "success");
    } catch {
      showToast("Could not remove subscriber", "error");
    }
  };

  const exportCsv = () => {
    const rows = ["email,subscribed_on", ...subscribers.map((s) => `${s.email},${s.createdAt}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gadco-zen-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Newsletter Subscribers</h1>
        {subscribers.length > 0 && (
          <button onClick={exportCsv} className="btn-outline !py-2 text-sm">
            <Download size={15} /> Export CSV
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="p-3">Email</th>
              <th className="p-3">Subscribed On</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s._id} className="border-b border-brand-50 last:border-0">
                <td className="p-3 text-ink-900">{s.email}</td>
                <td className="p-3 text-ink-700">{formatDate(s.createdAt)}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleDelete(s._id)}
                    className="rounded-full p-1.5 text-ink-500 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-500">No subscribers yet.</p>
        )}
      </div>
    </div>
  );
}
