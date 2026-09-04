import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Logo from "../components/Logo.jsx";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Create Account | GADCO ZEN";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(form);
    setLoading(false);
    if (res.success) {
      showToast(`Welcome to GADCO ZEN, ${res.user.name.split(" ")[0]}!`, "success");
      navigate("/account");
    } else {
      showToast(res.message, "error");
    }
  };

  return (
    <div className="container-app flex min-h-[80vh] items-center justify-center py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-3xl border border-slate-100 p-8 shadow-soft"
      >
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center font-display text-2xl text-ink-900">Create Account</h1>
        <p className="mt-1 text-center text-sm text-ink-500">Join GADCO ZEN for a simpler routine.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="text"
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input-field !pl-11"
            />
          </div>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="email"
              required
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input-field !pl-11"
            />
          </div>
          <div className="relative">
            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="tel"
              placeholder="Phone number (optional)"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="input-field !pl-11"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input-field !pl-11"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
