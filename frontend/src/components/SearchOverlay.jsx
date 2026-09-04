import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, PackageSearch } from "lucide-react";
import { fetchProducts } from "../services/productService.js";
import { formatPrice } from "../utils/format.js";

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchProducts({ search: q, limit: 6 });
      setResults(data.products);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const goToResults = () => {
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query)}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative z-10 mx-auto mt-20 w-full max-w-2xl rounded-3xl bg-white p-4 shadow-card sm:p-6"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Search size={20} className="text-brand-600" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && goToResults()}
                placeholder="Search for face wash, sunscreen, shampoo…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-ink-500/60"
              />
              <button onClick={onClose} className="rounded-full p-1.5 hover:bg-brand-50" aria-label="Close search">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {loading && <p className="py-8 text-center text-sm text-ink-500">Searching…</p>}
              {!loading && query && results.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <PackageSearch size={28} className="text-brand-300" />
                  <p className="text-sm text-ink-500">No products match "{query}"</p>
                </div>
              )}
              {!loading &&
                results.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      navigate(`/product/${p.slug}`);
                      onClose();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition hover:bg-brand-50"
                  >
                    <img
                      src={p.images?.[0]}
                      alt={p.name}
                      className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{p.name}</p>
                      <p className="text-xs text-ink-500">{p.category?.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-ink-900">{formatPrice(p.price)}</span>
                  </button>
                ))}
              {!loading && results.length > 0 && (
                <button
                  onClick={goToResults}
                  className="mt-2 w-full rounded-xl py-2.5 text-center text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  View all results for "{query}"
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
