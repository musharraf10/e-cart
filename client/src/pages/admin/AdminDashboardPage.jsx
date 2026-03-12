import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../api/client.js";

export function AdminDashboardPage() {
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    api.get("/admin/dashboard").then(({ data }) => setMetrics(data));
  }, [user, navigate]);

  if (!metrics) {
    return <div className="text-sm text-gray-500">Loading dashboard…</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Admin dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-xl font-semibold mt-1">
            ${metrics.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Orders</p>
          <p className="text-xl font-semibold mt-1">{metrics.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Products</p>
          <p className="text-xl font-semibold mt-1">{metrics.totalProducts}</p>
        </div>
      </div>
      <section className="bg-white rounded-xl p-4 shadow-sm text-sm">
        <h2 className="text-sm font-semibold mb-2">Recent orders</h2>
        <div className="space-y-2">
          {metrics.recentOrders.map((o) => (
            <div
              key={o._id}
              className="border rounded-lg px-3 py-2 flex items-center justify-between"
            >
              <div className="text-xs">
                <p className="font-medium">
                  {o.items.length} item{o.items.length > 1 ? "s" : ""} · $
                  {o.total.toFixed(2)}
                </p>
                <p className="text-gray-500">{o.status}</p>
              </div>
              <span className="text-[11px] text-gray-500">
                {new Date(o.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
          {metrics.recentOrders.length === 0 && (
            <p className="text-xs text-gray-500">No orders yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

