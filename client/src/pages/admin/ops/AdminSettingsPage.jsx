import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "../../../components/ui/ToastProvider.jsx";

export function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "NoorFit",
    contactEmail: "support@noorfit.com",
    shippingFee: 5,
    taxPercentage: 5,
    currency: "USD",
  });

  const { notify } = useToast();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-white">Admin Settings</h1>
      <form
        className="bg-card rounded-xl border border-[#262626] p-6 grid sm:grid-cols-2 gap-4 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          notify("Settings saved (local demo)");
        }}
      >
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
        <button className="sm:col-span-2 rounded-xl bg-accent text-primary py-2.5 font-medium hover:opacity-90">
          Save
        </button>
      </form>
    </motion.div>
  );
}
