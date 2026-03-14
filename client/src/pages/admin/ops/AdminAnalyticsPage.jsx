import { useEffect, useState } from "react";
import api from "../../../api/client.js";

function toCsv(rows) {
  if (!rows.length) return "";
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
  useEffect(()=>{ api.get('/admin/analytics').then(({data})=>setData(data)); },[]);
  if (!data) return <div className="text-sm text-gray-500">Loading analytics...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Analytics & Reports</h1>
      <div className="flex gap-2 text-xs">
        <button className="border rounded-full px-3 py-1" onClick={()=>download('sales-by-product.csv',toCsv(data.salesByProduct))}>Export CSV (Products)</button>
        <button className="border rounded-full px-3 py-1" onClick={()=>download('daily-revenue.csv',toCsv(data.dailyRevenue))}>Export CSV (Daily Revenue)</button>
        <button className="border rounded-full px-3 py-1" onClick={()=>download('monthly-revenue.xls',toCsv(data.monthlyRevenue))}>Export Excel</button>
      </div>
      <div className="grid xl:grid-cols-2 gap-4 text-sm">
        <div className="bg-white rounded-xl p-3 shadow-sm"><h2 className="font-semibold mb-2">Sales by product</h2>{data.salesByProduct.map((r,i)=><div key={i} className="text-xs border-b py-1">{r._id} · qty {r.qty} · ${r.revenue.toFixed(2)}</div>)}</div>
        <div className="bg-white rounded-xl p-3 shadow-sm"><h2 className="font-semibold mb-2">Sales by category</h2>{data.salesByCategory.map((r,i)=><div key={i} className="text-xs border-b py-1">{r.category} · {r.products} products</div>)}</div>
      </div>
    </div>
  );
}
