import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Trash2, Tag, ArrowRight } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import QuantitySelector from "../components/QuantitySelector.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { formatPrice } from "../utils/format.js";

export default function Cart() {
  const { cart, updateItem, removeItem, applyCoupon, removeCoupon } = useCart();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [applying, setApplying] = useState(false);

  const items = cart.items || [];

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setApplying(true);
    const res = await applyCoupon(couponCode.trim());
    if (res.success) {
      showToast("Coupon applied!", "success");
      setCouponCode("");
    } else {
      showToast(res.message, "error");
    }
    setApplying(false);
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/checkout" } } });
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="container-app py-10">
      <Breadcrumbs items={[{ label: "Cart" }]} />
      <h1 className="mt-3 font-display text-3xl text-ink-900">Your Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Looks like you haven't added anything yet."
          actionLabel="Shop Now"
          actionTo="/shop"
        />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.product._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 rounded-2xl border border-slate-100 p-4"
              >
                <Link to={`/product/${item.product.slug}`} className="flex-shrink-0">
                  <img
                    src={item.product.images?.[0]}
                    alt={item.product.name}
                    className="h-24 w-24 rounded-xl object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-display text-base text-ink-900 hover:text-brand-700"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-ink-500">{item.product.quantity}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="text-ink-500 hover:text-red-500"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantitySelector
                      value={item.quantity}
                      onChange={(q) => updateItem(item.product._id, q)}
                      max={item.product.stock}
                    />
                    <span className="text-base font-semibold text-ink-900">
                      {formatPrice(item.lineTotal)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            <Link to="/shop" className="inline-block text-sm font-medium text-brand-700 hover:underline">
              &larr; Continue Shopping
            </Link>
          </div>

          <div className="h-fit rounded-2xl border border-slate-100 p-6">
            <h3 className="font-display text-lg text-ink-900">Order Summary</h3>

            <form onSubmit={handleApplyCoupon} className="mt-4 flex gap-2">
              <div className="relative flex-1">
                <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="input-field !pl-9 !py-2 text-sm uppercase"
                />
              </div>
              <button type="submit" disabled={applying} className="btn-outline !py-2 text-sm">
                Apply
              </button>
            </form>
            {cart.coupon?.code && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
                <span>
                  Code <strong>{cart.coupon.code}</strong> applied
                </span>
                <button onClick={removeCoupon} className="underline">
                  Remove
                </button>
              </div>
            )}

            <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between text-ink-700">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-brand-700">
                  <span>Discount</span>
                  <span>-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-ink-700">
                <span>Shipping</span>
                <span>{cart.shippingCost === 0 ? "Free" : formatPrice(cart.shippingCost)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-ink-900">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>

            <button onClick={handleCheckout} className="btn-primary mt-5 w-full">
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            {!isAuthenticated && (
              <p className="mt-2 text-center text-xs text-ink-500">
                You'll be asked to log in or create an account to check out.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
