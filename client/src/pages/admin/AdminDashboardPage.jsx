import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";

export function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setMetrics(data));
  }, []);

  if (!data) return <div className="text-sm text-gray-500">Loading dashboard…</div>;

  const metricCards = [
    ["Total Revenue", `$${(data.totalRevenue || 0).toFixed(2)}`],
    ["Revenue Today", `$${(data.revenueToday || 0).toFixed(2)}`],
    ["Orders Today", data.ordersToday || 0],
    ["Total Orders", data.totalOrders || 0],
    ["Total Customers", data.totalCustomers || 0],
    ["Total Products", data.totalProducts || 0],
    ["Low Stock Products", data.lowStockProducts || 0],
    ["Out of Stock Products", data.outOfStockProducts || 0],
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Admin dashboard</h1>
        <div className="flex gap-2">
          <Link
            to="/admin/products"
            className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold"
          >
            Manage products
          </Link>
          <Link
            to="/admin/products/new"
            className="rounded-full bg-gray-900 text-white px-4 py-2 text-xs font-semibold"
          >
            Create product
          </Link>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 text-sm">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-xl font-semibold mt-1">
            ${metrics.totalRevenue.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm text-sm">
          <h2 className="font-semibold mb-3">Orders (last 30 days)</h2>
          <div className="space-y-1 max-h-44 overflow-auto">
            {data.charts?.ordersLast30Days?.map((row) => (
              <div key={row._id} className="flex justify-between text-xs border-b py-1">
                <span>{row._id}</span>
                <span>{row.orders}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid xl:grid-cols-2 gap-4 text-sm">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Recent Orders</h2>
          {(data.recentOrders || []).map((o) => (
            <div key={o._id} className="border-b py-2 text-xs">
              {o._id.slice(-6).toUpperCase()} · {o.user?.name || "Guest"} · ${o.total.toFixed(2)} · {o.status}
            </div>
          ))}
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
                  {o.items.length} item{o.items.length > 1 ? "s" : ""} · ${o.total.toFixed(2)}
                </p>
                <p className="text-gray-500">{o.status}</p>
              </div>
              <span className="text-[11px] text-gray-500">
                {new Date(o.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
