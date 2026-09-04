import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import Modal from "./Modal.jsx";
import QuantitySelector from "./QuantitySelector.jsx";
import RatingStars from "./RatingStars.jsx";
import { formatPrice } from "../utils/format.js";
import { useCart } from "../context/CartContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function QuickViewModal({ product, open, onClose }) {
  const [qty, setQty] = useState(1);
  const { addItem } = useCart();
  const { showToast } = useToast();

  if (!product) return null;
  const outOfStock = product.stock <= 0;

  const handleAdd = async () => {
    const res = await addItem(product, qty);
    if (res.success) {
      showToast(`${product.name} added to cart`, "success");
      onClose();
    } else {
      showToast(res.message || "Could not add item to cart", "error");
    }
  };

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-2xl">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-brand-50">
          <img src={product.images?.[0]} alt={product.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-600">
            {product.category?.name}
          </p>
          <h3 className="mt-1 font-display text-2xl text-ink-900">{product.name}</h3>
          <div className="mt-2">
            <RatingStars rating={product.rating} showCount count={product.reviewCount} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-semibold text-ink-900">{formatPrice(product.price)}</span>
            {product.compareAtPrice > product.price && (
              <span className="text-sm text-ink-500 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
            <span className="text-xs text-ink-500">/ {product.quantity}</span>
          </div>
          <p className="mt-3 text-sm text-ink-700">{product.shortDescription}</p>

          <div className="mt-5 flex items-center gap-3">
            <QuantitySelector value={qty} onChange={setQty} max={Math.max(product.stock, 1)} />
            <button
              onClick={handleAdd}
              disabled={outOfStock}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              <ShoppingBag size={16} />
              {outOfStock ? "Out of Stock" : "Add to Cart"}
            </button>
          </div>
          <Link
            to={`/product/${product.slug}`}
            onClick={onClose}
            className="mt-4 text-center text-sm font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            View full details
          </Link>
        </div>
      </div>
    </Modal>
  );
}
