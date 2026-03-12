import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import api from "../api/client.js";
import { addToCart } from "../store/slices/cartSlice.js";

export function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();

  useEffect(() => {
    api.get(`/products/${slug}`).then(({ data }) => {
      setProduct(data);
      if (data.sizes?.length) setSize(data.sizes[0]);
      if (data.colors?.length) setColor(data.colors[0]);
    });
  }, [slug]);

  if (!product) {
    return <div className="text-sm text-gray-500">Loading product…</div>;
  }

  const handleAdd = () => {
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        qty,
        size,
        color,
      }),
    );
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="aspect-[4/5] bg-gray-100">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              NoorFit
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-xs text-gray-500 mt-1">
            Crafted for comfort. Designed for life.
          </p>
        </div>
        <div className="flex items-end gap-2">
          <span className="text-xl font-semibold">
            ${product.price?.toFixed ? product.price.toFixed(2) : product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm line-through text-gray-400">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700">{product.description}</p>

        <div className="flex flex-wrap gap-4 text-sm">
          {product.sizes?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSize(s)}
                    className={`px-3 py-1 rounded-full border text-xs ${
                      size === s ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {product.colors?.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`px-3 py-1 rounded-full border text-xs ${
                      color === c ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-full overflow-hidden text-sm">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-3 py-1"
            >
              −
            </button>
            <span className="px-4">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="px-3 py-1"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 rounded-full bg-gray-900 text-white text-sm font-semibold py-2"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}

