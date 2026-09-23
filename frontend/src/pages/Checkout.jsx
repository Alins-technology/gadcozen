import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, Truck, ClipboardList, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { useStoreConfig } from "../context/StoreConfigContext.jsx";
import {
  createOrder,
  verifyOrderPayment,
  reportPaymentCancelled,
} from "../services/orderService.js";
import { fetchAddresses } from "../services/userService.js";
import { getErrorMessage } from "../services/api.js";
import { formatPrice } from "../utils/format.js";
import { loadRazorpay } from "../utils/loadRazorpay.js";
import EmptyState from "../components/EmptyState.jsx";
import { imgProps } from "../utils/image.js";
import useSeo from "../hooks/useSeo.js";

const steps = ["Contact", "Shipping", "Review", "Payment"];

const PHONE_PATTERN = "(\\+?91[\\s-]?)?[6-9][0-9]{9}";
const PIN_PATTERN = "[1-9][0-9]{5}";

const paymentOptions = {
  razorpay: {
    icon: CreditCard,
    title: "Pay Online",
    description: "UPI, cards, net banking & wallets — secured by Razorpay.",
  },
  mock_online: {
    icon: CreditCard,
    title: "Pay Online (test mode)",
    description: "Development only — simulates a successful payment, no money moves.",
  },
  cod: {
    icon: Truck,
    title: "Cash on Delivery",
    description: "Pay in cash when your order arrives.",
  },
};

const pickAddressFields = (a) => ({
  fullName: a.fullName || "",
  phone: a.phone || "",
  line1: a.line1 || "",
  line2: a.line2 || "",
  city: a.city || "",
  state: a.state || "",
  postalCode: a.postalCode || "",
  country: a.country || "India",
});

