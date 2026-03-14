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
    <div className="space-y-8">
      <section className="lux-card p-5 md:p-8 flex flex-col md:flex-row gap-6 items-center">
        <div className="space-y-3 max-w-xl">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">NoorFit</p>
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            Minimal luxury for <span className="text-accent">modern movement</span>
          </h1>
          <p className="text-sm text-muted">
            Discover elevated everyday essentials with tailored comfort and timeless silhouettes.
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 mt-4">
            <input
              type="search"
              placeholder="Search tees, joggers, hoodies…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="lux-input"
            />
            <button type="submit" className="btn-primary text-xs uppercase tracking-wide">Search</button>
          </form>
        </div>
        <div className="hidden md:flex flex-1 justify-end">
          <div className="h-44 w-44 rounded-full bg-gradient-to-tr from-accent/40 to-white/5 border border-borderlux" />
        </div>
      </section>

      <section className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Featured pieces</h2>
        <select
          value={filters.sort}
          onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
          className="bg-card border border-borderlux rounded-xl px-3 py-2 text-xs"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price · Low to High</option>
          <option value="price_desc">Price · High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted">No products found yet.</div>
        )}
      </section>
    </div>
  );
}
