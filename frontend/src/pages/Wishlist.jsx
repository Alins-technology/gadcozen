import { Heart } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useSeo from "../hooks/useSeo.js";

export default function Wishlist() {
  useSeo({ title: "Wishlist", noindex: true });
  const { products, loading } = useWishlist();
  const { isAuthenticated } = useAuth();


  return (
    <div className="container-app py-10">
      <Breadcrumbs items={[{ label: "Wishlist" }]} />
      <h1 className="mt-3 font-display text-3xl text-ink-900">Your Wishlist</h1>

      {!isAuthenticated ? (
        <EmptyState
          icon={Heart}
          title="Log in to see your wishlist"
          message="Save products you love and come back to them anytime."
          actionLabel="Log In"
          actionTo="/login"
        />
      ) : (
        <div className="mt-8">
          <ProductGrid products={products} loading={loading} />
        </div>
      )}
    </div>
  );
}
