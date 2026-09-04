import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Truck, ClipboardList } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { createOrder } from "../services/orderService.js";
import { getErrorMessage } from "../services/api.js";
import { formatPrice } from "../utils/format.js";
import EmptyState from "../components/EmptyState.jsx";
import { ShoppingBag } from "lucide-react";

const steps = ["Contact", "Shipping", "Review", "Payment"];

export default function Checkout() {
  const { cart, clear } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [contact, setContact] = useState({ email: user?.email || "" });
  const [shipping, setShipping] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("mock_online");

  useEffect(() => {
    document.title = "Checkout | GADCO ZEN";
  }, []);

  const items = cart.items || [];

  if (items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add items to your cart before checking out."
          actionLabel="Shop Now"
          actionTo="/shop"
        />
      </div>
    );
  }

  const nextStep = (e) => {
    e?.preventDefault();
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const { order } = await createOrder({
        shippingAddress: shipping,
        contactEmail: contact.email,
        paymentMethod,
      });
      await clear();
      showToast("Order placed successfully!", "success");
      navigate(`/order-confirmation/${order.orderNumber}`);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="container-app py-10">
      <h1 className="font-display text-3xl text-ink-900">Checkout</h1>

      {/* Stepper */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i < step
                  ? "bg-brand-600 text-white"
                  : i === step
                  ? "bg-brand-100 text-brand-700 ring-2 ring-brand-600"
                  : "bg-slate-100 text-ink-500"
              }`}
            >
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={`whitespace-nowrap text-sm ${i === step ? "font-semibold text-ink-900" : "text-ink-500"}`}>
              {s}
            </span>
            {i < steps.length - 1 && <div className="h-px w-6 bg-slate-200 sm:w-10" />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-slate-100 p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.form
                key="contact"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                onSubmit={nextStep}
                className="space-y-4"
              >
                <h3 className="font-display text-lg text-ink-900">Contact Information</h3>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={contact.email}
                  onChange={(e) => setContact({ email: e.target.value })}
                  className="input-field"
                />
                <button type="submit" className="btn-primary">
                  Continue to Shipping
                </button>
              </motion.form>
            )}

            {step === 1 && (
              <motion.form
                key="shipping"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                onSubmit={nextStep}
                className="space-y-4"
              >
                <h3 className="font-display text-lg text-ink-900">Shipping Address</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    required
                    placeholder="Full name"
                    value={shipping.fullName}
                    onChange={(e) => setShipping((s) => ({ ...s, fullName: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    required
                    placeholder="Phone number"
                    value={shipping.phone}
                    onChange={(e) => setShipping((s) => ({ ...s, phone: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <input
                  required
                  placeholder="Address line 1"
                  value={shipping.line1}
                  onChange={(e) => setShipping((s) => ({ ...s, line1: e.target.value }))}
                  className="input-field"
                />
                <input
                  placeholder="Address line 2 (optional)"
                  value={shipping.line2}
                  onChange={(e) => setShipping((s) => ({ ...s, line2: e.target.value }))}
                  className="input-field"
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <input
                    required
                    placeholder="City"
                    value={shipping.city}
                    onChange={(e) => setShipping((s) => ({ ...s, city: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    required
                    placeholder="State"
                    value={shipping.state}
                    onChange={(e) => setShipping((s) => ({ ...s, state: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    required
                    placeholder="Postal code"
                    value={shipping.postalCode}
                    onChange={(e) => setShipping((s) => ({ ...s, postalCode: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={prevStep} className="btn-outline">
                    Back
                  </button>
                  <button type="submit" className="btn-primary">
                    Continue to Review
                  </button>
                </div>
              </motion.form>
            )}

            {step === 2 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-5"
              >
                <h3 className="font-display text-lg text-ink-900">Order Summary</h3>
                <ul className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <li key={item.product._id} className="flex items-center gap-3 py-3">
                      <img
                        src={item.product.images?.[0]}
                        alt={item.product.name}
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-ink-900">{item.product.name}</p>
                        <p className="text-xs text-ink-500">Qty {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-ink-900">
                        {formatPrice(item.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl bg-brand-50/70 p-4 text-sm text-ink-700">
                  <p className="flex items-center gap-2 font-medium text-ink-900">
                    <ClipboardList size={15} /> Shipping to
                  </p>
                  <p className="mt-1">
                    {shipping.fullName}, {shipping.line1} {shipping.line2}, {shipping.city},{" "}
                    {shipping.state} {shipping.postalCode}
                  </p>
                  <p>{contact.email} · {shipping.phone}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={prevStep} className="btn-outline">
                    Back
                  </button>
                  <button onClick={nextStep} className="btn-primary">
                    Continue to Payment
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                className="space-y-5"
              >
                <h3 className="font-display text-lg text-ink-900">Payment</h3>
                <div className="space-y-3">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                      paymentMethod === "mock_online" ? "border-brand-600 bg-brand-50/60" : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === "mock_online"}
                      onChange={() => setPaymentMethod("mock_online")}
                      className="accent-brand-600"
                    />
                    <CreditCard size={18} className="text-brand-600" />
                    <div>
                      <p className="text-sm font-medium text-ink-900">Pay Online (Demo)</p>
                      <p className="text-xs text-ink-500">
                        A simulated payment flow — no real transaction occurs.
                      </p>
                    </div>
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                      paymentMethod === "cod" ? "border-brand-600 bg-brand-50/60" : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="accent-brand-600"
                    />
                    <Truck size={18} className="text-brand-600" />
                    <div>
                      <p className="text-sm font-medium text-ink-900">Cash on Delivery</p>
                      <p className="text-xs text-ink-500">Pay when your order arrives.</p>
                    </div>
                  </label>
                </div>
                <p className="text-xs text-ink-500">
                  This is a demo checkout flow. Integrating a real payment gateway (e.g. Razorpay or
                  Stripe) can be added behind this step without changing the order architecture.
                </p>
                <div className="flex gap-3">
                  <button onClick={prevStep} className="btn-outline">
                    Back
                  </button>
                  <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary">
                    {placing ? "Placing Order…" : `Place Order — ${formatPrice(cart.total)}`}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-fit rounded-2xl border border-slate-100 p-6">
          <h3 className="font-display text-lg text-ink-900">Total</h3>
          <div className="mt-4 space-y-2 text-sm">
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
          <Link to="/cart" className="mt-4 block text-center text-xs text-ink-500 hover:underline">
            Edit cart
          </Link>
        </div>
      </div>
    </div>
  );
}
