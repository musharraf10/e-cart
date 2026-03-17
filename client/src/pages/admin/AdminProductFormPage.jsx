import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/client.js";

const emptyVariant = { size: "", color: "", stock: "0", price: "", sku: "" };

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  originalPrice: "",
  variants: [emptyVariant],
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
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
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

      setForm({
        name: product.name || "",
        slug: product.slug || "",
        description: product.description || "",
        price: String(product.price ?? ""),
        originalPrice: product.originalPrice ? String(product.originalPrice) : "",
        variants: (product.variants || []).length
          ? product.variants.map((variant) => ({
              size: variant.size || "",
              color: variant.color || "",
              stock: String(variant.stock ?? 0),
              price: String(variant.price ?? ""),
              sku: variant.sku || "",
            }))
          : [emptyVariant],
        category: typeof product.category === "object" ? product.category?._id : product.category || "",
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

  const setVariantField = (index, key, value) => {
    const next = [...form.variants];
    next[index] = { ...next[index], [key]: value };
    setForm({ ...form, variants: next });
  };

  const addVariantRow = () => setForm({ ...form, variants: [...form.variants, emptyVariant] });

  const removeVariantRow = (index) => {
    const next = form.variants.filter((_, idx) => idx !== index);
    setForm({ ...form, variants: next.length ? next : [emptyVariant] });
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
      variants: form.variants
        .map((variant) => ({
          size: variant.size.trim(),
          color: variant.color.trim(),
          stock: Number(variant.stock),
          price: Number(variant.price),
          sku: variant.sku.trim(),
        }))
        .filter((variant) => variant.size && variant.color && variant.sku),
      category: form.category || undefined,
      images: form.images.map((img) => img.trim()).filter(Boolean),
      isVisible: form.visible,
      isNewDrop: form.newDrop,
    };

    try {
      if (isEdit) {
        await api.put(`/admin/products/${editId}`, payload);
      } else {
        await api.post("/admin/products", payload);
      }
      navigate("/admin/products");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const trimmedName = newCategoryName.trim();
    if (!trimmedName) return;

    setCreatingCategory(true);
    try {
      const { data } = await api.post("/admin/categories", { name: trimmedName });
      setCategories((prev) => [...prev, data]);
      setForm((prev) => ({ ...prev, category: data._id }));
      setShowCreateCategoryModal(false);
      setNewCategoryName("");
      setShowCategoryMenu(false);
      setCategorySearch("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create category");
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-card rounded-xl border border-[#262626] p-6 space-y-4">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-3">
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
          <input required placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
          <input required type="number" placeholder="Base Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
          <input type="number" placeholder="Original Price" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
        </div>

        <textarea required rows={4} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />

        <div className="relative">
          <p className="text-sm font-medium mb-2">Category</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <button type="button" onClick={() => setShowCategoryMenu((prev) => !prev)} className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-left text-sm text-white">
              {selectedCategory?.name || "Select category"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateCategoryModal(true)}
              className="rounded-lg border border-[#d4af37] px-3 py-2 text-sm font-medium text-[#d4af37] hover:bg-[#d4af37]/10 sm:whitespace-nowrap"
            >
              + Add Category
            </button>
          </div>
          {showCategoryMenu && (
            <div className="absolute z-10 mt-1 w-full border border-[#262626] rounded-lg bg-card p-2 space-y-2">
              <input placeholder="Search category..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white" />
              <div className="max-h-44 overflow-auto">
                {filteredCategories.map((category) => (
                  <button key={category._id} type="button" onClick={() => { setForm({ ...form, category: category._id }); setShowCategoryMenu(false); setCategorySearch(""); }} className="w-full text-left px-2 py-2 rounded hover:bg-[#262626] text-sm text-white">
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Variants</p>
            <button type="button" onClick={addVariantRow} className="text-xs px-2 py-1 border border-[#262626] rounded-full text-white hover:bg-[#262626]">Add variant</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-2">Size</th><th>Color</th><th>Price</th><th>Stock</th><th>SKU</th><th></th>
                </tr>
              </thead>
              <tbody>
                {form.variants.map((variant, idx) => (
                  <tr key={`${idx}-${variant.sku}`} className="border-t border-[#262626]">
                    <td><input value={variant.size} onChange={(e) => setVariantField(idx, "size", e.target.value)} className="w-full rounded border border-[#262626] bg-primary px-2 py-1.5 text-white" /></td>
                    <td><input value={variant.color} onChange={(e) => setVariantField(idx, "color", e.target.value)} className="w-full rounded border border-[#262626] bg-primary px-2 py-1.5 text-white" /></td>
                    <td><input type="number" value={variant.price} onChange={(e) => setVariantField(idx, "price", e.target.value)} className="w-full rounded border border-[#262626] bg-primary px-2 py-1.5 text-white" /></td>
                    <td><input type="number" value={variant.stock} onChange={(e) => setVariantField(idx, "stock", e.target.value)} className="w-full rounded border border-[#262626] bg-primary px-2 py-1.5 text-white" /></td>
                    <td><input value={variant.sku} onChange={(e) => setVariantField(idx, "sku", e.target.value)} className="w-full rounded border border-[#262626] bg-primary px-2 py-1.5 text-white" /></td>
                    <td><button type="button" onClick={() => removeVariantRow(idx)} className="text-xs text-red-400">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Image URLs</p>
          {form.images.map((url, idx) => (
            <div key={`${idx}-${url}`} className="flex gap-2">
              <input placeholder="https://..." value={url} onChange={(e) => setImageAt(idx, e.target.value)} className="flex-1 rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
            </div>
          ))}
        </div>


        <div className="grid md:grid-cols-2 gap-3">
          <label className="flex items-center justify-between border border-[#262626] rounded-lg px-3 py-2 text-sm text-white">
            <span>Visible</span>
            <input type="checkbox" checked={form.visible} onChange={(e) => setForm({ ...form, visible: e.target.checked })} />
          </label>
          <label className="flex items-center justify-between border border-[#262626] rounded-lg px-3 py-2 text-sm text-white">
            <span>New Drop</span>
            <input type="checkbox" checked={form.newDrop} onChange={(e) => setForm({ ...form, newDrop: e.target.checked })} />
          </label>
        </div>

        <button disabled={submitting} type="submit" className="w-full rounded-xl bg-accent text-primary py-2.5 font-semibold disabled:opacity-50">
          {submitting ? "Saving..." : isEdit ? "Update product" : "Create product"}
        </button>
      </form>

      {showCreateCategoryModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-xl border border-[#262626] bg-[#171717] p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Create category</h2>
            <form className="mt-4 space-y-4" onSubmit={handleCreateCategory}>
              <input
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="w-full rounded-lg border border-[#262626] bg-[#171717] px-3 py-2 text-white"
              />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateCategoryModal(false);
                    setNewCategoryName("");
                  }}
                  className="rounded-lg border border-[#262626] px-4 py-2 text-sm text-white hover:bg-[#262626]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCategory}
                  className="rounded-lg border border-[#d4af37] bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black disabled:opacity-70"
                >
                  {creatingCategory ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
