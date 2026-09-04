import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "../utils/format.js";
import { useCart } from "../context/CartContext.jsx";
import { useWishlist } from "../context/WishlistContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import RatingStars from "./RatingStars.jsx";
import QuickViewModal from "./QuickViewModal.jsx";

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const wishlisted = isWishlisted(product._id);
  const outOfStock = product.stock <= 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock || adding) return;
    setAdding(true);
    try {
      const res = await addItem(product, 1);
      if (res.success) {
        showToast(`${product.name} added to cart`, "success");
      } else {
        showToast(res.message || "Could not add item to cart", "error");
      }
    } catch {
      showToast("Could not add item to cart", "error");
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await toggle(product);
    if (!res.success) showToast(res.message, "info");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3), ease: "easeOut" }}
        className="group relative"
      >
        <Link to={`/product/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-brand-50/70">
            {product.compareAtPrice > product.price && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-medium text-white">
                {Math.round(100 - (product.price / product.compareAtPrice) * 100)}% OFF
              </span>
            )}
            <button
              onClick={handleWishlist}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink-700 shadow-sm transition hover:scale-105 active:scale-95"
              aria-label="Toggle wishlist"
            >
              <Heart size={15} className={wishlisted ? "fill-brand-600 text-brand-600" : "text-ink-700"} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 translate-y-3 items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-medium text-ink-900 opacity-0 shadow-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <Eye size={13} /> Quick View
            </button>
            <img
              src={product.images?.[0]}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            />
          </div>

          <div className="mt-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-brand-600">
              {product.category?.name}
            </p>
            <h3 className="mt-0.5 line-clamp-1 font-display text-[15px] leading-snug text-ink-900">
              {product.name}
            </h3>
            <div className="mt-1">
              <RatingStars rating={product.rating} showCount count={product.reviewCount} size={12} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[15px] font-semibold text-ink-900">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice > product.price && (
                  <span className="text-xs text-ink-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </span>
                )}
              </div>
              <button
                onClick={handleAddToCart}
                disabled={outOfStock || adding}
                aria-label="Add to cart"
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700 active:scale-95 disabled:opacity-40"
              >
                <ShoppingCart size={14} />
              </button>
            </div>
          </div>
        </Link>
      </motion.div>
      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
