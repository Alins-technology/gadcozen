import { useState, useEffect } from "react";
import { Mail, Phone, Clock } from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { submitContactForm } from "../services/contactService.js";
import { useToast } from "../context/ToastContext.jsx";
import { getErrorMessage } from "../services/api.js";

const initialForm = { name: "", email: "", phone: "", subject: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    document.title = "Contact Us | GADCO ZEN";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await submitContactForm(form);
      showToast("Message sent — we'll get back to you soon.", "success");
      setForm(initialForm);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-app py-10">
      <Breadcrumbs items={[{ label: "Contact" }]} />
      <h1 className="mt-3 font-display text-3xl text-ink-900">Contact Us</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-5">
            <Mail size={18} className="mt-0.5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Email</p>
              <p className="text-sm text-ink-500">vamaskinhair@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-5">
            <Phone size={18} className="mt-0.5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Phone</p>
              <p className="text-sm text-ink-500">+91 93159 10949</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-5">
            <Clock size={18} className="mt-0.5 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-ink-900">Business Hours</p>
              <p className="text-sm text-ink-500">Mon–Sat, 10:00 AM – 6:00 PM (placeholder)</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              required
              placeholder="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input-field"
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Phone (optional)"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="input-field"
            />
            <input
              required
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className="input-field"
            />
          </div>
          <textarea
            required
            rows={5}
            placeholder="Your message"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            className="input-field mt-4"
          />
          <button type="submit" disabled={sending} className="btn-primary mt-4">
            {sending ? "Sending…" : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
