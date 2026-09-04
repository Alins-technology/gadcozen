import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/Modal.jsx";
import {
  fetchCouponsAdmin,
  createCouponAdmin,
  updateCouponAdmin,
  deleteCouponAdmin,
} from "../../services/couponService.js";
import { formatDate } from "../../utils/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage } from "../../services/api.js";
import PageLoader from "../../components/PageLoader.jsx";

const emptyForm = { code: "", discountPercent: "", minOrderValue: "", expiresAt: "", isActive: true };

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState(null);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    fetchCouponsAdmin()
      .then((data) => setCoupons(data.coupons))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Manage Coupons | GADCO ZEN Admin";
    load();
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (coupon) => {
    setForm({
      ...coupon,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.slice(0, 10) : "",
    });
    setEditingId(coupon._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: form.code,
      discountPercent: Number(form.discountPercent),
      minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : 0,
      expiresAt: form.expiresAt || undefined,
      isActive: form.isActive,
    };
    try {
      if (editingId) {
        await updateCouponAdmin(editingId, payload);
      } else {
        await createCouponAdmin(payload);
      }
      showToast("Coupon saved", "success");
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCouponAdmin(toDelete._id);
      showToast("Coupon deleted", "success");
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setToDelete(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-900">Coupons</h1>
        <button onClick={openNew} className="btn-primary !py-2 text-sm">
          <Plus size={15} /> Add Coupon
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min. Order</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c._id} className="border-b border-brand-50 last:border-0">
                <td className="p-3 font-medium text-ink-900">{c.code}</td>
                <td className="p-3 text-ink-700">{c.discountPercent}%</td>
                <td className="p-3 text-ink-700">₹{c.minOrderValue}</td>
                <td className="p-3 text-ink-700">{c.expiresAt ? formatDate(c.expiresAt) : "—"}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      c.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-ink-500"
                    }`}
                  >
                    {c.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      className="rounded-full p-1.5 text-ink-500 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => setToDelete(c)}
                      className="rounded-full p-1.5 text-ink-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <p className="p-6 text-center text-sm text-ink-500">No coupons yet.</p>}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Coupon" : "Add Coupon"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Coupon code (e.g. WELCOME10)"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            className="input-field uppercase"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              required
              type="number"
              min="1"
              max="100"
              placeholder="Discount %"
              value={form.discountPercent}
              onChange={(e) => setForm((f) => ({ ...f, discountPercent: e.target.value }))}
              className="input-field"
            />
            <input
              type="number"
              min="0"
              placeholder="Min order value (₹)"
              value={form.minOrderValue}
              onChange={(e) => setForm((f) => ({ ...f, minOrderValue: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">Expires on (optional)</label>
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              className="input-field"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="accent-brand-600"
            />
            Active
          </label>
          <button type="submit" className="btn-primary w-full">
            Save Coupon
          </button>
        </form>
      </Modal>

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Delete Coupon">
        <p className="text-sm text-ink-700">
          Delete <strong>{toDelete?.code}</strong>? This cannot be undone.
        </p>
        <div className="mt-5 flex gap-3">
          <button onClick={() => setToDelete(null)} className="btn-outline flex-1">
            Cancel
          </button>
          <button onClick={handleDelete} className="btn-primary flex-1 !bg-red-600 hover:!bg-red-700">
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
