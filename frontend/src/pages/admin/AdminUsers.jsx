import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import { fetchUsersAdmin, toggleUserStatusAdmin, updateUserRoleAdmin } from "../../services/userService.js";
import { formatDate } from "../../utils/format.js";
import { useToast } from "../../context/ToastContext.jsx";
import PageLoader from "../../components/PageLoader.jsx";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { showToast } = useToast();

  const load = useCallback(() => {
    setLoading(true);
    fetchUsersAdmin({ search: search || undefined })
      .then((data) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    document.title = "Manage Users | GADCO ZEN Admin";
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const toggleStatus = async (user) => {
    try {
      const { user: updated } = await toggleUserStatusAdmin(user._id, !user.isActive);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      showToast(`${updated.name} ${updated.isActive ? "enabled" : "disabled"}`, "success");
    } catch {
      showToast("Could not update user", "error");
    }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "customer" : "admin";
    try {
      const { user: updated } = await updateUserRoleAdmin(user._id, newRole);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      showToast(`${updated.name} is now ${newRole}`, "success");
    } catch {
      showToast("Could not update role", "error");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Users</h1>

      <div className="relative mt-4 max-w-xs">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field !pl-9 !py-2 text-sm"
        />
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-brand-100 bg-white">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-brand-100 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Joined</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-brand-50 last:border-0">
                  <td className="p-3 font-medium text-ink-900">{u.name}</td>
                  <td className="p-3 text-ink-700">{u.email}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        u.role === "admin" ? "bg-brand-50 text-brand-700" : "bg-slate-100 text-ink-700"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-ink-700">{formatDate(u.createdAt)}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        u.isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {u.isActive ? "Active" : "Disabled"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => toggleRole(u)} className="text-xs font-medium text-brand-700 hover:underline">
                        Make {u.role === "admin" ? "Customer" : "Admin"}
                      </button>
                      <button onClick={() => toggleStatus(u)} className="text-xs font-medium text-ink-700 hover:underline">
                        {u.isActive ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-6 text-center text-sm text-ink-500">No users found.</p>}
        </div>
      )}
    </div>
  );
}
