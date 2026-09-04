import { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, ArrowRight } from "lucide-react";
import Logo from "./Logo.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { subscribeToNewsletter } from "../services/subscriberService.js";
import { getErrorMessage } from "../services/api.js";

const columns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", to: "/shop" },
      { label: "Cleansers", to: "/category/cleansers" },
      { label: "Sun Care", to: "/category/sun-care" },
      { label: "Hair Care", to: "/category/hair-care" },
      { label: "Body Care", to: "/category/body-care" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact Us", to: "/contact" },
      { label: "Shipping Policy", to: "/shipping-policy" },
      { label: "Returns & Refunds", to: "/return-refund-policy" },
      { label: "FAQs", to: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", to: "/about" },
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms & Conditions", to: "/terms-and-conditions" },
      { label: "Cookie Policy", to: "/cookie-policy" },
      { label: "Disclaimer", to: "/disclaimer" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      await subscribeToNewsletter(email.trim());
      showToast("Thanks for subscribing to GADCO ZEN updates!", "success");
      setEmail("");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="mt-20 border-t border-brand-100 bg-brand-50/60">
      <div className="container-app py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-ink-700">
              Simple, effective skincare and personal care essentials designed to fit effortlessly
              into your everyday routine.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm transition hover:bg-brand-600 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm transition hover:bg-brand-600 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            </div>
            <div className="mt-4 space-y-1.5 text-sm text-ink-700">
              <a href="mailto:vamaskinhair@gmail.com" className="flex items-center gap-2 hover:text-brand-700">
                <Mail size={14} /> vamaskinhair@gmail.com
              </a>
              <a href="tel:+919315910949" className="flex items-center gap-2 hover:text-brand-700">
                <Phone size={14} /> +91 93159 10949
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-sm font-semibold text-ink-900">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="text-sm text-ink-700 hover:text-brand-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-white p-6 shadow-soft sm:flex sm:items-center sm:justify-between sm:p-8">
          <div>
            <h4 className="font-display text-lg text-ink-900">Stay in the loop</h4>
            <p className="mt-1 text-sm text-ink-500">
              Get GADCO ZEN news, launches, and offers in your inbox.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="mt-4 flex gap-2 sm:mt-0 sm:w-80">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field flex-1"
            />
            <button type="submit" disabled={subscribing} className="btn-primary !px-4 disabled:opacity-60">
              <ArrowRight size={16} />
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-brand-100 pt-6 text-xs text-ink-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} GADCO ZEN. All rights reserved.</p>
          <p>
            <Link to="/admin/login" className="underline-offset-2 hover:text-brand-700 hover:underline">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
