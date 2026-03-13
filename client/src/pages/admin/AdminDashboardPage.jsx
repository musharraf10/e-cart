import { useEffect, useState } from "react";
import api from "../../api/client.js";

export function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    api
      .get("/admin/dashboard")
      .then(({ data: payload }) => {
        if (mounted) {
          setData(payload);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError("Failed to load dashboard data");
          setLoading(false);
        }
        console.error(err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-sm text-gray-500 py-8 text-center">Loading dashboard…</div>;
  }

  if (error || !data) {
    return (
      <div className="text-sm text-red-600 py-8 text-center">
        {error || "Could not load dashboard data"}
      </div>
    );
  }

  const formatCurrency = (amount) =>
    `$${(Number(amount) || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const metricCards = [
    ["Total Revenue", formatCurrency(data.totalRevenue)],
    ["Revenue Today", formatCurrency(data.revenueToday)],
    ["Orders Today", data.ordersToday ?? 0],
    ["Total Orders", data.totalOrders ?? 0],
    ["Total Customers", data.totalCustomers ?? 0],
    ["Total Products", data.totalProducts ?? 0],
    ["Low Stock Products", data.lowStockProducts ?? 0],
    ["Out of Stock Products", data.outOfStockProducts ?? 0],
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-bold tracking-tight">Admin Operations Dashboard</h1>

      {/* Metric Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {metricCards.map(([label, value]) => (
          <div
            key={label}
            className="bg-white rounded-lg border shadow-sm p-4 transition hover:shadow"
          >
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
              {label}
            </p>
            <p className="text-2xl font-semibold mt-1.5">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue & Orders last 30 days */}
        <div className="bg-white rounded-lg border shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Revenue (Last 30 Days)</h2>
          <div className="max-h-64 overflow-auto text-sm">
            {data.charts?.revenueLast30Days?.length ? (
              data.charts.revenueLast30Days.map((row) => (
                <div
                  key={row._id}
                  className="flex justify-between py-1.5 border-b last:border-b-0 text-gray-700"
                >
                  <span>{row._id}</span>
                  <span className="font-medium">{formatCurrency(row.revenue)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">No revenue data yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Orders (Last 30 Days)</h2>
          <div className="max-h-64 overflow-auto text-sm">
            {data.charts?.ordersLast30Days?.length ? (
              data.charts.ordersLast30Days.map((row) => (
                <div
                  key={row._id}
                  className="flex justify-between py-1.5 border-b last:border-b-0 text-gray-700"
                >
                  <span>{row._id}</span>
                  <span className="font-medium">{row.orders}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-6">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Recent Orders</h2>
          {data.recentOrders?.length ? (
            <div className="space-y-3 text-sm">
              {data.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">
                      #{order._id.slice(-6).toUpperCase()} · {order.user?.name || "Guest"}
                    </div>
                    <div className="text-gray-500 text-xs mt-0.5">
                      {new Date(order.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  <div className="mt-1 sm:mt-0 text-right">
                    <div className="font-medium">{formatCurrency(order.total)}</div>
                    <div className="text-xs capitalize text-gray-600">{order.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent orders</p>
          )}
        </div>

        {/* Recent Reviews + Low Stock Hint */}
        <div className="bg-white rounded-lg border shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Recent Activity</h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <strong>{data.lowStockProducts || 0}</strong> products low on stock (&lt; 5 units)
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <strong>{data.outOfStockProducts || 0}</strong> products out of stock
            </p>
          </div>

          <h3 className="font-medium text-gray-700 mt-5 mb-2">Recent Reviews</h3>
          {data.recentReviews?.length ? (
            <div className="space-y-3 text-sm">
              {data.recentReviews.map((review) => (
                <div key={review._id} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {review.user?.name || "Anonymous"} • {review.rating}/5
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1 line-clamp-2">
                    on <em>{review.product?.name || "Product"}</em>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">No recent reviews</p>
          )}
        </div>
      </div>
    </div>
  );
}