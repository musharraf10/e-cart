import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FiBarChart2, FiDownload, FiTrendingUp } from "react-icons/fi";
import api from "../../../api/client.js";

function toCsv(rows) {
  if (!rows?.length) return "";
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? "")).join(",")).join("\n");
  return `${headers.join(",")}\n${body}`;
}

function download(name, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function MetricBlock({ label, value, icon: Icon }) {
  return (
    <div className="rounded-xl border border-border bg-primary/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
        <Icon className="text-accent" />
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function BarsChart({ rows }) {
  if (!rows.length) return <p className="py-8 text-center text-sm text-muted">No category data yet</p>;

  const max = Math.max(...rows.map((row) => row.products), 1);
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const pct = Math.max((row.products / max) * 100, 8);
        return (
          <div key={row.category || "Unknown"}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-muted">{row.category || "Unknown"}</span>
              <span className="font-semibold text-white">{row.products}</span>
            </div>
            <div className="h-2 rounded-full bg-border/80">
              <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Sparkline({ rows, valueKey }) {
  if (!rows.length) return <p className="py-8 text-center text-sm text-muted">No trend data</p>;

  const width = 500;
  const height = 170;
  const pad = 18;
  const max = Math.max(...rows.map((row) => Number(row[valueKey]) || 0), 1);
  const step = rows.length > 1 ? (width - pad * 2) / (rows.length - 1) : 0;

  const points = rows
    .map((row, i) => {
      const val = Number(row[valueKey]) || 0;
      const x = pad + i * step;
      const y = height - pad - (val / max) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-44 min-w-[420px] w-full">
        <polyline points={points} fill="none" stroke="#a6c655" strokeWidth="3" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function AdminAnalyticsPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/analytics").then(({ data: payload }) => setData(payload));
  }, []);

  const summary = useMemo(() => {
    if (!data) return null;
    const totalRevenue = (data.dailyRevenue || []).reduce((sum, row) => sum + (Number(row.revenue) || 0), 0);
    const totalUnits = (data.salesByProduct || []).reduce((sum, row) => sum + (Number(row.qty) || 0), 0);
    return {
      totalRevenue,
      totalUnits,
      activeProducts: (data.salesByProduct || []).length,
    };
  }, [data]);

  if (!data || !summary) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-32 w-full max-w-md animate-pulse rounded-xl border border-[#262626] bg-card" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <section className="rounded-2xl border border-border bg-gradient-to-r from-card via-card to-primary p-5 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Visual Analytics</h1>
            <p className="mt-1 text-sm text-muted">Modern NoorFit insights for product movement, category contribution, and revenue trend.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-white hover:bg-border/50" onClick={() => download("sales-by-product.csv", toCsv(data.salesByProduct))}>
              <FiDownload /> Products CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-white hover:bg-border/50" onClick={() => download("daily-revenue.csv", toCsv(data.dailyRevenue))}>
              <FiDownload /> Daily Revenue CSV
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-white hover:bg-border/50" onClick={() => download("monthly-revenue.csv", toCsv(data.monthlyRevenue))}>
              <FiDownload /> Monthly Revenue CSV
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricBlock label="Revenue (Visible Period)" value={`$${summary.totalRevenue.toFixed(2)}`} icon={FiTrendingUp} />
        <MetricBlock label="Units Sold" value={summary.totalUnits} icon={FiBarChart2} />
        <MetricBlock label="Products with Sales" value={summary.activeProducts} icon={FiTrendingUp} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-white">Daily Revenue Trend</h2>
          <p className="mb-3 mt-1 text-sm text-muted">Line chart for quick performance read.</p>
          <Sparkline rows={data.dailyRevenue || []} valueKey="revenue" />
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-white">Category Distribution</h2>
          <p className="mb-3 mt-1 text-sm text-muted">Compare category weight by active products sold.</p>
          <BarsChart rows={data.salesByCategory || []} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-lg font-semibold text-white">Top Selling Products</h2>
        <p className="mb-3 mt-1 text-sm text-muted">Quantity and revenue by product.</p>
        {(data.salesByProduct || []).length === 0 ? (
          <p className="text-sm text-muted">No data</p>
        ) : (
          <div className="space-y-2">
            {(data.salesByProduct || []).map((row, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-xl border border-border/80 bg-primary/40 px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between">
                <span className="font-medium text-white">{row._id}</span>
                <div className="flex gap-3 text-muted">
                  <span>Qty {row.qty}</span>
                  <span className="font-semibold text-accent">${(row.revenue || 0).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
