import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "../../components/Modal.jsx";
import {
  fetchAllCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
} from "../../services/productService.js";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage } from "../../services/api.js";
import PageLoader from "../../components/PageLoader.jsx";

const emptyForm = { name: "", description: "", image: "", isActive: true };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [toDelete, setToDelete] = useState(null);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    fetchAllCategoriesAdmin()
      .then((data) => setCategories(data.categories))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Manage Categories | GADCO ZEN Admin";
    load();
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  };
  const openEdit = (cat) => {
    setForm(cat);
    setEditingId(cat._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategoryAdmin(editingId, form);
      } else {
        await createCategoryAdmin(form);
      }
      showToast("Category saved", "success");
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategoryAdmin(toDelete._id);
      showToast("Category deleted", "success");
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
        <h1 className="font-display text-2xl text-ink-900">Categories</h1>
        <button onClick={openNew} className="btn-primary !py-2 text-sm">
          <Plus size={15} /> Add Category
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <div key={cat._id} className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-base text-ink-900">{cat.name}</h3>
                <p className="text-xs text-ink-500">/{cat.slug}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  cat.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-ink-500"
                }`}
              >
                {cat.isActive ? "Active" : "Hidden"}
              </span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-ink-700">{cat.description}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => openEdit(cat)} className="btn-outline flex-1 !py-1.5 text-xs">
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => setToDelete(cat)}
                className="btn-outline flex-1 !py-1.5 text-xs !border-red-200 !text-red-600 hover:!bg-red-50"
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Category name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-field"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="input-field"
          />
          <input
            placeholder="Image URL (optional)"
            value={form.image}
            onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
            className="input-field"
          />
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              className="accent-brand-600"
            />
            Active (visible on storefront)
          </label>
          <button type="submit" className="btn-primary w-full">
            Save Category
          </button>
        </form>
      </Modal>

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Delete Category">
        <p className="text-sm text-ink-700">
          Delete <strong>{toDelete?.name}</strong>? Categories with assigned products cannot be
          deleted.
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
