import { useEffect, useState } from "react";
import api from "../api/client.js";
import { ProductCard } from "../components/products/ProductCard.jsx";

export function HomePage() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState({ sort: "newest" });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    const params = new URLSearchParams(filters).toString();
    const { data } = await api.get(`/products?${params}`);
    setProducts(data.items);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    const { data } = await api.get("/products/search", { params: { q } });
    setProducts(data.items);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-6 py-10 flex flex-col md:flex-row gap-6 items-center">
        <div className="space-y-3 max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">NoorFit</p>
          <h1 className="text-3xl md:text-4xl font-semibold">
            Crafted for Comfort. <span className="text-accent">Designed for Life.</span>
          </h1>
          <p className="text-sm text-gray-300">
            Discover elevated everyday pieces with tailored comfort, breathable fabrics, and
            clean silhouettes for life on the move.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 mt-4">
            <input
              type="search"
              placeholder="Search tees, joggers, hoodies…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="flex-1 rounded-full px-4 py-2 text-sm text-gray-900"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-accent text-xs font-semibold uppercase tracking-wide"
            >
              Search
            </button>
          </form>
        </div>
        <div className="hidden md:flex flex-1 justify-end">
          <div className="h-40 w-40 rounded-full bg-gradient-to-tr from-accent/40 to-white/10 border border-white/10" />
        </div>
      </section>

      <section className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Featured pieces</h2>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          className="text-xs border rounded-full px-3 py-1 bg-white"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price · Low to High</option>
          <option value="price_desc">Price · High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center text-sm text-gray-500">
            No products found yet.
          </div>
        )}
      </section>
    </div>
  );
}

