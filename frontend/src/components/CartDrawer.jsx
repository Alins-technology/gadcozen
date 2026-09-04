import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { X, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { formatPrice } from "../utils/format.js";
import QuantitySelector from "./QuantitySelector.jsx";
import EmptyState from "./EmptyState.jsx";

export default function CartDrawer({ open, onClose }) {
  const { cart, updateItem, removeItem } = useCart();
  const items = cart.items || [];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[92]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-card"
          >
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <h3 className="font-display text-lg text-ink-900">
                Your Cart {items.length > 0 && `(${cart.itemCount})`}
              </h3>
              <button onClick={onClose} className="rounded-full p-1.5 hover:bg-brand-50" aria-label="Close cart">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is empty"
                  message="Add a few GADCO ZEN essentials to get started."
                  actionLabel="Shop Now"
                  actionTo="/shop"
                />
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.product._id} className="flex gap-3">
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="h-20 w-20 flex-shrink-0 rounded-xl object-cover"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/product/${item.product.slug}`}
                            onClick={onClose}
                            className="line-clamp-2 text-sm font-medium text-ink-900 hover:text-brand-700"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.product._id)}
                            className="flex-shrink-0 text-ink-500 hover:text-red-500"
                            aria-label="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <p className="text-xs text-ink-500">{item.product.quantity}</p>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <QuantitySelector
                            size="sm"
                            value={item.quantity}
                            onChange={(q) => updateItem(item.product._id, q)}
                            max={item.product.stock}
                          />
                          <span className="text-sm font-semibold text-ink-900">
                            {formatPrice(item.lineTotal)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-100 p-5">
                <div className="flex items-center justify-between text-sm text-ink-700">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink-900">{formatPrice(cart.subtotal)}</span>
                </div>
                <p className="mt-1 text-xs text-ink-500">Shipping and discounts calculated at checkout.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <Link to="/cart" onClick={onClose} className="btn-outline w-full">
                    View Cart
                  </Link>
                  <Link to="/checkout" onClick={onClose} className="btn-primary w-full">
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
