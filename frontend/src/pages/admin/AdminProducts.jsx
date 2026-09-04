import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import Modal from "../../components/Modal.jsx";
import { fetchAllProductsAdmin, deleteProductAdmin } from "../../services/productService.js";
import { formatPrice } from "../../utils/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageLoader from "../../components/PageLoader.jsx";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const { showToast } = useToast();

  const load = () => {
    setLoading(true);
    fetchAllProductsAdmin()
      .then((data) => setProducts(data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    document.title = "Manage Products | GADCO ZEN Admin";
    load();
  }, []);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDelete = async () => {
    try {
      await deleteProductAdmin(toDelete._id);
      setProducts((prev) => prev.filter((p) => p._id !== toDelete._id));
      showToast("Product deleted", "success");
    } catch {
      showToast("Could not delete product", "error");
    } finally {
      setToDelete(null);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink-900">Products</h1>
        <Link to="/admin/products/new" className="btn-primary !py-2 text-sm">
          <Plus size={15} /> Add Product
        </Link>
      </div>

      <div className="relative mt-4 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          placeholder="Search products…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field !pl-9 !py-2 text-sm"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-brand-100 text-left text-xs uppercase tracking-wide text-ink-500">
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="border-b border-brand-50 last:border-0">
                <td className="flex items-center gap-3 p-3">
                  <img src={p.images?.[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" />
                  <span className="font-medium text-ink-900">{p.name}</span>
                </td>
                <td className="p-3 text-ink-700">{p.category?.name}</td>
                <td className="p-3 text-ink-700">{formatPrice(p.price)}</td>
                <td className="p-3 text-ink-700">{p.stock}</td>
                <td className="p-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      p.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-ink-500"
                    }`}
                  >
                    {p.isActive ? "Active" : "Disabled"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/admin/products/${p._id}/edit`}
                      className="rounded-full p-1.5 text-ink-500 hover:bg-brand-50 hover:text-brand-700"
                    >
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => setToDelete(p)}
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
        {filtered.length === 0 && <p className="p-6 text-center text-sm text-ink-500">No products found.</p>}
      </div>

      <Modal open={Boolean(toDelete)} onClose={() => setToDelete(null)} title="Delete Product">
        <p className="text-sm text-ink-700">
          Are you sure you want to delete <strong>{toDelete?.name}</strong>? This cannot be undone.
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
