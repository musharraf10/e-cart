import { useEffect, useState } from "react";
import api from "../../api/client.js";

export function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data: payload }) => setData(payload));
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
    <div className="space-y-5">
      <h1 className="text-xl font-semibold">Admin Operations Dashboard</h1>

      <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm">
        {metricCards.map(([label, value]) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-xl font-semibold mt-1">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm text-sm">
          <h2 className="font-semibold mb-3">Revenue (last 30 days)</h2>
          <div className="space-y-1 max-h-44 overflow-auto">
            {data.charts?.revenueLast30Days?.map((row) => (
              <div key={row._id} className="flex justify-between text-xs border-b py-1">
                <span>{row._id}</span>
                <span>${row.revenue.toFixed(2)}</span>
              </div>
            ))}
          </div>
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
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Low Inventory Alerts</h2>
          <p className="text-xs text-gray-600">{data.lowStockProducts} products below stock threshold (&lt;5).</p>
          <h3 className="font-semibold mt-4 mb-2">Recent Reviews</h3>
          {(data.recentReviews || []).map((r) => (
            <div key={r._id} className="border-b py-2 text-xs">
              {r.user?.name}: {r.rating}/5 on {r.product?.name}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
