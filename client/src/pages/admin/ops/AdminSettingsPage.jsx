import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../../api/client.js";

export function AdminSettingsPage() {
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get("/admin/home-sections").then(({ data }) => setSections(data || []));
  }, []);

  const moveSection = (index, direction) => {
    const next = [...sections];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next.map((item, i) => ({ ...item, order: i + 1 })));
  };

  const toggleSection = (key) => {
    setSections((prev) => prev.map((item) => (item.key === key ? { ...item, isActive: !item.isActive } : item)));
  };

  const save = async () => {
    setSaving(true);
    const { data } = await api.put("/admin/home-sections", { sections });
    setSections(data || []);
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Homepage Sections</h1>

      <div className="surface-card p-4">
        <p className="mb-4 text-sm text-text-muted">Enable/disable homepage blocks and change their order.</p>
        <div className="space-y-2">
          {sections.map((section, index) => (
            <div key={section.key} className="flex items-center justify-between rounded-xl border border-border-subtle p-3">
              <div>
                <p className="font-medium">{section.label}</p>
                <p className="text-xs text-text-muted">key: {section.key}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => moveSection(index, -1)} className="rounded-lg border border-border-subtle px-2 py-1 text-xs">↑</button>
                <button type="button" onClick={() => moveSection(index, 1)} className="rounded-lg border border-border-subtle px-2 py-1 text-xs">↓</button>
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className={`rounded-lg px-2.5 py-1 text-xs ${section.isActive ? "bg-accent text-bg-primary" : "border border-border-subtle"}`}
                >
                  {section.isActive ? "Enabled" : "Disabled"}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={save} className="mt-4 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-bg-primary" disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </motion.div>
  );
}
