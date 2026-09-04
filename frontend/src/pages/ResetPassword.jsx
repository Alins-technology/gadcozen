import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { resetPassword } from "../services/authService.js";
import { getErrorMessage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Logo from "../components/Logo.jsx";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { updateStoredUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Reset Password | GADCO ZEN";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await resetPassword(token, password);
      localStorage.setItem("gz_token", data.token);
      localStorage.setItem("gz_user", JSON.stringify(data.user));
      updateStoredUser(data.user);
      showToast("Password updated. You're logged in.", "success");
      navigate("/account");
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
        <h1 className="text-center font-display text-2xl text-ink-900">Set a new password</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="relative">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              type="password"
              required
              minLength={6}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field !pl-11"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          <Link to="/login" className="font-medium text-brand-700 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
