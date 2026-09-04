import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { fetchAllReviewsAdmin, moderateReviewAdmin, deleteReviewAdmin } from "../../services/reviewService.js";
import RatingStars from "../../components/RatingStars.jsx";
import { formatDate } from "../../utils/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageLoader from "../../components/PageLoader.jsx";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    fetchAllReviewsAdmin()
      .then((data) => setReviews(data.reviews))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Manage Reviews | GADCO ZEN Admin";
    load();
  }, []);

  const toggleApproval = async (review) => {
    const { review: updated } = await moderateReviewAdmin(review._id, !review.isApproved);
    setReviews((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    showToast(updated.isApproved ? "Review approved" : "Review hidden", "success");
  };

  const handleDelete = async (id) => {
    await deleteReviewAdmin(id);
    setReviews((prev) => prev.filter((r) => r._id !== id));
    showToast("Review deleted", "success");
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Reviews</h1>

      <div className="mt-4 space-y-3">
        {reviews.map((r) => (
          <div key={r._id} className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-ink-900">{r.product?.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <RatingStars rating={r.rating} />
                  <span className="text-xs text-ink-500">{formatDate(r.createdAt)}</span>
                  {r.isDemo && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-ink-500">Demo</span>
                  )}
                </div>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  r.isApproved ? "bg-green-50 text-green-700" : "bg-slate-100 text-ink-500"
                }`}
              >
                {r.isApproved ? "Visible" : "Hidden"}
              </span>
            </div>
            {r.title && <p className="mt-2 text-sm font-medium text-ink-900">{r.title}</p>}
            <p className="mt-1 text-sm text-ink-700">{r.comment}</p>
            <p className="mt-2 text-xs text-ink-500">{r.name}</p>
            <div className="mt-3 flex gap-3">
              <button onClick={() => toggleApproval(r)} className="text-xs font-medium text-brand-700 hover:underline">
                {r.isApproved ? "Hide" : "Approve"}
              </button>
              <button
                onClick={() => handleDelete(r._id)}
                className="flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-ink-500">No reviews yet.</p>}
      </div>
    </div>
  );
}
