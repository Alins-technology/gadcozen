import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import ProductGrid from "../components/ProductGrid.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { fetchProducts, fetchCategories } from "../services/productService.js";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "name-asc", label: "Name A-Z" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "featured";

  useEffect(() => {
    document.title = "Shop All Products | GADCO ZEN";
  }, []);

  useEffect(() => {
    fetchCategories().then((data) => setCategories(data.categories));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchProducts({
        search: search || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sort,
        limit: 24,
      });
      setProducts(data.products);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sort]);

  useEffect(() => {
    load();
  }, [load]);

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const activeFilterCount = [category, minPrice, maxPrice, search].filter(Boolean).length;

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold text-ink-900">Category</h4>
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input
              type="radio"
              name="category"
              checked={!category}
              onChange={() => updateParam("category", "")}
              className="accent-brand-600"
            />
            All Categories
          </label>
          {categories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-2 text-sm text-ink-700">
              <input
                type="radio"
                name="category"
                checked={category === cat.slug}
                onChange={() => updateParam("category", cat.slug)}
                className="accent-brand-600"
              />
              {cat.name} <span className="text-xs text-ink-500">({cat.productCount})</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-sm font-semibold text-ink-900">Price Range (₹)</h4>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParam("minPrice", e.target.value)}
            className="input-field !py-2 text-sm"
          />
          <span className="text-ink-500">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParam("maxPrice", e.target.value)}
            className="input-field !py-2 text-sm"
          />
        </div>
      </div>
      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="text-sm font-medium text-brand-700 hover:underline">
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-app py-10">
      <Breadcrumbs items={[{ label: "Shop" }]} />
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink-900">
            {search ? `Results for "${search}"` : "All Products"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">{total} products</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(true)}
            className="btn-outline !py-2 lg:hidden"
          >
            <SlidersHorizontal size={15} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="input-field !w-auto !py-2 text-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-100 p-5">
            <h3 className="font-display text-lg text-ink-900">Filters</h3>
            <div className="mt-4">
              <FiltersPanel />
            </div>
          </div>
        </aside>

        <div>
          <ProductGrid products={products} loading={loading} />
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <div className="fixed inset-0 z-[92] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-ink-900/40"
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-6"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg text-ink-900">Filters</h3>
                <button onClick={() => setFiltersOpen(false)} className="rounded-full p-1.5 hover:bg-brand-50">
                  <X size={18} />
                </button>
              </div>
              <FiltersPanel />
              <button onClick={() => setFiltersOpen(false)} className="btn-primary mt-6 w-full">
                Show {total} Results
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