export default function Checkout() {
  useSeo({ title: "Checkout", noindex: true });
  const { cart, refreshServerCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const storeConfig = useStoreConfig();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [contact, setContact] = useState({ email: user?.email || "" });
  const [savedAddresses, setSavedAddresses] = useState([]);
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
  const availableMethods = storeConfig.paymentMethods.filter((m) => paymentOptions[m]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const selectedMethod = availableMethods.includes(paymentMethod) ? paymentMethod : availableMethods[0];

  useEffect(() => {
    fetchAddresses()
      .then(({ addresses }) => {
        setSavedAddresses(addresses || []);
        const preferred = addresses?.find((a) => a.isDefault) || addresses?.[0];
        if (preferred) setShipping(pickAddressFields(preferred));
      })
      .catch(() => {});
  }, []);

  const items = cart.items || [];
  const codFee = selectedMethod === "cod" ? storeConfig.codFee || 0 : 0;
  const payable = (cart.total || 0) + codFee;

  if (items.length === 0 && !placing) {
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

  const finish = async (order) => {
    navigate(`/order-confirmation/${order.orderNumber}`, { replace: true });
    await refreshServerCart().catch(() => {});
  };

  const payWithRazorpay = async (order, razorpay) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      await reportPaymentCancelled(order._id).catch(() => {});
      throw new Error("Could not load the payment window. Check your connection and try again.");
    }

    return new Promise((resolve) => {
      const rzp = new window.Razorpay({
        key: razorpay.keyId,
        amount: razorpay.amount,
        currency: razorpay.currency,
        order_id: razorpay.orderId,
        name: "GADCO ZEN",
        description: `Order ${order.orderNumber}`,
        image: "/images/brand/logo.png",
        prefill: {
          name: shipping.fullName,
          email: contact.email,
          contact: shipping.phone,
        },
        notes: { orderNumber: order.orderNumber },
        theme: { color: "#037D8F" },
        handler: async (response) => {
          try {
            const { order: paid } = await verifyOrderPayment(order._id, response);
            showToast("Payment successful — order placed!", "success");
            await finish(paid);
          } catch (err) {
            // The webhook will still confirm a genuine payment; send the
            // customer to the order page where the final status shows up.
            showToast(getErrorMessage(err), "error");
            navigate(`/account/orders/${order.orderNumber}`, { replace: true });
          }
          resolve();
        },
        modal: {
          ondismiss: async () => {
            try {
              const { order: latest } = await reportPaymentCancelled(order._id);
              if (latest?.paymentStatus === "paid") {
                await finish(latest);
              } else {
                showToast("Payment was cancelled. Your cart is still saved.", "info");
              }
            } catch {
              showToast("Payment was cancelled.", "info");
            }
            resolve();
          },
        },
      });
      rzp.open();
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedMethod) {
      showToast("No payment method is available right now. Please contact us.", "error");
      return;
    }
    setPlacing(true);
    try {
      const { order, razorpay } = await createOrder({
        shippingAddress: shipping,
        contactEmail: contact.email,
        paymentMethod: selectedMethod,
      });
      if (razorpay) {
        await payWithRazorpay(order, razorpay);
      } else {
        showToast("Order placed successfully!", "success");
        await finish(order);
      }
    } catch (err) {
      showToast(err?.response ? getErrorMessage(err) : err.message, "error");
      await refreshServerCart().catch(() => {});
    } finally {
      setPlacing(false);
    }
  };

  const setField = (field) => (e) => setShipping((s) => ({ ...s, [field]: e.target.value }));

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
                <p className="text-xs text-ink-500">Your order confirmation will be sent here.</p>
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

                {savedAddresses.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {savedAddresses.map((a) => (
                      <button
                        key={a._id}
                        type="button"
                        onClick={() => setShipping(pickAddressFields(a))}
                        className="rounded-full border border-slate-200 px-3 py-1.5 text-xs text-ink-700 transition hover:border-brand-600 hover:text-brand-700"
                      >
                        Use {a.label || "saved"}: {a.line1}, {a.city}
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    required
                    placeholder="Full name"
                    value={shipping.fullName}
                    onChange={setField("fullName")}
                    className="input-field"
                    autoComplete="name"
                  />
                  <input
                    required
                    type="tel"
                    inputMode="tel"
                    pattern={PHONE_PATTERN}
                    title="10-digit Indian mobile number"
                    placeholder="Mobile number"
                    value={shipping.phone}
                    onChange={setField("phone")}
                    className="input-field"
                    autoComplete="tel"
                  />
                </div>
                <input
                  required
                  placeholder="House / flat no., building, street"
                  value={shipping.line1}
                  onChange={setField("line1")}
                  className="input-field"
                  autoComplete="address-line1"
                />
                <input
                  placeholder="Area, landmark (optional)"
                  value={shipping.line2}
                  onChange={setField("line2")}
                  className="input-field"
                  autoComplete="address-line2"
                />
                <div className="grid gap-4 sm:grid-cols-3">
                  <input
                    required
                    placeholder="City"
                    value={shipping.city}
                    onChange={setField("city")}
                    className="input-field"
                    autoComplete="address-level2"
                  />
                  <input
                    required
                    placeholder="State"
                    value={shipping.state}
                    onChange={setField("state")}
                    className="input-field"
                    autoComplete="address-level1"
                  />
                  <input
                    required
                    inputMode="numeric"
                    pattern={PIN_PATTERN}
                    maxLength={6}
                    title="6-digit PIN code"
                    placeholder="PIN code"
                    value={shipping.postalCode}
                    onChange={setField("postalCode")}
                    className="input-field"
                    autoComplete="postal-code"
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
                        {...imgProps(item.product.images?.[0], 200)}
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
                  <p>
                    {contact.email} · {shipping.phone}
                  </p>
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
                {availableMethods.length === 0 ? (
                  <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                    Online checkout is temporarily unavailable. Please contact us to place your order.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {availableMethods.map((method) => {
                      const option = paymentOptions[method];
                      const Icon = option.icon;
                      return (
                        <label
                          key={method}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${
                            selectedMethod === method ? "border-brand-600 bg-brand-50/60" : "border-slate-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={selectedMethod === method}
                            onChange={() => setPaymentMethod(method)}
                            className="accent-brand-600"
                          />
                          <Icon size={18} className="text-brand-600" />
                          <div>
                            <p className="text-sm font-medium text-ink-900">{option.title}</p>
                            <p className="text-xs text-ink-500">
                              {option.description}
                              {method === "cod" && storeConfig.codFee > 0 &&
                                ` A ${formatPrice(storeConfig.codFee)} COD fee applies.`}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
                <p className="flex items-center gap-1.5 text-xs text-ink-500">
                  <ShieldCheck size={14} className="text-brand-600" />
                  By placing this order you agree to our{" "}
                  <Link to="/terms-and-conditions" className="underline">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link to="/return-refund-policy" className="underline">
                    Return Policy
                  </Link>
                  .
                </p>
                <div className="flex gap-3">
                  <button onClick={prevStep} disabled={placing} className="btn-outline">
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing || !selectedMethod}
                    className="btn-primary disabled:opacity-60"
                  >
                    {placing
                      ? "Processing…"
                      : selectedMethod === "razorpay"
                      ? `Pay ${formatPrice(payable)}`
                      : `Place Order — ${formatPrice(payable)}`}
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
                <span>Discount{cart.coupon?.code ? ` (${cart.coupon.code})` : ""}</span>
                <span>-{formatPrice(cart.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-700">
              <span>Shipping</span>
              <span>{cart.shippingCost === 0 ? "Free" : formatPrice(cart.shippingCost)}</span>
            </div>
            {codFee > 0 && (
              <div className="flex justify-between text-ink-700">
                <span>COD fee</span>
                <span>{formatPrice(codFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-slate-100 pt-2 text-base font-semibold text-ink-900">
              <span>Total</span>
              <span>{formatPrice(payable)}</span>
            </div>
            <p className="text-[11px] text-ink-500">Prices are inclusive of all taxes.</p>
          </div>
          <Link to="/cart" className="mt-4 block text-center text-xs text-ink-500 hover:underline">
            Edit cart
          </Link>
        </div>
      </div>
    </div>
  );
}
