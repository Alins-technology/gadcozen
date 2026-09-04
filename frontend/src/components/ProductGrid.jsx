import ProductCard from "./ProductCard.jsx";
import ProductCardSkeleton from "./ProductCardSkeleton.jsx";
import EmptyState from "./EmptyState.jsx";
import { PackageSearch } from "lucide-react";

export default function ProductGrid({ products, loading, columns = "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" }) {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 ${columns} gap-4 sm:gap-5`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        icon={PackageSearch}
        title="No products found"
        message="Try adjusting your filters or search terms."
        actionLabel="Browse all products"
        actionTo="/shop"
      />
    );
  }

  return (
    <div className={`grid grid-cols-2 ${columns} gap-4 sm:gap-5`}>
      {products.map((product, i) => (
        <ProductCard key={product._id} product={product} index={i} />
      ))}
    </div>
  );
}
