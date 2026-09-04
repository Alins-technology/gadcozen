import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Star,
  Menu,
  X,
  LogOut,
  ExternalLink,
  Tag,
  Mail,
  Send,
} from "lucide-react";
import Logo from "../components/Logo.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/contacts", label: "Contact Messages", icon: Mail },
  { to: "/admin/subscribers", label: "Subscribers", icon: Send },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const SidebarContent = () => (
    <>
      <div className="px-5 py-6">
        <Logo />
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-brand-600">
          Admin Panel
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-brand-50"
              }`
            }
          >
            <link.icon size={17} />
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-1 border-t border-brand-100 p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-brand-50"
        >
          <ExternalLink size={17} />
          View Storefront
        </a>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-brand-50/40">
      <aside className="hidden w-64 flex-shrink-0 flex-col border-r border-brand-100 bg-white lg:flex">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1.5 hover:bg-brand-50"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-brand-100 bg-white px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-full p-2 hover:bg-brand-50 lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2 text-sm text-ink-700">
            <span className="hidden sm:inline">Signed in as</span>
            <span className="font-medium text-ink-900">{user?.name}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
