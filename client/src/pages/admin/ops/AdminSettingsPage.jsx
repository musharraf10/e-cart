import { useState } from "react";

export function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: "NoorFit",
    contactEmail: "support@noorfit.com",
    shippingFee: 5,
    taxPercentage: 5,
    currency: "USD",
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Admin Settings</h1>
      <form className="bg-white rounded-xl p-4 shadow-sm grid sm:grid-cols-2 gap-3 text-sm" onSubmit={(e)=>{e.preventDefault(); alert('Settings saved (local demo)');}}>
        <input className="border rounded px-3 py-2" value={settings.storeName} onChange={(e)=>setSettings({...settings,storeName:e.target.value})} placeholder="Store name" />
        <input className="border rounded px-3 py-2" type="email" value={settings.contactEmail} onChange={(e)=>setSettings({...settings,contactEmail:e.target.value})} placeholder="Contact email" />
        <input className="border rounded px-3 py-2" type="number" value={settings.shippingFee} onChange={(e)=>setSettings({...settings,shippingFee:Number(e.target.value)})} placeholder="Shipping fee" />
        <input className="border rounded px-3 py-2" type="number" value={settings.taxPercentage} onChange={(e)=>setSettings({...settings,taxPercentage:Number(e.target.value)})} placeholder="Tax %" />
        <input className="border rounded px-3 py-2" value={settings.currency} onChange={(e)=>setSettings({...settings,currency:e.target.value})} placeholder="Currency" />
        <button className="rounded bg-gray-900 text-white">Save</button>
      </form>
    </div>
  );
}
