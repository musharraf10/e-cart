import { useEffect, useState } from "react";
import api from "../../api/client.js";

const empty = { fullName: "", phoneNumber: "", addressLine1: "", addressLine2: "", city: "", state: "", postalCode: "", country: "", isDefault: false };

export function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get("/users/addresses").then(({ data }) => setAddresses(data));
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.put(`/users/addresses/${editingId}`, form);
    else await api.post("/users/addresses", form);
    setForm(empty);
    setEditingId(null);
    setShowForm(false);
    load();
  };

  const startEdit = (a) => {
    setEditingId(a._id);
    setForm({ ...a });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Addresses</h1>
          <p className="text-[#a1a1aa] text-sm mt-1">Manage your delivery addresses</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 rounded-xl bg-[#d4af37] text-white text-sm font-semibold hover:bg-[#ff7a1a] transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
          >
            Add Address
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
          <h2 className="text-white text-lg font-semibold mb-6">
            {editingId ? "Update Address" : "Add New Address"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
                Full Name
              </label>
              <input
                className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="Full Name"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
                Phone Number
              </label>
              <input
                className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="Phone Number"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
                Address Line 1
              </label>
              <input
                className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="Street Address"
                value={form.addressLine1}
                onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
                Address Line 2 (Optional)
              </label>
              <input
                className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="Apartment, Suite, etc."
                value={form.addressLine2}
                onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
                City
              </label>
              <input
                className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
                State/Province
              </label>
              <input
                className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="State/Province"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
                Postal Code
              </label>
              <input
                className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="Postal Code"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
                Country
              </label>
              <input
                className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors"
                placeholder="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="w-4 h-4 rounded border-[#262626] bg-[#0f0f0f] cursor-pointer"
              />
              <label htmlFor="isDefault" className="text-white text-sm cursor-pointer">
                Set as default address
              </label>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 rounded-xl bg-[#d4af37] text-white text-sm font-semibold hover:bg-[#ff7a1a] transition-all duration-200 shadow-lg shadow-[#d4af37]/20"
            >
              {editingId ? "Update Address" : "Add Address"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(empty);
              }}
              className="px-6 py-3.5 rounded-xl bg-[#262626] text-white text-sm font-medium hover:bg-[#303030] transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {addresses.map((a) => (
          <div key={a._id} className="bg-[#171717] border border-[#262626] rounded-2xl p-6 shadow-xl hover:border-[#d4af37] transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-white font-semibold text-lg">{a.fullName}</h3>
                {a.isDefault && (
                  <span className="inline-block mt-1 px-2 py-1 rounded-full bg-[#d4af37] text-white text-xs font-medium">
                    Default
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm mb-6">
              <p className="text-white">{a.addressLine1}</p>
              {a.addressLine2 && <p className="text-white">{a.addressLine2}</p>}
              <p className="text-[#a1a1aa]">
                {a.city}, {a.state} {a.postalCode}
              </p>
              <p className="text-[#a1a1aa]">{a.country}</p>
              <p className="text-[#a1a1aa] font-medium pt-2">{a.phoneNumber}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => startEdit(a)}
                className="flex-1 px-4 py-2 rounded-lg bg-[#262626] text-white text-sm font-medium hover:bg-[#303030] transition-all duration-200"
              >
                Edit
              </button>
              <button
                onClick={() => api.delete(`/users/addresses/${a._id}`).then(load)}
                className="flex-1 px-4 py-2 rounded-lg bg-[#262626] text-white text-sm font-medium hover:bg-red-900/30 hover:text-red-400 transition-all duration-200"
              >
                Delete
              </button>
              {!a.isDefault && (
                <button
                  onClick={() =>
                    api.put(`/users/addresses/${a._id}`, { ...a, isDefault: true }).then(load)
                  }
                  className="flex-1 px-4 py-2 rounded-lg bg-[#d4af37] text-white text-sm font-medium hover:bg-[#ff7a1a] transition-all duration-200"
                >
                  Set Default
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="bg-[#171717] border border-[#262626] rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📍</div>
          <h3 className="text-white text-lg font-semibold mb-2">No addresses yet</h3>
          <p className="text-[#a1a1aa] text-sm">Add your first address to get started</p>
        </div>
      )}
    </div>
  );
}
