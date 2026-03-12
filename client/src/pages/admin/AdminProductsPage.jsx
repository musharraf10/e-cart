import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../api/client.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  originalPrice: "",
  images: "",
  sizes: "",
  colors: "",
};

export function AdminProductsPage() {
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    load();
  }, [user, navigate]);

  const load = async () => {
    const { data } = await api.get("/admin/products");
    setProducts(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      images: form.images ? form.images.split(",").map((s) => s.trim()) : [],
      sizes: form.sizes ? form.sizes.split(",").map((s) => s.trim()) : [],
      colors: form.colors ? form.colors.split(",").map((s) => s.trim()) : [],
    };
    if (editingId) {
      await api.put(`/admin/products/${editingId}`, payload);
    } else {
      await api.post("/admin/products", payload);
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      originalPrice: p.originalPrice ? String(p.originalPrice) : "",
      images: (p.images || []).join(", "),
      sizes: (p.sizes || []).join(", "),
      colors: (p.colors || []).join(", "),
    });
  };

  const toggleVisibility = async (p) => {
    await api.patch(`/admin/products/${p._id}/visibility`);
    load();
  };

  const toggleNewDrop = async (p) => {
    await api.patch(`/admin/products/${p._id}/new-drop`);
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await api.delete(`/admin/products/${id}`);
    load();
  };

  return (
    <div className="grid md:grid-cols-[2fr,1.5fr] gap-6">
      <section className="space-y-3">
        <h1 className="text-xl font-semibold">Products</h1>
        <div className="space-y-2">
          {products.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-xs text-gray-500">
                  ${p.price.toFixed(2)} · {p.isVisible ? "Visible" : "Hidden"} ·{" "}
                  {p.isNewDrop ? "New drop" : "Core"}
                </p>
              </div>
              <div className="flex gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => toggleVisibility(p)}
                  className="px-2 py-1 rounded-full border border-gray-300"
                >
                  {p.isVisible ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => toggleNewDrop(p)}
                  className="px-2 py-1 rounded-full border border-gray-300"
                >
                  {p.isNewDrop ? "Core" : "New drop"}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="px-2 py-1 rounded-full border border-gray-300"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(p._id)}
                  className="px-2 py-1 rounded-full border border-red-200 text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-xs text-gray-500">No products yet.</p>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl p-4 shadow-sm text-sm space-y-3">
        <h2 className="text-sm font-semibold">
          {editingId ? "Edit product" : "Create product"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
            <input
              placeholder="Original price"
              value={form.originalPrice}
              onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
              className="border rounded-lg px-3 py-2"
            />
          </div>
          <input
            placeholder="Image URLs (comma separated)"
            value={form.images}
            onChange={(e) => setForm({ ...form, images: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            placeholder="Sizes (e.g. XS,S,M,L)"
            value={form.sizes}
            onChange={(e) => setForm({ ...form, sizes: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            placeholder="Colors (e.g. Black,Olive)"
            value={form.colors}
            onChange={(e) => setForm({ ...form, colors: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
          <button
            type="submit"
            className="w-full rounded-full bg-gray-900 text-white font-semibold py-2 text-sm"
          >
            {editingId ? "Save changes" : "Create product"}
          </button>
        </form>
      </section>
    </div>
  );
}

