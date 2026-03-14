import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCart } from "../../store/slices/cartSlice.js";

export function ProductCard({ product }) {
  const dispatch = useDispatch();
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const quickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.images?.[0],
        price: product.price,
        qty: 1,
        size: product.sizes?.[0],
        color: product.colors?.[0],
      }),
    );
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group lux-card overflow-hidden flex flex-col transition-all hover:scale-[1.02]"
    >
      <div className="aspect-[4/5] bg-[#111111] overflow-hidden relative">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted">NoorFit</div>
        )}
        {discount > 0 && <span className="absolute top-2 left-2 text-[10px] bg-accent text-black px-2 py-1 rounded-full">-{discount}%</span>}
      </div>
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
          {product.isNewDrop && <span className="text-[10px] uppercase tracking-wide text-accent">New</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">${product.price?.toFixed ? product.price.toFixed(2) : product.price}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs line-through text-muted">${product.originalPrice.toFixed(2)}</span>
          )}
        </div>
        <button onClick={quickAdd} className="btn-primary text-xs w-full">Add to cart</button>
      </div>
    </Link>
  );
}
