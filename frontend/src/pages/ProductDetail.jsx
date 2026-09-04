import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, Truck, RefreshCcw, ShieldCheck, Star } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import QuantitySelector from "../components/QuantitySelector.jsx";
import RatingStars from "../components/RatingStars.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import PageLoader from "../components/PageLoader.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { formatPrice, formatDate } from "../utils/format.js";
import { fetchProductBySlug, fetchRelatedProducts } from "../services/productService.js";
import { fetchProductReviews, submitReview } from "../services/reviewService.js";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { getErrorMessage } from "../services/api.js";
import { PackageSearch } from "lucide-react";

const tabs = ["Description", "Ingredients / Info", "How to Use", "Shipping & Returns", "Reviews"];

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("Description");
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);

  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const { product } = await fetchProductBySlug(slug);
      setProduct(product);
      setActiveImage(0);
      setQty(1);
      document.title = `${product.name} | GADCO ZEN`;
      const [relatedRes, reviewsRes] = await Promise.all([
        fetchRelatedProducts(slug),
        fetchProductReviews(product._id),
      ]);
      setRelated(relatedRes.products);
      setReviews(reviewsRes.reviews);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
    window.scrollTo({ top: 0 });
  }, [load]);

  if (loading) return <PageLoader />;
  if (notFound || !product) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={PackageSearch}
          title="Product not found"
          message="This product may be unavailable or the link is incorrect."
          actionLabel="Browse all products"
          actionTo="/shop"
        />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const wishlisted = isWishlisted(product._id);

  const handleAddToCart = async () => {
    const res = await addItem(product, qty);
    if (res.success) {
      showToast(`${product.name} added to cart`, "success");
    } else {
      showToast(res.message || "Could not add item to cart", "error");
    }
  };

  const handleWishlist = async () => {
    const res = await toggle(product);
    if (!res.success) showToast(res.message, "info");
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { review } = await submitReview(product._id, reviewForm);
      setReviews((prev) => [review, ...prev]);
      setReviewForm({ rating: 5, title: "", comment: "" });
      showToast("Thanks for your review!", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-app py-8">
      <Breadcrumbs
        items={[
          { label: product.category?.name, to: `/category/${product.category?.slug}` },
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        {/* GALLERY */}
        <div>
          <motion.div
            key={activeImage}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="aspect-square overflow-hidden rounded-3xl bg-brand-50"
          >
            <img
              src={product.images?.[activeImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </motion.div>
          {product.images?.length > 1 && (
            <div className="mt-3 flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={img}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-16 overflow-hidden rounded-xl border-2 ${
                    activeImage === i ? "border-brand-600" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFO */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {product.category?.name}
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink-900">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <RatingStars rating={product.rating} showCount count={product.reviewCount} />
          </div>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-ink-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice > product.price && (
              <span className="text-sm text-ink-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className="text-sm text-ink-500">/ {product.quantity}</span>
          </div>
          <p className="mt-4 text-sm text-ink-700">{product.shortDescription}</p>

          {product.benefits?.length > 0 && (
            <ul className="mt-4 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {product.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-ink-700">
                  <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-600" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex items-center gap-3">
            <QuantitySelector value={qty} onChange={setQty} max={Math.max(product.stock, 1)} />
            <span className="text-xs text-ink-500">
              {outOfStock ? "Out of stock" : `${product.stock} in stock`}
            </span>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button onClick={handleAddToCart} disabled={outOfStock} className="btn-primary flex-1 disabled:opacity-50">
              <ShoppingBag size={16} /> {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="btn-outline flex-1 disabled:opacity-50"
            >
              Buy Now
            </button>
            <button
              onClick={handleWishlist}
              className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-full border border-slate-200 text-ink-700 transition hover:bg-brand-50"
              aria-label="Toggle wishlist"
            >
              <Heart size={18} className={wishlisted ? "fill-brand-600 text-brand-600" : ""} />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 rounded-2xl bg-brand-50/70 p-4 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-xs text-ink-700">
              <Truck size={16} className="text-brand-600" /> Free shipping above ₹999
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-700">
              <RefreshCcw size={16} className="text-brand-600" /> Easy returns
            </div>
            <div className="flex items-center gap-2 text-xs text-ink-700">
              <ShieldCheck size={16} className="text-brand-600" /> Secure checkout
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="mt-16">
        <div className="flex flex-wrap gap-2 border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-4 py-3 text-sm font-medium transition ${
                activeTab === tab ? "text-brand-700" : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-600"
                />
              )}
            </button>
          ))}
        </div>

        <div className="py-8">
          {activeTab === "Description" && (
            <p className="max-w-2xl text-sm leading-relaxed text-ink-700">{product.description}</p>
          )}

          {activeTab === "Ingredients / Info" && (
            <div className="max-w-2xl">
              {product.ingredients?.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {product.ingredients.map((ing) => (
                    <div key={ing.name} className="rounded-xl border border-slate-100 p-4">
                      <p className="text-sm font-semibold text-ink-900">{ing.name}</p>
                      <p className="mt-1 text-xs text-ink-500">{ing.benefit}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-500">
                  Detailed ingredient information for this product is not listed. See the product
                  packaging for full ingredient details.
                </p>
              )}
            </div>
          )}

          {activeTab === "How to Use" && (
            <p className="max-w-2xl text-sm leading-relaxed text-ink-700">
              {product.howToUse || "Usage instructions will be added soon."}
            </p>
          )}

          {activeTab === "Shipping & Returns" && (
            <div className="max-w-2xl space-y-3 text-sm text-ink-700">
              <p>
                Orders are typically processed within 1-2 business days. Free shipping applies on
                orders above ₹999; a flat shipping fee applies below that. See our{" "}
                <Link to="/shipping-policy" className="text-brand-700 underline">
                  Shipping Policy
                </Link>{" "}
                for full details.
              </p>
              <p>
                Unopened items can be returned within the window described in our{" "}
                <Link to="/return-refund-policy" className="text-brand-700 underline">
                  Return &amp; Refund Policy
                </Link>
                .
              </p>
            </div>
          )}

          {activeTab === "Reviews" && (
            <div className="max-w-2xl">
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="mb-8 rounded-2xl border border-slate-100 p-5">
                  <h4 className="font-display text-base text-ink-900">Write a Review</h4>
                  <div className="mt-3 flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        type="button"
                        key={n}
                        onClick={() => setReviewForm((f) => ({ ...f, rating: n }))}
                      >
                        <Star
                          size={22}
                          className={n <= reviewForm.rating ? "fill-brand-500 text-brand-500" : "text-slate-200"}
                        />
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Review title (optional)"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                    className="input-field mt-3"
                  />
                  <textarea
                    required
                    placeholder="Share your thoughts about this product…"
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    rows={3}
                    className="input-field mt-3"
                  />
                  <button type="submit" disabled={submitting} className="btn-primary mt-3">
                    {submitting ? "Submitting…" : "Submit Review"}
                  </button>
                </form>
              ) : (
                <p className="mb-8 text-sm text-ink-500">
                  <Link to="/login" className="text-brand-700 underline">
                    Log in
                  </Link>{" "}
                  to write a review.
                </p>
              )}

              {reviews.length === 0 ? (
                <p className="text-sm text-ink-500">No reviews yet. Be the first to share your thoughts.</p>
              ) : (
                <ul className="space-y-5">
                  {reviews.map((r) => (
                    <li key={r._id} className="border-b border-slate-100 pb-5">
                      <div className="flex items-center justify-between">
                        <RatingStars rating={r.rating} />
                        <span className="text-xs text-ink-500">{formatDate(r.createdAt)}</span>
                      </div>
                      {r.title && <p className="mt-2 text-sm font-semibold text-ink-900">{r.title}</p>}
                      <p className="mt-1 text-sm text-ink-700">{r.comment}</p>
                      <p className="mt-2 text-xs text-ink-500">
                        {r.name}
                        {r.verifiedPurchase && " · Verified Purchase"}
                        {r.isDemo && " · Demo review"}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-2xl text-ink-900">You Might Also Like</h3>
          <div className="mt-6">
            <ProductGrid products={related} loading={false} columns="sm:grid-cols-2 lg:grid-cols-4" />
          </div>
        </div>
      )}
    </div>
  );
}
