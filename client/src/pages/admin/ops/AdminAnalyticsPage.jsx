import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";

function toCsv(rows) {
  if (!rows?.length) return "";
  const headers = Object.keys(rows[0]);
  const body = rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")).join("\n");
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

export function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/admin/analytics").then(({ data }) => setData(data));
  }, []);

  if (!data) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-pulse rounded-xl bg-card border border-[#262626] h-32 w-full max-w-md" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">Analytics & Reports</h1>
      <div className="flex flex-wrap gap-2 text-xs">
        <button className="rounded-xl border border-[#262626] px-4 py-2 text-white hover:bg-[#262626]" onClick={() => download("sales-by-product.csv", toCsv(data.salesByProduct))}>
          Export CSV (Products)
        </button>
        <button className="rounded-xl border border-[#262626] px-4 py-2 text-white hover:bg-[#262626]" onClick={() => download("daily-revenue.csv", toCsv(data.dailyRevenue))}>
          Export CSV (Daily Revenue)
        </button>
        <button className="rounded-xl border border-[#262626] px-4 py-2 text-white hover:bg-[#262626]" onClick={() => download("monthly-revenue.csv", toCsv(data.monthlyRevenue))}>
          Export Monthly
        </button>
      </div>
      <div className="grid xl:grid-cols-2 gap-4 text-sm">
        <div className="bg-card rounded-xl border border-[#262626] p-4">
          <h2 className="font-semibold text-white mb-3">Sales by product</h2>
          {(data.salesByProduct || []).length === 0 ? (
            <p className="text-muted text-sm">No data</p>
          ) : (
            (data.salesByProduct || []).map((r, i) => (
              <div key={i} className="text-xs border-b border-[#262626] py-2 text-muted last:border-b-0">
                {r._id} · qty {r.qty} · ${(r.revenue || 0).toFixed(2)}
              </div>
            ))
          )}
        </div>
        <div className="bg-card rounded-xl border border-[#262626] p-4">
          <h2 className="font-semibold text-white mb-3">Sales by category</h2>
          {(data.salesByCategory || []).length === 0 ? (
            <p className="text-muted text-sm">No data</p>
          ) : (
            (data.salesByCategory || []).map((r, i) => (
              <div key={i} className="text-xs border-b border-[#262626] py-2 text-muted last:border-b-0">
                {r.category} · {r.products} products
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
