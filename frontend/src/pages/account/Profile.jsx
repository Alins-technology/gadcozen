import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { updateProfile } from "../../services/userService.js";
import { getErrorMessage } from "../../services/api.js";

export default function Profile() {
  const { user, updateStoredUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { user: updated } = await updateProfile(form);
      updateStoredUser(updated);
      showToast("Profile updated", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 p-6">
      <h3 className="font-display text-lg text-ink-900">Profile Information</h3>
      <form onSubmit={handleSubmit} className="mt-5 max-w-md space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-700">Full Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-700">Email</label>
          <input value={user?.email} disabled className="input-field opacity-60" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-700">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            className="input-field"
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
