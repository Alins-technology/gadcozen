import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgePercent,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Hospital,
  MessageCircle,
  Minus,
  PackageCheck,
  Phone,
  Pill,
  Plus,
  Send,
  Stethoscope,
  Trash2,
  Truck,
} from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import { fetchProducts } from "../services/productService.js";
import { submitBulkEnquiry } from "../services/bulkEnquiryService.js";
import { useToast } from "../context/ToastContext.jsx";
import siteConfig from "../config/siteConfig.js";
import { formatPrice, bulkPrice } from "../utils/format.js";
import { useStoreConfig } from "../context/StoreConfigContext.jsx";
import { imgProps } from "../utils/image.js";
import useSeo from "../hooks/useSeo.js";

const MEDICAL_SLUG = "medical-supplies";
const DEFAULT_QTY = 10;

const businessTypes = [
  "Clinic",
  "Hospital / Nursing Home",
  "Pharmacy / Chemist",
  "Diagnostic Lab",
  "Dental / Skin Clinic",
  "Salon / Spa",
  "Distributor / Reseller",
  "Corporate / Institution",
  "Individual",
  "Other",
];

const audiences = [
  { icon: Stethoscope, label: "Clinics" },
  { icon: Hospital, label: "Hospitals & Nursing Homes" },
  { icon: Pill, label: "Pharmacies" },
  { icon: Building2, label: "Labs & Institutions" },
];

const perks = [
  { icon: BadgePercent, title: null, text: "On every product, straight off the retail price." },
  { icon: FileText, title: "GST Invoice", text: "Proper tax invoice for input credit." },
  { icon: Truck, title: "Pan-India Delivery", text: "Shipped to your clinic's doorstep." },
  { icon: PackageCheck, title: "Sealed, Genuine Stock", text: "Original packs, within expiry." },
];

const steps = [
  { icon: ClipboardList, title: "Pick products", text: "Add products and the number of packs you need." },
  { icon: Send, title: "Send your request", text: "Share your clinic details — takes under a minute." },
  { icon: FileText, title: "Get a quote", text: `We reply ${siteConfig.bulkOrders.responseTime}.` },
  { icon: Truck, title: "Confirm & receive", text: "Approve the quote and we dispatch the order." },
];

const faqs = (off) => [
  {
    q: "How much discount do I get on a bulk order?",
    a: `A flat ${off}% off the retail price of every product. You can see each product's bulk price and your estimated total in the form below before you send the request.`,
  },
  {
    q: "What is the minimum quantity for bulk pricing?",
    a: `${siteConfig.bulkOrders.minimumOrderNote}. For smaller quantities you can order directly from the shop.`,
  },
  {
    q: "Can I mix different products in one bulk order?",
    a: "Yes. Add as many products as you like to a single request — syringes, caps, masks and our skincare range.",
  },
  {
    q: "Will I get a GST invoice?",
    a: "Yes, every bulk order comes with a GST invoice. Add your GSTIN in the form so it appears on the invoice.",
  },
  {
    q: "How is a bulk order paid and delivered?",
    a: "Once you approve the quote, we share payment details and dispatch through our courier partner. Delivery time depends on your location and quantity.",
  },
];

const initialForm = {
  name: "",
  organization: "",
  businessType: "",
  email: "",
  phone: "",
  city: "",
  gstin: "",
  message: "",
};

const errorText = (err) =>
  err?.response?.data?.errors?.[0]?.message ||
  err?.response?.data?.message ||
  "Could not send your request. Please try again or call us.";

