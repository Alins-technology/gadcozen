import { useState, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Logo from "../../components/Logo.jsx";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.title = "Admin Login | GADCO ZEN";
  }, []);

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.success && res.user.role === "admin") {
      navigate(location.state?.from?.pathname || "/admin");
    } else if (res.success) {
      showToast("This account does not have admin access.", "error");
    } else {
      showToast(res.message, "error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-50/50 px-4">
      <div className="w-full max-w-sm rounded-3xl border border-brand-100 bg-white p-8 shadow-soft">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center font-display text-xl text-ink-900">Admin Login</h1>
        <p className="mt-1 text-center text-xs text-ink-500">GADCO ZEN Admin Panel</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="email"
              required
              placeholder="Admin email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className="input-field !pl-11"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              className="input-field !pl-11"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}
