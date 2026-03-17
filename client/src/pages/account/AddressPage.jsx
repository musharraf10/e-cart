import { useEffect, useState } from "react";
import api from "../../api/client.js";

const empty = {
  fullName: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "India",
  isDefault: false,
};

export function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [postOffices, setPostOffices] = useState([]);

  const load = () =>
    api.get("/users/addresses").then(({ data }) => setAddresses(data));

  useEffect(() => {
    load();
  }, []);

  const handlePincodeChange = async (value) => {
    if (!/^\d*$/.test(value)) return;

    setForm((prev) => ({ ...prev, postalCode: value }));

    if (value.length === 6) {
      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${value}`
        );

        const data = await res.json();

        if (data[0].Status === "Success") {
          const offices = data[0].PostOffice;

          setPostOffices(offices);

          setForm((prev) => ({
            ...prev,
            state: offices[0].State,
            country: offices[0].Country,
          }));
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await api.put(`/users/addresses/${editingId}`, form);
    } else {
      await api.post("/users/addresses", form);
    }

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

  const inputStyle =
    "w-full bg-primary border border-border rounded-xl px-4 py-3 text-white text-sm placeholder-muted focus:outline-none focus:border-accent transition";

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Addresses</h1>
          <p className="text-muted text-sm mt-1">
            Manage your delivery addresses
          </p>
        </div>

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 rounded-xl bg-accent text-primary text-sm font-semibold shadow-accent-glow"
          >
            Add Address
          </button>
        )}
      </div>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={submit}
          className="bg-card border border-border rounded-xl p-8 shadow-card"
        >
          <h2 className="text-white text-lg font-semibold mb-6">
            {editingId ? "Update Address" : "Add New Address"}
          </h2>

          <div className="grid md:grid-cols-2 gap-5">

            {/* FULL NAME */}
            <input
              className={inputStyle}
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              required
            />

            {/* PHONE */}
            <input
              className={inputStyle}
              placeholder="Phone Number"
              maxLength="10"
              value={form.phoneNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setForm({ ...form, phoneNumber: val });
              }}
              required
            />

            {/* ADDRESS LINE 1 */}
            <input
              className={`${inputStyle} md:col-span-2`}
              placeholder="Street Address"
              value={form.addressLine1}
              onChange={(e) =>
                setForm({ ...form, addressLine1: e.target.value })
              }
              required
            />

            {/* ADDRESS LINE 2 */}
            <input
              className={`${inputStyle} md:col-span-2`}
              placeholder="Apartment, Suite, etc."
              value={form.addressLine2}
              onChange={(e) =>
                setForm({ ...form, addressLine2: e.target.value })
              }
            />

            {/* PINCODE */}
            <input
              className={inputStyle}
              placeholder="Postal Code"
              maxLength="6"
              value={form.postalCode}
              onChange={(e) =>
                handlePincodeChange(e.target.value)
              }
              required
            />

            {/* CITY */}
            <select
              className={inputStyle}
              value={form.city}
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
            >
              <option value="">Select Post Office / Village</option>

              {postOffices.map((office) => (
                <option key={office.Name} value={office.Name}>
                  {office.Name}
                </option>
              ))}
            </select>

            {/* STATE */}
            <input
              className={inputStyle}
              placeholder="State"
              value={form.state}
              onChange={(e) =>
                setForm({ ...form, state: e.target.value })
              }
            />

            {/* COUNTRY */}
            <input
              className={inputStyle}
              placeholder="Country"
              value={form.country}
              onChange={(e) =>
                setForm({ ...form, country: e.target.value })
              }
            />

            {/* DEFAULT ADDRESS */}
            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm({ ...form, isDefault: e.target.checked })
                }
              />
              <label className="text-white text-sm">
                Set as default address
              </label>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="px-10 py-3 rounded-xl bg-accent text-primary font-semibold shadow-accent-glow"
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
              className="px-8 py-3 rounded-xl bg-border text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ADDRESS LIST */}
      <div className="grid md:grid-cols-2 gap-6">
        {addresses.map((a) => (
          <div
            key={a._id}
            className="bg-card border border-border rounded-xl p-6 shadow-card"
          >
            <h3 className="text-white font-semibold">{a.fullName}</h3>

            <p className="text-muted mt-2">{a.addressLine1}</p>
            {a.addressLine2 && (
              <p className="text-muted">{a.addressLine2}</p>
            )}

            <p className="text-muted">
              {a.city}, {a.state} {a.postalCode}
            </p>

            <p className="text-muted">{a.country}</p>
            <p className="text-muted mt-2">{a.phoneNumber}</p>

            <div className="flex gap-3 mt-4">

              <button
                onClick={() => startEdit(a)}
                className="px-4 py-2 rounded-lg bg-border text-white text-sm"
              >
                Edit
              </button>

              <button
                onClick={() =>
                  api.delete(`/users/addresses/${a._id}`).then(load)
                }
                className="px-4 py-2 rounded-lg bg-border text-white text-sm"
              >
                Delete
              </button>

              {!a.isDefault && (
                <button
                  onClick={() =>
                    api
                      .put(`/users/addresses/${a._id}`, {
                        ...a,
                        isDefault: true,
                      })
                      .then(load)
                  }
                  className="px-4 py-2 rounded-lg bg-accent text-primary text-sm"
                >
                  Set Default
                </button>
              )}

            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="text-5xl mb-3">📍</div>
          <h3 className="text-white font-semibold">
            No addresses yet
          </h3>
          <p className="text-muted text-sm">
            Add your first address
          </p>
        </div>
      )}
    </div>
  );
}