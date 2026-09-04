import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ShoppingCart, Users, IndianRupee, AlertTriangle } from "lucide-react";
import { fetchDashboardStats } from "../../services/userService.js";
import { formatPrice, formatDate } from "../../utils/format.js";
import PageLoader from "../../components/PageLoader.jsx";

const statCards = (stats) => [
  { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart },
  { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: IndianRupee },
  { label: "Total Customers", value: stats.totalUsers, icon: Users },
  { label: "Total Products", value: stats.totalProducts, icon: Package },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    document.title = "Admin Dashboard | GADCO ZEN";
    fetchDashboardStats().then(setStats);
  }, []);

  if (!stats) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards(stats).map((card) => (
          <div key={card.label} className="rounded-2xl border border-brand-100 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <card.icon size={18} />
            </div>
            <p className="mt-3 text-2xl font-semibold text-ink-900">{card.value}</p>
            <p className="text-xs text-ink-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h3 className="font-display text-base text-ink-900">Recent Orders</h3>
          <div className="mt-3 space-y-2">
            {stats.recentOrders.length === 0 && <p className="text-sm text-ink-500">No orders yet.</p>}
            {stats.recentOrders.map((order) => (
              <Link
                key={order._id}
                to={`/admin/orders/${order._id}`}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-brand-50"
              >
                <div>
                  <p className="font-medium text-ink-900">{order.orderNumber}</p>
                  <p className="text-xs text-ink-500">{order.user?.name || "Guest"}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-ink-900">{formatPrice(order.total)}</p>
                  <p className="text-xs text-ink-500">{formatDate(order.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-white p-5">
          <h3 className="font-display text-base text-ink-900">Recent Customers</h3>
          <div className="mt-3 space-y-2">
            {stats.recentUsers.length === 0 && <p className="text-sm text-ink-500">No customers yet.</p>}
            {stats.recentUsers.map((u) => (
              <div key={u._id} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-ink-900">{u.name}</p>
                  <p className="text-xs text-ink-500">{u.email}</p>
                </div>
                <p className="text-xs text-ink-500">{formatDate(u.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {stats.lowStockProducts.length > 0 && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <h3 className="flex items-center gap-2 font-display text-base text-amber-800">
            <AlertTriangle size={16} /> Low Stock Products
          </h3>
          <div className="mt-3 space-y-1">
            {stats.lowStockProducts.map((p) => (
              <div key={p._id} className="flex justify-between text-sm text-amber-800">
                <span>{p.name}</span>
                <span className="font-medium">{p.stock} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
