import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import api from "../../api/client.js";
import { addToCart } from "../../store/slices/cartSlice.js";

export function WishlistPage() {
  const [items, setItems] = useState([]);
  const dispatch = useDispatch();

  const load = () => api.get('/users/wishlist').then(({data})=>setItems(data));
  useEffect(()=>{ load(); },[]);

  const moveToCart = (p) => {
    dispatch(addToCart({ product: p._id, name: p.name, image: p.images?.[0], price: p.price, qty: 1, size: p.sizes?.[0], color: p.colors?.[0] }));
    api.delete(`/users/wishlist/${p._id}`).then(load);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Wishlist</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((p)=>(
          <div key={p._id} className="bg-white rounded-xl p-4 shadow-sm text-sm">
            <img src={p.images?.[0]} alt={p.name} className="w-full h-40 object-cover rounded" />
            <p className="font-medium mt-2">{p.name}</p>
            <p>${p.price?.toFixed?.(2)}</p>
            <div className="flex gap-2 mt-2">
              <button onClick={()=>moveToCart(p)} className="px-3 py-1 rounded-full bg-gray-900 text-white text-xs">Move to cart</button>
              <button onClick={()=>api.delete(`/users/wishlist/${p._id}`).then(load)} className="px-3 py-1 rounded-full border text-xs">Remove</button>
            </div>
          </div>
        ))}
      </div>
      {items.length===0 && <p className="text-sm text-gray-500">No wishlist items.</p>}
    </div>
  );
}
