import { useState } from "react";
import { changePassword } from "../../services/userService.js";
import { useToast } from "../../context/ToastContext.jsx";
import { getErrorMessage } from "../../services/api.js";

export default function Security() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await changePassword(form);
      showToast("Password updated successfully", "success");
      setForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 p-6">
      <h3 className="font-display text-lg text-ink-900">Change Password</h3>
      <form onSubmit={handleSubmit} className="mt-5 max-w-md space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-700">Current Password</label>
          <input
            type="password"
            required
            value={form.currentPassword}
            onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-700">New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={form.newPassword}
            onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
            className="input-field"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Updating…" : "Update Password"}
        </button>
      </form>
    </div>
  );
}
