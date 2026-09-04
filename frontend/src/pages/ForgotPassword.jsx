import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { forgotPassword } from "../services/authService.js";
import { getErrorMessage } from "../services/api.js";
import Logo from "../components/Logo.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Forgot Password | GADCO ZEN";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await forgotPassword(email);
      setSent(true);
      // The API returns a dev token in non-production setups so the reset
      // flow can be exercised without wiring up an email provider.
      if (data.devResetToken) setDevToken(data.devResetToken);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app flex min-h-[80vh] items-center justify-center py-14">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 p-8 shadow-soft">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <h1 className="text-center font-display text-2xl text-ink-900">Reset your password</h1>
        <p className="mt-1 text-center text-sm text-ink-500">
          Enter your email and we'll help you get back in.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">
            <p>If that email exists, a reset link has been generated.</p>
            {devToken && (
              <p className="mt-3">
                Development mode — continue here:{" "}
                <Link to={`/reset-password/${devToken}`} className="font-medium underline">
                  Reset Password
                </Link>
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field !pl-11"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-ink-500">
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
