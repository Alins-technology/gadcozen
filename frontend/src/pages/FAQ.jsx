import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const faqData = [
  {
    category: "Orders",
    items: [
      {
        q: "How do I place an order?",
        a: "Browse products, add items to your cart, and proceed through checkout. You'll need an account to complete your purchase.",
      },
      {
        q: "Can I change or cancel my order?",
        a: "Contact us as soon as possible after placing an order. Once an order has shipped, it can no longer be modified.",
      },
    ],
  },
  {
    category: "Shipping",
    items: [
      {
        q: "How long does shipping take?",
        a: "Orders are typically processed within 1-2 business days. See our Shipping Policy page for full details.",
      },
      {
        q: "Is shipping free?",
        a: "Yes — shipping is free on orders above ₹999. Below that, a flat shipping fee applies.",
      },
    ],
  },
  {
    category: "Returns",
    items: [
      {
        q: "What is your return policy?",
        a: "See our Return & Refund Policy page for the current return window and conditions.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        q: "What payment methods are supported?",
        a: "This demo store supports a simulated online payment flow and Cash on Delivery. No real payment gateway is connected yet.",
      },
    ],
  },
  {
    category: "Products",
    items: [
      {
        q: "Are your products suitable for all skin types?",
        a: "Product pages list what's stated on the packaging, including any suitability notes. Check the product's Description and Ingredients tabs for details.",
      },
    ],
  },
  {
    category: "Account",
    items: [
      {
        q: "How do I reset my password?",
        a: "Use the 'Forgot password?' link on the login page to receive password reset instructions.",
      },
    ],
  },
];

function AccordionItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 py-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-ink-900">{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} className="text-brand-600" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="pt-3 text-sm text-ink-700">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  useEffect(() => {
    document.title = "FAQs | GADCO ZEN";
  }, []);

  return (
    <div className="container-app py-10">
      <Breadcrumbs items={[{ label: "FAQs" }]} />
      <h1 className="mt-3 font-display text-3xl text-ink-900">Frequently Asked Questions</h1>

      <div className="mt-8 grid gap-10 sm:grid-cols-2">
        {faqData.map((group) => (
          <div key={group.category}>
            <h3 className="font-display text-lg text-brand-700">{group.category}</h3>
            <div className="mt-2">
              {group.items.map((item) => (
                <AccordionItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
