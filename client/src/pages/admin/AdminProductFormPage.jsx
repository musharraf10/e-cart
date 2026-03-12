import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client.js";

const sizeOptions = ["S", "M", "L", "XL"];

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  originalPrice: "",
  sizes: [],
  colors: "",
  stock: "0",
  category: "",
  images: [""],
  visible: true,
  newDrop: false,
};

export function AdminProductFormPage() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEdit = Boolean(editId);

  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [categories, setCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const title = useMemo(() => (isEdit ? "Edit product" : "Create product"), [isEdit]);

  useEffect(() => {
    api.get("/admin/categories").then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    if (!isEdit) return;

    api.get("/admin/products").then(({ data }) => {
      const product = data.find((p) => p._id === editId);
      if (!product) {
        alert("Product not found");
        navigate("/admin/products");
        return;
      }

      const categoryId =
        typeof product.category === "object" ? product.category?._id : product.category;

      setForm({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price: String(product.price ?? ""),
        originalPrice: product.originalPrice ? String(product.originalPrice) : "",
        sizes: product.sizes || [],
        colors: (product.colors || []).join(", "),
        stock: String(product.inventoryCount ?? 0),
        category: categoryId || "",
        category: product.category || "",
        images: product.images?.length ? product.images : [""],
        visible: product.isVisible ?? true,
        newDrop: product.isNewDrop ?? false,
      });
    });
  }, [editId, isEdit, navigate]);

  const selectedCategory = categories.find((category) => category._id === form.category);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const setImageAt = (index, value) => {
    const next = [...form.images];
    next[index] = value;
    setForm({ ...form, images: next });
  };

  const addImageField = () => setForm({ ...form, images: [...form.images, ""] });

  const removeImageField = (index) => {
    const next = form.images.filter((_, idx) => idx !== index);
    setForm({ ...form, images: next.length ? next : [""] });
  };

  const toggleSize = (size) => {
    const sizes = form.sizes.includes(size)
      ? form.sizes.filter((s) => s !== size)
      : [...form.sizes, size];
    setForm({ ...form, sizes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      sizes: form.sizes,
      colors: form.colors
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      inventoryCount: Number(form.stock),
      inStock: Number(form.stock) > 0,
      category: form.category || undefined,
      images: form.images.map((img) => img.trim()).filter(Boolean),
      isVisible: form.visible,
      isNewDrop: form.newDrop,
    };

    try {
      if (isEdit) {
        await api.put(`/admin/products/${editId}`, payload);
        alert("Product updated successfully");
      } else {
        await api.post("/admin/products", payload);
        alert("Product created successfully");
      }
      navigate("/admin/products");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl p-5 shadow-sm space-y-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            required
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            required
            placeholder="Slug"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <textarea
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />

        <div className="grid md:grid-cols-3 gap-3">
          <input
            required
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Original Price"
            value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
          <input
            required
            type="number"
            min="0"
            placeholder="Stock"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="border rounded-lg px-3 py-2"
          />
        </div>

        <div className="relative">
          <p className="text-sm font-medium mb-2">Category</p>
          <button
            type="button"
            onClick={() => setShowCategoryMenu((prev) => !prev)}
            className="w-full border rounded-lg px-3 py-2 text-left text-sm"
          >
            {selectedCategory?.name || "Select category"}
          </button>

          {showCategoryMenu && (
            <div className="absolute z-10 mt-1 w-full border rounded-lg bg-white shadow-lg p-2 space-y-2">
              <input
                placeholder="Search category..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <div className="max-h-44 overflow-auto">
                {filteredCategories.map((category) => (
                  <button
                    key={category._id}
                    type="button"
                    onClick={() => {
                      setForm({ ...form, category: category._id });
                      setShowCategoryMenu(false);
                      setCategorySearch("");
                    }}
                    className="w-full text-left px-2 py-2 rounded hover:bg-gray-100 text-sm"
                  >
                    {category.name}
                  </button>
                ))}
                {filteredCategories.length === 0 && (
                  <p className="px-2 py-2 text-xs text-gray-500">No categories found.</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Sizes</p>
          <div className="flex gap-2 flex-wrap">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSize(size)}
                className={`px-3 py-1 rounded-full border text-sm ${
                  form.sizes.includes(size)
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <input
          placeholder="Colors (comma separated)"
          value={form.colors}
          onChange={(e) => setForm({ ...form, colors: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Image URLs</p>
            <button
              type="button"
              onClick={addImageField}
              className="text-xs px-2 py-1 border rounded-full"
            >
              Add image
            </button>
          </div>
          {form.images.map((url, idx) => (
            <div key={`${idx}-${url}`} className="flex gap-2">
              <input
                placeholder="https://..."
                value={url}
                onChange={(e) => setImageAt(idx, e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2"
              />
              <button
                type="button"
                onClick={() => removeImageField(idx)}
                className="px-2 py-1 border rounded-lg text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
            <span>Visible</span>
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm({ ...form, visible: e.target.checked })}
            />
          </label>
          <label className="flex items-center justify-between border rounded-lg px-3 py-2 text-sm">
            <span>New Drop</span>
            <input
              type="checkbox"
              checked={form.newDrop}
              onChange={(e) => setForm({ ...form, newDrop: e.target.checked })}
            />
          </label>
        </div>

        <button
          disabled={submitting}
          type="submit"
          className="w-full rounded-full bg-gray-900 text-white py-2 font-semibold"
        >
          {submitting ? "Saving..." : isEdit ? "Update product" : "Create product"}
        </button>
      </form>
    </div>
  );
}
