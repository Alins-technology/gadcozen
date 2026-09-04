import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2, Upload, Loader2 } from "lucide-react";
import {
  fetchProductByIdAdmin,
  createProductAdmin,
  updateProductAdmin,
  fetchAllCategoriesAdmin,
  uploadProductImage,
} from "../../services/productService.js";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage } from "../../services/api.js";
import PageLoader from "../../components/PageLoader.jsx";

const emptyProduct = {
  name: "",
  category: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  sku: "",
  quantity: "",
  shortDescription: "",
  description: "",
  howToUse: "",
  images: [],
  benefits: [],
  ingredients: [],
  featured: false,
  bestseller: false,
  newArrival: false,
  isActive: true,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [benefitInput, setBenefitInput] = useState("");

  useEffect(() => {
    document.title = `${isEdit ? "Edit" : "Add"} Product | GADCO ZEN Admin`;
    fetchAllCategoriesAdmin().then((data) => setCategories(data.categories));
    if (isEdit) {
      fetchProductByIdAdmin(id)
        .then(({ product }) =>
          setForm({
            ...product,
            category: product.category?._id || product.category,
            price: product.price,
            compareAtPrice: product.compareAtPrice || "",
          })
        )
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadProductImage(file);
      setForm((f) => ({ ...f, images: [...f.images, url] }));
      showToast("Image uploaded", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx) =>
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const addBenefit = () => {
    if (!benefitInput.trim()) return;
    setForm((f) => ({ ...f, benefits: [...f.benefits, benefitInput.trim()] }));
    setBenefitInput("");
  };
  const removeBenefit = (idx) =>
    setForm((f) => ({ ...f, benefits: f.benefits.filter((_, i) => i !== idx) }));

  const addIngredient = () =>
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { name: "", benefit: "" }] }));
  const updateIngredient = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) => (i === idx ? { ...ing, [key]: value } : ing)),
    }));
  const removeIngredient = (idx) =>
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      stock: Number(form.stock),
    };
    try {
      if (isEdit) {
        await updateProductAdmin(id, payload);
        showToast("Product updated", "success");
      } else {
        await createProductAdmin(payload);
        showToast("Product created", "success");
      }
      navigate("/admin/products");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">{isEdit ? "Edit Product" : "Add Product"}</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display text-base text-ink-900">Basic Information</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-700">Product Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-700">Category</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-700">Quantity/Size (e.g. 100 ml)</label>
                  <input
                    required
                    value={form.quantity}
                    onChange={(e) => handleChange("quantity", e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-700">Short Description</label>
                <input
                  value={form.shortDescription}
                  onChange={(e) => handleChange("shortDescription", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-700">Full Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-700">How to Use</label>
                <textarea
                  rows={3}
                  value={form.howToUse}
                  onChange={(e) => handleChange("howToUse", e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display text-base text-ink-900">Benefits</h3>
            <div className="mt-3 flex gap-2">
              <input
                placeholder="e.g. Deep Cleanses"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addBenefit())}
                className="input-field"
              />
              <button type="button" onClick={addBenefit} className="btn-outline !px-4">
                <Plus size={15} />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {form.benefits.map((b, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700"
                >
                  {b}
                  <button type="button" onClick={() => removeBenefit(i)}>
                    <Trash2 size={11} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base text-ink-900">Ingredients</h3>
              <button type="button" onClick={addIngredient} className="text-sm text-brand-700 hover:underline">
                + Add Ingredient
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {form.ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    placeholder="Ingredient name"
                    value={ing.name}
                    onChange={(e) => updateIngredient(i, "name", e.target.value)}
                    className="input-field"
                  />
                  <input
                    placeholder="Benefit"
                    value={ing.benefit}
                    onChange={(e) => updateIngredient(i, "benefit", e.target.value)}
                    className="input-field"
                  />
                  <button type="button" onClick={() => removeIngredient(i)} className="text-ink-500 hover:text-red-500">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display text-base text-ink-900">Pricing & Stock</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-700">Price (₹)</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-700">Compare-at Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={form.compareAtPrice}
                  onChange={(e) => handleChange("compareAtPrice", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-700">Stock</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-700">SKU</label>
                <input value={form.sku} onChange={(e) => handleChange("sku", e.target.value)} className="input-field" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display text-base text-ink-900">Images</h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {form.images.map((img, i) => (
                <div key={i} className="group relative aspect-square overflow-hidden rounded-xl bg-brand-50">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 transition group-hover:opacity-100"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand-200 text-brand-600 hover:bg-brand-50">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                <span className="text-[10px]">Upload</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-brand-100 bg-white p-5">
            <h3 className="font-display text-base text-ink-900">Visibility</h3>
            <div className="mt-3 space-y-2">
              {[
                ["featured", "Featured"],
                ["bestseller", "Bestseller"],
                ["newArrival", "New Arrival"],
                ["isActive", "Active (visible on storefront)"],
              ].map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-ink-700">
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => handleChange(key, e.target.checked)}
                    className="accent-brand-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? "Saving…" : isEdit ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
