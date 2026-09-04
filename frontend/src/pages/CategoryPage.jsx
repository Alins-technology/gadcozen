import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { fetchCategoryBySlug, fetchProducts } from "../services/productService.js";
import EmptyState from "../components/EmptyState.jsx";
import { PackageSearch } from "lucide-react";

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "name-asc", label: "Name A-Z" },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const sort = searchParams.get("sort") || "featured";

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const [catRes, prodRes] = await Promise.all([
        fetchCategoryBySlug(slug),
        fetchProducts({ category: slug, sort, limit: 24 }),
      ]);
      setCategory(catRes.category);
      setProducts(prodRes.products);
      document.title = `${catRes.category.name} | GADCO ZEN`;
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug, sort]);

  useEffect(() => {
    load();
  }, [load]);

  if (notFound) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={PackageSearch}
          title="Category not found"
          message="This category may have been removed."
          actionLabel="Browse all products"
          actionTo="/shop"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-brand-900 py-14 text-center text-white">
        <div className="container-app">
          <h1 className="font-display text-3xl sm:text-4xl">{category?.name || "Category"}</h1>
          {category?.description && (
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/70">{category.description}</p>
          )}
        </div>
      </div>

      <div className="container-app py-10">
        <Breadcrumbs items={[{ label: "Shop", to: "/shop" }, { label: category?.name || "" }]} />

        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-ink-500">{category?.productCount ?? products.length} products</p>
          <select
            value={sort}
            onChange={(e) => setSearchParams({ sort: e.target.value })}
            className="input-field !w-auto !py-2 text-sm"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                Sort: {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8">
          <ProductGrid products={products} loading={loading} />
        </div>

        <div className="mt-10 text-center">
          <Link to="/shop" className="text-sm font-medium text-brand-700 hover:underline">
            Browse all categories &amp; products
          </Link>
        </div>
      </div>
    </div>
  );
}
