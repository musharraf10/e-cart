import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";
import { useToast } from "../../../components/ui/ToastProvider.jsx";

const DEFAULT_ROW = { size: "", chest: "", waist: "", hip: "", length: "" };

export function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "NoorFit",
    contactEmail: "support@noorfit.com",
    shippingFee: 5,
    taxPercentage: 5,
    currency: "USD",
    sizeChartUnit: "in",
    sizeChartNotes: "",
    sizeChartRows: [{ ...DEFAULT_ROW }],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { notify } = useToast();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/admin/settings");
        setSettings({
          storeName: data.storeName || "NoorFit",
          contactEmail: data.contactEmail || "support@noorfit.com",
          shippingFee: Number(data.shippingFee || 0),
          taxPercentage: Number(data.taxPercentage || 0),
          currency: data.currency || "USD",
          sizeChartUnit: data.sizeChartUnit || "in",
          sizeChartNotes: data.sizeChartNotes || "",
          sizeChartRows: data.sizeChartRows?.length ? data.sizeChartRows : [{ ...DEFAULT_ROW }],
        });
      } catch {
        notify("Failed to load settings", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [notify]);

  const updateRow = (index, key, value) => {
    setSettings((prev) => ({
      ...prev,
      sizeChartRows: prev.sizeChartRows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    }));
  };

  if (loading) {
    return <div className="h-60 animate-pulse rounded-xl border border-[#262626] bg-card" />;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">Admin Settings</h1>
      <form
        className="bg-card rounded-xl border border-[#262626] p-6 grid gap-4 text-sm"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            const payload = {
              ...settings,
              sizeChartRows: settings.sizeChartRows.filter((row) => String(row.size || "").trim()),
            };
            const { data } = await api.put("/admin/settings", payload);
            setSettings({
              storeName: data.storeName || "NoorFit",
              contactEmail: data.contactEmail || "support@noorfit.com",
              shippingFee: Number(data.shippingFee || 0),
              taxPercentage: Number(data.taxPercentage || 0),
              currency: data.currency || "USD",
              sizeChartUnit: data.sizeChartUnit || "in",
              sizeChartNotes: data.sizeChartNotes || "",
              sizeChartRows: data.sizeChartRows?.length ? data.sizeChartRows : [{ ...DEFAULT_ROW }],
            });
            notify("Settings saved");
          } catch {
            notify("Failed to save settings", "error");
          } finally {
            setSaving(false);
          }
        }}
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2.5 text-white placeholder-muted focus:outline-none focus:border-accent"
            value={settings.storeName}
            onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
            placeholder="Store name"
          />
          <input
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2.5 text-white placeholder-muted focus:outline-none focus:border-accent"
            type="email"
            value={settings.contactEmail}
            onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
            placeholder="Contact email"
          />
          <input
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2.5 text-white placeholder-muted focus:outline-none focus:border-accent"
            type="number"
            value={settings.shippingFee}
            onChange={(e) => setSettings({ ...settings, shippingFee: Number(e.target.value) })}
            placeholder="Shipping fee"
          />
          <input
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2.5 text-white placeholder-muted focus:outline-none focus:border-accent"
            type="number"
            value={settings.taxPercentage}
            onChange={(e) => setSettings({ ...settings, taxPercentage: Number(e.target.value) })}
            placeholder="Tax %"
          />
          <input
            className="rounded-xl border border-[#262626] bg-primary px-3 py-2.5 text-white placeholder-muted focus:outline-none focus:border-accent"
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            placeholder="Currency"
          />
        </div>

        <div className="space-y-3 rounded-xl border border-[#262626] bg-[#151515] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white">Global Size Chart</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted">Unit</span>
              <select
                value={settings.sizeChartUnit}
                onChange={(e) => setSettings({ ...settings, sizeChartUnit: e.target.value })}
                className="rounded-lg border border-[#262626] bg-primary px-2 py-1 text-white"
              >
                <option value="in">Inches (in)</option>
                <option value="cm">Centimeters (cm)</option>
              </select>
            </div>
          </div>

          {settings.sizeChartRows.map((row, index) => (
            <div key={`size-row-${index}`} className="grid grid-cols-2 gap-2 sm:grid-cols-6">
              <input className="rounded-lg border border-[#262626] bg-primary px-2 py-2 text-white" placeholder="Size" value={row.size || ""} onChange={(e) => updateRow(index, "size", e.target.value)} />
              <input type="number" className="rounded-lg border border-[#262626] bg-primary px-2 py-2 text-white" placeholder="Chest" value={row.chest ?? ""} onChange={(e) => updateRow(index, "chest", e.target.value)} />
              <input type="number" className="rounded-lg border border-[#262626] bg-primary px-2 py-2 text-white" placeholder="Waist" value={row.waist ?? ""} onChange={(e) => updateRow(index, "waist", e.target.value)} />
              <input type="number" className="rounded-lg border border-[#262626] bg-primary px-2 py-2 text-white" placeholder="Hip" value={row.hip ?? ""} onChange={(e) => updateRow(index, "hip", e.target.value)} />
              <input type="number" className="rounded-lg border border-[#262626] bg-primary px-2 py-2 text-white" placeholder="Length" value={row.length ?? ""} onChange={(e) => updateRow(index, "length", e.target.value)} />
              <button
                type="button"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    sizeChartRows: prev.sizeChartRows.filter((_, rowIndex) => rowIndex !== index),
                  }))
                }
                className="rounded-lg border border-[#432323] px-2 py-2 text-red-300 hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setSettings((prev) => ({ ...prev, sizeChartRows: [...prev.sizeChartRows, { ...DEFAULT_ROW }] }))}
            className="rounded-lg border border-[#2f2f2f] px-3 py-2 text-xs text-white hover:bg-[#202020]"
          >
            + Add size row
          </button>

          <textarea
            className="min-h-[72px] w-full rounded-xl border border-[#262626] bg-primary px-3 py-2 text-white placeholder-muted focus:outline-none focus:border-accent"
            placeholder="Size chart notes (optional)"
            value={settings.sizeChartNotes}
            onChange={(e) => setSettings({ ...settings, sizeChartNotes: e.target.value })}
          />
        </div>

        <button disabled={saving} className="rounded-xl bg-accent text-primary py-2.5 font-medium hover:opacity-90 disabled:opacity-60">
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </motion.div>
  );
}
