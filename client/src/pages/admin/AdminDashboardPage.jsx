import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiDownload, FiRefreshCw } from "react-icons/fi";
import api from "../../api/client.js";
import {
  ActivityItem,
  AdminMetricCard,
  AdminPanelCard,
  AdminTrendList,
  RecentOrderRow,
} from "../../components/admin/AdminDashboardWidgets.jsx";

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
    ["Total Revenue", formatCurrency(data?.totalRevenue), true],
    ["Revenue Today", formatCurrency(data?.revenueToday), true],
    ["Orders Today", data?.ordersToday ?? 0],
    ["Total Orders", data?.totalOrders ?? 0],
    ["Total Customers", data?.totalCustomers ?? 0],
    ["Total Products", data?.totalProducts ?? 0],
    ["Low Stock Products", data?.lowStockProducts ?? 0],
    ["Out of Stock Products", data?.outOfStockProducts ?? 0],
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-2xl border border-border bg-card" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-24 animate-pulse rounded-2xl border border-border bg-card" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-card p-8 text-center">
        <p className="text-red-400">{error || "Could not load dashboard data"}</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <section className="rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">NoorFit Admin</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Operations Command Center
            </h1>
            <p className="mt-2 text-sm text-muted">Centralized view of orders, revenue, and inventory health.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted hover:text-white"
            >
              <FiRefreshCw />
              Refresh
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-medium text-white"
            >
              <FiDownload />
              Export Snapshot
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricCards.map(([label, value, highlight]) => (
          <AdminMetricCard key={label} label={label} value={value} highlight={highlight} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AdminPanelCard title="Revenue (Last 30 Days)" subtitle="Daily revenue trend for recent 30-day window.">
          <AdminTrendList
            rows={data.charts?.revenueLast30Days}
            valueFormatter={formatCurrency}
            valueKey="revenue"
            emptyMessage="No revenue data yet"
          />
        </AdminPanelCard>

        <AdminPanelCard title="Orders (Last 30 Days)" subtitle="Daily order volume in the same period.">
          <AdminTrendList
            rows={data.charts?.ordersLast30Days}
            valueFormatter={(value) => value ?? 0}
            valueKey="orders"
            emptyMessage="No orders yet"
          />
        </AdminPanelCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AdminPanelCard title="Recent Orders" subtitle="Most recent customer transactions.">
          {data.recentOrders?.length ? (
            <div className="space-y-2">
              {data.recentOrders.map((order) => (
                <RecentOrderRow key={order._id} order={order} formatCurrency={formatCurrency} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted">No recent orders</p>
          )}
        </AdminPanelCard>

        <AdminPanelCard title="Recent Activity" subtitle="Operational alerts and customer feedback signals.">
          <div className="space-y-2">
            <ActivityItem>
              <strong className="text-white">{data.lowStockProducts ?? 0}</strong> products low on stock (&lt; 5 units)
            </ActivityItem>
            <ActivityItem>
              <strong className="text-white">{data.outOfStockProducts ?? 0}</strong> products currently out of stock
            </ActivityItem>
          </div>

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.15em] text-muted">Recent Reviews</h3>
          {data.recentReviews?.length ? (
            <div className="mt-3 space-y-2">
              {data.recentReviews.map((review) => (
                <div key={review._id} className="rounded-xl border border-border/80 bg-primary/40 px-3 py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-white">
                      {review.user?.name || "Anonymous"} · {review.rating}/5
                    </p>
                    <p className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    on <em>{review.product?.name || "Product"}</em>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 py-2 text-sm text-muted">No recent reviews</p>
          )}
        </AdminPanelCard>
      </section>
    </motion.div>
  );
}
