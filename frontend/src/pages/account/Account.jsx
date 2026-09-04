import { useEffect } from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { User, Package, MapPin, Lock, LogOut, Heart } from "lucide-react";
import Breadcrumbs from "../../components/Breadcrumbs.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import Profile from "./Profile.jsx";
import Orders from "./Orders.jsx";
import OrderDetail from "./OrderDetail.jsx";
import Addresses from "./Addresses.jsx";
import Security from "./Security.jsx";

const tabs = [
  { to: "/account", label: "Profile", icon: User, end: true },
  { to: "/account/orders", label: "Orders", icon: Package },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/security", label: "Change Password", icon: Lock },
  { to: "/wishlist", label: "Wishlist", icon: Heart },
];

export default function Account() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "My Account | GADCO ZEN";
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="container-app py-10">
      <Breadcrumbs items={[{ label: "My Account" }]} />
      <h1 className="mt-3 font-display text-3xl text-ink-900">Hi, {user?.name?.split(" ")[0]}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-slate-100 p-3">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  `flex flex-shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-brand-50"
                  }`
                }
              >
                <tab.icon size={16} />
                {tab.label}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="flex flex-shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-red-50 hover:text-red-600"
            >
              <LogOut size={16} />
              Logout
            </button>
          </nav>
        </aside>

        <div>
          <Routes>
            <Route index element={<Profile />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderNumber" element={<OrderDetail />} />
            <Route path="addresses" element={<Addresses />} />
            <Route path="security" element={<Security />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