export default function BulkOrders() {
  useSeo({
    title: "Bulk Orders for Clinics, Hospitals & Pharmacies",
    description:
      "Buy syringes, surgical caps, 3-ply face masks and GADCO ZEN skincare in bulk. Flat 20% off, GST invoice and pan-India delivery. Get a quote in 1 business day.",
  });

  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [items, setItems] = useState({}); // productId -> quantity
  const [otherItem, setOtherItem] = useState("");
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const { showToast } = useToast();
  const { bulkDiscountPercent: off } = useStoreConfig();
  const bulk = (price) => bulkPrice(price, off);

  useEffect(() => {
    fetchProducts({ limit: 60, sort: "featured" })
      .then((data) => {
        // Keep the catalogue order from the API (GADCO ZEN range first,
        // then Medical Supplies in the order they were added).
        const list = data.products;
        setProducts(list);
        const preselect = searchParams.get("product");
        if (preselect && list.some((p) => p._id === preselect)) {
          setItems({ [preselect]: DEFAULT_QTY });
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const medical = useMemo(() => products.filter((p) => p.category?.slug === MEDICAL_SLUG), [products]);
  const others = useMemo(() => products.filter((p) => p.category?.slug !== MEDICAL_SLUG), [products]);
  const selected = products.filter((p) => items[p._id]);
  const retailTotal = selected.reduce((sum, p) => sum + p.price * items[p._id], 0);
  const bulkTotal = selected.reduce((sum, p) => sum + bulk(p.price) * items[p._id], 0);

  const setQty = (id, qty) =>
    setItems((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, 100000);
      return next;
    });

  const toggle = (id) => setQty(id, items[id] ? 0 : DEFAULT_QTY);

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payloadItems = selected.map((p) => ({ product: p._id, productName: p.name, quantity: items[p._id] }));
    if (otherItem.trim()) payloadItems.push({ productName: otherItem.trim(), quantity: 1 });
    if (payloadItems.length === 0) {
      showToast("Please select at least one product.", "error");
      document.getElementById("bulk-products")?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    setSending(true);
    try {
      await submitBulkEnquiry({ ...form, items: payloadItems });
      setDone(true);
      setItems({});
      setOtherItem("");
      setForm(initialForm);
      document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      showToast(errorText(err), "error");
    } finally {
      setSending(false);
    }
  };

  const phoneHref = `tel:${siteConfig.bulkOrders.phone.replace(/\s/g, "")}`;
  const whatsappHref = siteConfig.bulkOrders.whatsapp
    ? `https://wa.me/${siteConfig.bulkOrders.whatsapp}?text=${encodeURIComponent(
        "Hi, I'd like a quote for a bulk order from GADCO ZEN."
      )}`
    : "";

  // Plain render function (not a nested component) so the quantity input keeps
  // focus while typing.
  const renderRow = (product) => {
    const qty = items[product._id];
    const active = Boolean(qty);
    return (
      <div
        key={product._id}
        className={`flex items-center gap-3 rounded-2xl border p-3 transition ${
          active ? "border-brand-500 bg-brand-50/70 shadow-soft" : "border-slate-100 bg-white hover:border-brand-200"
        }`}
      >
        <button type="button" onClick={() => toggle(product._id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <img
            {...imgProps(product.images?.[0], 200)}
            alt=""
            loading="lazy"
            className="h-14 w-14 flex-shrink-0 rounded-xl bg-brand-50 object-cover"
          />
          <span className="min-w-0">
            <span className="line-clamp-2 text-sm font-medium text-ink-900">{product.name}</span>
            <span className="mt-1 flex flex-wrap items-baseline gap-x-2 text-xs text-ink-500">
              <span>{product.quantity}</span>
              <span className="font-semibold text-brand-700">Bulk {formatPrice(bulk(product.price))}</span>
              <span className="line-through">{formatPrice(product.price)}</span>
              {off > 0 && (
                <span className="rounded-full bg-green-50 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                  {off}% OFF
                </span>
              )}
            </span>
          </span>
        </button>
        {active ? (
          <div className="flex flex-shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => setQty(product._id, qty - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-ink-700 hover:bg-brand-50"
              aria-label="Decrease packs"
            >
              <Minus size={14} />
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(product._id, Math.floor(Number(e.target.value) || 0))}
              className="h-8 w-16 rounded-lg border border-slate-200 text-center text-sm outline-none focus:border-brand-500"
              aria-label="Number of packs"
            />
            <button
              type="button"
              onClick={() => setQty(product._id, qty + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-ink-700 hover:bg-brand-50"
              aria-label="Increase packs"
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => toggle(product._id)}
            className="flex-shrink-0 rounded-full border border-brand-600 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            Add
          </button>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="container-app relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-600">Bulk &amp; Wholesale Orders</p>
              {off > 0 && (
                <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white shadow-soft">
                  FLAT {off}% OFF
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] text-ink-900 sm:text-5xl">
              From 10 packs to 10,000. Supply your clinic with us.
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink-700">
              Syringes, surgical caps, face masks and GADCO ZEN skincare at{" "}
              <strong className="text-ink-900">flat {off}% off retail price</strong> for clinics, hospitals, pharmacies and institutions. Powered by{" "}
              <a href={siteConfig.poweredBy.url} target="_blank" rel="noreferrer" className="font-semibold text-brand-700 hover:underline">
                {siteConfig.poweredBy.name}
              </a>
              .
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {audiences.map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ink-700 shadow-sm ring-1 ring-brand-100">
                  <Icon size={13} className="text-brand-600" /> {label}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#quote" className="btn-primary">
                Get a Quote <ArrowRight size={16} />
              </a>
              <a href={phoneHref} className="btn-outline">
                <Phone size={16} /> Call Now
              </a>
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-ghost">
                  <MessageCircle size={16} /> WhatsApp
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              "/images/products/insulin-syringe-1ml/insulin-syringe-1ml.png",
              "/images/products/hi-tech-syringe-2ml/hi-tech-syringe-2ml.png",
              "/images/products/disposable-surgical-cap/disposable-surgical-cap.png",
              "/images/products/jcm-3-ply-face-mask/jcm-3-ply-face-mask.png",
            ].map((src, i) => (
              <div key={src} className={`overflow-hidden rounded-3xl border-4 border-white shadow-card ${i % 2 ? "translate-y-6" : ""}`}>
                <img {...imgProps(src, 600)} alt="" className="aspect-square w-full object-cover" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PERKS */}
      <section className="border-y border-brand-100 bg-white py-10">
        <div className="container-app grid grid-cols-2 gap-6 lg:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-start sm:text-left">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <p.icon size={20} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink-900">{p.title || `Flat ${off}% Off`}</p>
                <p className="text-xs text-ink-500">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-app py-16">
        <SectionHeading eyebrow="Simple process" title="How bulk ordering works" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
              <span className="absolute right-5 top-4 font-display text-3xl text-brand-100">0{i + 1}</span>
              <s.icon size={22} className="text-brand-600" />
              <p className="mt-4 text-sm font-semibold text-ink-900">{s.title}</p>
              <p className="mt-1 text-sm text-ink-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* QUOTE FORM */}
      <section id="quote" className="scroll-mt-24 bg-brand-50/50 py-16">
        <div className="container-app">
          <SectionHeading
            eyebrow="Request a quote"
            title="Tell us what you need"
            description={`${siteConfig.bulkOrders.minimumOrderNote}. Select products, enter the number of packs and we'll send you a quote ${siteConfig.bulkOrders.responseTime}.`}
          />

          {done ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-10 max-w-lg rounded-3xl bg-white p-10 text-center shadow-card"
            >
              <CheckCircle2 size={48} className="mx-auto text-brand-600" />
              <h3 className="mt-4 font-display text-2xl text-ink-900">Request received!</h3>
              <p className="mt-2 text-sm text-ink-700">
                Thank you — our team will contact you {siteConfig.bulkOrders.responseTime} with a
                quote. A copy of your request has been sent to your email.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button onClick={() => setDone(false)} className="btn-outline">
                  Send another request
                </button>
                <Link to="/shop" className="btn-primary">
                  Continue shopping
                </Link>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
              {/* products */}
              <div id="bulk-products" className="scroll-mt-24 rounded-3xl bg-white p-5 shadow-soft sm:p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg text-ink-900">1. Select products</h3>
                  {selected.length > 0 && (
                    <button type="button" onClick={() => setItems({})} className="flex items-center gap-1 text-xs text-ink-500 hover:text-red-600">
                      <Trash2 size={13} /> Clear ({selected.length})
                    </button>
                  )}
                </div>

                {loadingProducts ? (
                  <div className="mt-4 space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="skeleton h-20 rounded-2xl" />
                    ))}
                  </div>
                ) : (
                  <>
                    {others.length > 0 && (
                      <>
                        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-brand-600">GADCO ZEN Skincare &amp; Hair Care</p>
                        <div className="mt-2 space-y-2.5">
                          {others.map(renderRow)}
                        </div>
                      </>
                    )}
                    {medical.length > 0 && (
                      <>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-brand-600">Medical Supplies</p>
                        <div className="mt-2 space-y-2.5">
                          {medical.map(renderRow)}
                        </div>
                      </>
                    )}
                  </>
                )}

                <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-brand-600">
                  Need something else?
                </label>
                <input
                  value={otherItem}
                  onChange={(e) => setOtherItem(e.target.value)}
                  maxLength={200}
                  placeholder="e.g. 5 ml syringes – 20 boxes, cotton rolls, IV cannula…"
                  className="input-field mt-2"
                />
              </div>

              {/* details */}
              <div className="h-fit rounded-3xl bg-white p-5 shadow-soft sm:p-6 lg:sticky lg:top-24">
                <h3 className="font-display text-lg text-ink-900">2. Your details</h3>

                {selected.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-brand-50/80 p-3 text-xs text-ink-700">
                    <p className="font-semibold text-ink-900">Your request</p>
                    <ul className="mt-1.5 space-y-1.5">
                      {selected.map((p) => (
                        <li key={p._id} className="flex justify-between gap-3">
                          <span className="min-w-0">
                            <span className="line-clamp-1">{p.name}</span>
                            <span className="text-ink-500">
                              {items[p._id]} × {formatPrice(bulk(p.price))}
                            </span>
                          </span>
                          <span className="flex-shrink-0 font-medium">{formatPrice(bulk(p.price) * items[p._id])}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 space-y-1 border-t border-brand-100 pt-2">
                      <p className="flex justify-between">
                        <span>Retail value</span>
                        <span className="line-through">{formatPrice(retailTotal)}</span>
                      </p>
                      <p className="flex justify-between text-green-700">
                        <span>Bulk discount ({off}%)</span>
                        <span>− {formatPrice(retailTotal - bulkTotal)}</span>
                      </p>
                      <p className="flex justify-between text-sm font-semibold text-ink-900">
                        <span>Estimated total</span>
                        <span>{formatPrice(bulkTotal)}</span>
                      </p>
                      <p className="text-[11px] text-ink-500">Excl. shipping · final price confirmed in your quote.</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <input required placeholder="Your name *" className="input-field" maxLength={120} {...field("name")} />
                  <input placeholder="Clinic / organisation" className="input-field" maxLength={200} {...field("organization")} />
                  <select className="input-field" {...field("businessType")}>
                    <option value="">Type of business</option>
                    {businessTypes.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                  <input placeholder="City" className="input-field" maxLength={100} {...field("city")} />
                  <input required type="tel" placeholder="Phone / WhatsApp *" className="input-field" maxLength={18} {...field("phone")} />
                  <input required type="email" placeholder="Email *" className="input-field" {...field("email")} />
                </div>
                <input placeholder="GSTIN (optional, for GST invoice)" className="input-field mt-3 uppercase placeholder:normal-case" maxLength={20} {...field("gstin")} />
                <textarea
                  rows={3}
                  placeholder="Delivery timeline, repeat/monthly requirement, brand preference…"
                  className="input-field mt-3"
                  maxLength={3000}
                  {...field("message")}
                />
                <button type="submit" disabled={sending} className="btn-primary mt-4 w-full disabled:opacity-60">
                  {sending ? "Sending…" : (
                    <>
                      Request Quote <Send size={15} />
                    </>
                  )}
                </button>
                <p className="mt-3 text-center text-xs text-ink-500">
                  Prefer to talk?{" "}
                  <a href={phoneHref} className="font-medium text-brand-700 hover:underline">
                    Call {siteConfig.bulkOrders.phone}
                  </a>
                  {whatsappHref && (
                    <>
                      {" "}or{" "}
                      <a href={whatsappHref} target="_blank" rel="noreferrer" className="font-medium text-brand-700 hover:underline">
                        WhatsApp us
                      </a>
                    </>
                  )}
                </p>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-app py-16">
        <SectionHeading eyebrow="Questions" title="Bulk order FAQs" />
        <div className="mx-auto mt-8 max-w-3xl divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white">
          {faqs(off).map((f) => (
            <details key={f.q} className="group p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-ink-900">
                {f.q}
                <Plus size={16} className="flex-shrink-0 text-brand-600 transition group-open:rotate-45" />
              </summary>
              <p className="mt-3 text-sm text-ink-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA BAR */}
      <div className="container-app pb-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-brand-900 px-6 py-6 text-white sm:flex-row sm:px-10">
          <p className="font-display text-xl sm:text-2xl">Planning a bulk order? We&apos;re here to help.</p>
          <div className="flex gap-3">
            <a href="#quote" className="btn border border-white/50 text-white hover:bg-white/10">
              Get a Quote
            </a>
            <a href={phoneHref} className="btn bg-white text-brand-800 hover:bg-brand-50">
              <Phone size={15} /> Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
