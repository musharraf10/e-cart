import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../api/client.js";

export function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .get("/admin/dashboard")
      .then(({ data: payload }) => {
        if (mounted) {
          setData(payload);
          setLoading(false);
          setError(null);
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

  const formatCurrency = (amount) =>
    `$${(Number(amount) || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const metricCards = [
    ["Total Revenue", formatCurrency(data?.totalRevenue)],
    ["Revenue Today", formatCurrency(data?.revenueToday)],
    ["Orders Today", data?.ordersToday ?? 0],
    ["Total Orders", data?.totalOrders ?? 0],
    ["Total Customers", data?.totalCustomers ?? 0],
    ["Total Products", data?.totalProducts ?? 0],
    ["Low Stock Products", data?.lowStockProducts ?? 0],
    ["Out of Stock Products", data?.outOfStockProducts ?? 0],
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse rounded-xl bg-card border border-[#262626] h-32 w-full max-w-md" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-card border border-red-900/50 p-8 text-center">
        <p className="text-red-400">{error || "Could not load dashboard data"}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <h1 className="text-2xl font-bold tracking-tight text-white">
        Admin Operations Dashboard
      </h1>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {metricCards.map(([label, value]) => (
          <div
            key={label}
            className="bg-card rounded-xl border border-[#262626] p-4 hover:border-[#262626]/80 transition-colors"
          >
            <p className="text-xs text-muted font-medium uppercase tracking-wide">
              {label}
            </p>
            <p className="text-xl font-semibold text-white mt-1.5">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-[#262626] p-5">
          <h2 className="font-semibold text-white mb-3">Revenue (Last 30 Days)</h2>
          <div className="max-h-64 overflow-auto text-sm">
            {data.charts?.revenueLast30Days?.length ? (
              data.charts.revenueLast30Days.map((row) => (
                <div
                  key={row._id}
                  className="flex justify-between py-2 border-b border-[#262626] last:border-b-0 text-muted"
                >
                  <span>{row._id}</span>
                  <span className="font-medium text-white">{formatCurrency(row.revenue)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-6">No revenue data yet</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-[#262626] p-5">
          <h2 className="font-semibold text-white mb-3">Orders (Last 30 Days)</h2>
          <div className="max-h-64 overflow-auto text-sm">
            {data.charts?.ordersLast30Days?.length ? (
              data.charts.ordersLast30Days.map((row) => (
                <div
                  key={row._id}
                  className="flex justify-between py-2 border-b border-[#262626] last:border-b-0 text-muted"
                >
                  <span>{row._id}</span>
                  <span className="font-medium text-white">{row.orders}</span>
                </div>
              ))
            ) : (
              <p className="text-muted text-center py-6">No orders yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-[#262626] p-5">
          <h2 className="font-semibold text-white mb-3">Recent Orders</h2>
          {data.recentOrders?.length ? (
            <div className="space-y-3 text-sm">
              {data.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[#262626] last:border-b-0"
                >
                  <div>
                    <div className="font-medium text-white">
                      #{order._id.slice(-6).toUpperCase()} · {order.user?.name || "Guest"}
                    </div>
                    <div className="text-muted text-xs mt-0.5">
                      {new Date(order.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                  </div>
                  <div className="mt-1 sm:mt-0 text-right">
                    <div className="font-medium text-white">{formatCurrency(order.total)}</div>
                    <div className="text-xs capitalize text-muted">{order.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-8">No recent orders</p>
          )}
        </div>

        <div className="bg-card rounded-xl border border-[#262626] p-5">
          <h2 className="font-semibold text-white mb-3">Recent Activity</h2>
          <div className="mb-4 space-y-1 text-sm text-muted">
            <p>
              <strong className="text-white">{data.lowStockProducts ?? 0}</strong> products low on stock (&lt; 5 units)
            </p>
            <p>
              <strong className="text-white">{data.outOfStockProducts ?? 0}</strong> products out of stock
            </p>
          </div>
          <h3 className="font-medium text-white mt-5 mb-2">Recent Reviews</h3>
          {data.recentReviews?.length ? (
            <div className="space-y-3 text-sm">
              {data.recentReviews.map((review) => (
                <div key={review._id} className="py-3 border-b border-[#262626] last:border-b-0">
                  <div className="flex justify-between items-baseline">
                    <span className="font-medium text-white">
                      {review.user?.name || "Anonymous"} · {review.rating}/5
                    </span>
                    <span className="text-muted text-xs">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-muted mt-1 line-clamp-2">
                    on <em>{review.product?.name || "Product"}</em>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted text-center py-6">No recent reviews</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
