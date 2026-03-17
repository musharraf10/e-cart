import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import api from "../../api/client.js";

const createVariant = () => ({
  id: `variant-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  size: "",
  color: "",
  stock: "0",
  price: "",
  sku: "",
});

const defaultForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  originalPrice: "",
  variants: [createVariant()],
  category: "",
  images: [""],
  visible: true,
  newDrop: false,
};

const normalizeVariants = (variants = []) => {
  if (!variants.length) return [createVariant()];
  return variants.map((variant) => ({
    id: variant._id || variant.id || `variant-${variant.sku || Math.random().toString(16).slice(2)}`,
    size: variant.size || "",
    color: variant.color || "",
    stock: String(variant.stock ?? 0),
    price: String(variant.price ?? ""),
    sku: variant.sku || "",
  }));
};

export function AdminProductFormPage() {
  const [searchParams] = useSearchParams();
  const { id: routeProductId } = useParams();
  const editId = routeProductId || searchParams.get("edit");
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
    api.get("/admin/categories").then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    if (!isEdit || !editId) return;

    api
      .get(`/admin/products/${editId}`)
      .then(({ data: product }) => {
        setForm({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          price: String(product.price ?? ""),
          originalPrice: product.originalPrice ? String(product.originalPrice) : "",
          variants: normalizeVariants(product.variants),
          category:
            typeof product.category === "object"
              ? product.category?._id || ""
              : product.category || "",
          images: product.images?.length ? product.images : [""],
          visible: product.isVisible ?? true,
          newDrop: product.isNewDrop ?? false,
        });
      })
      .catch(() => {
        alert("Product not found");
        navigate("/admin/products");
      });
  }, [editId, isEdit, navigate]);

  const selectedCategory = categories.find((category) => category._id === form.category);
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  const updateFormField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setVariantField = (variantId, key, value) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant) =>
        variant.id === variantId ? { ...variant, [key]: value } : variant,
      ),
    }));
  };

  const addVariantRow = () => {
    setForm((prev) => ({ ...prev, variants: [...prev.variants, createVariant()] }));
  };

  const removeVariantRow = (variantId) => {
    setForm((prev) => {
      const nextVariants = prev.variants.filter((variant) => variant.id !== variantId);
      return { ...prev, variants: nextVariants.length ? nextVariants : [createVariant()] };
    });
  };

  const setImageAt = (index, value) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.map((img, imgIndex) => (imgIndex === index ? value : img)),
    }));
  };

  const addImageField = () => {
    setForm((prev) => ({ ...prev, images: [...prev.images, ""] }));
  };

  const removeImageField = (index) => {
    setForm((prev) => {
      const nextImages = prev.images.filter((_, imgIndex) => imgIndex !== index);
      return { ...prev, images: nextImages.length ? nextImages : [""] };
    });
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
      updateFormField("category", data._id);
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
          <input required placeholder="Name" value={form.name} onChange={(e) => updateFormField("name", e.target.value)} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
          <input required placeholder="Slug" value={form.slug} onChange={(e) => updateFormField("slug", e.target.value)} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
        </div>

        <textarea required placeholder="Description" rows={4} value={form.description} onChange={(e) => updateFormField("description", e.target.value)} className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />

        <div className="grid md:grid-cols-2 gap-3">
          <input type="number" required min="0" placeholder="Base price" value={form.price} onChange={(e) => updateFormField("price", e.target.value)} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
          <input type="number" min="0" placeholder="Original price" value={form.originalPrice} onChange={(e) => updateFormField("originalPrice", e.target.value)} className="rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
        </div>

        <div className="relative">
          <label className="text-sm font-medium">Category</label>
          <div className="mt-1 flex gap-2">
            <button type="button" onClick={() => setShowCategoryMenu((prev) => !prev)} className="flex-1 rounded-lg border border-[#262626] bg-primary px-3 py-2 text-left text-sm text-white">
              {selectedCategory?.name || "Select category"}
            </button>
            <button type="button" onClick={() => setShowCreateCategoryModal(true)} className="rounded-lg border border-[#d4af37] px-3 py-2 text-sm font-medium text-[#d4af37] hover:bg-[#d4af37]/10 sm:whitespace-nowrap">
              + Add Category
            </button>
          </div>
          {showCategoryMenu && (
            <div className="absolute z-10 mt-1 w-full border border-[#262626] rounded-lg bg-card p-2 space-y-2">
              <input placeholder="Search category..." value={categorySearch} onChange={(e) => setCategorySearch(e.target.value)} className="w-full rounded-lg border border-[#262626] bg-primary px-3 py-2 text-sm text-white" />
              <div className="max-h-44 overflow-auto">
                {filteredCategories.map((category) => (
                  <button key={category._id} type="button" onClick={() => { updateFormField("category", category._id); setShowCategoryMenu(false); setCategorySearch(""); }} className="w-full text-left px-2 py-2 rounded hover:bg-[#262626] text-sm text-white">
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
                {form.variants.map((variant) => (
                  <tr key={variant.id} className="border-t border-[#262626]">
                    <td><input value={variant.size} onChange={(e) => setVariantField(variant.id, "size", e.target.value)} className="w-full rounded border border-[#262626] bg-primary px-2 py-1.5 text-white" /></td>
                    <td><input value={variant.color} onChange={(e) => setVariantField(variant.id, "color", e.target.value)} className="w-full rounded border border-[#262626] bg-primary px-2 py-1.5 text-white" /></td>
                    <td><input type="number" value={variant.price} onChange={(e) => setVariantField(variant.id, "price", e.target.value)} className="w-full rounded border border-[#262626] bg-primary px-2 py-1.5 text-white" /></td>
                    <td><input type="number" value={variant.stock} onChange={(e) => setVariantField(variant.id, "stock", e.target.value)} className="w-full rounded border border-[#262626] bg-primary px-2 py-1.5 text-white" /></td>
                    <td><input value={variant.sku} onChange={(e) => setVariantField(variant.id, "sku", e.target.value)} className="w-full rounded border border-[#262626] bg-primary px-2 py-1.5 text-white" /></td>
                    <td><button type="button" onClick={() => removeVariantRow(variant.id)} className="text-xs text-red-400">Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Image URLs</p>
            <button type="button" onClick={addImageField} className="text-xs px-2 py-1 border border-[#262626] rounded-full text-white hover:bg-[#262626]">+ Add Image</button>
          </div>
          {form.images.map((url, idx) => (
            <div key={`image-${idx}`} className="flex gap-2 items-center">
              <input placeholder="https://..." value={url} onChange={(e) => setImageAt(idx, e.target.value)} className="flex-1 rounded-lg border border-[#262626] bg-primary px-3 py-2 text-white" />
              <button type="button" onClick={() => removeImageField(idx)} className="text-xs text-red-400">Remove</button>
            </div>
          ))}
          <div className="flex gap-2 flex-wrap pt-2">
            {form.images.filter(Boolean).map((image) => (
              <img key={image} src={image} alt="Preview" className="h-14 w-14 rounded-md object-cover border border-[#262626]" />
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="flex items-center justify-between border border-[#262626] rounded-lg px-3 py-2 text-sm text-white">
            <span>Visible</span>
            <input type="checkbox" checked={form.visible} onChange={(e) => updateFormField("visible", e.target.checked)} />
          </label>
          <label className="flex items-center justify-between border border-[#262626] rounded-lg px-3 py-2 text-sm text-white">
            <span>New Drop</span>
            <input type="checkbox" checked={form.newDrop} onChange={(e) => updateFormField("newDrop", e.target.checked)} />
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
              <input required value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Category name" className="w-full rounded-lg border border-[#262626] bg-[#171717] px-3 py-2 text-white" />
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => { setShowCreateCategoryModal(false); setNewCategoryName(""); }} className="rounded-lg border border-[#262626] px-4 py-2 text-sm text-white hover:bg-[#262626]">
                  Cancel
                </button>
                <button type="submit" disabled={creatingCategory} className="rounded-lg border border-[#d4af37] bg-[#d4af37] px-4 py-2 text-sm font-semibold text-black disabled:opacity-70">
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
