import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client.js";

const steps = ["pending", "processing", "shipped", "delivered"];

export function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(()=>{ api.get(`/orders/${id}`).then(({data})=>setOrder(data)); },[id]);
  if (!order) return <div className="text-sm text-gray-500">Loading order...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Order #{order._id.slice(-6).toUpperCase()}</h1>
      <div className="bg-white rounded-xl p-4 shadow-sm text-sm space-y-3">
        {order.items.map((item,idx)=>(
          <div key={idx} className="flex gap-3 border-b pb-2">
            <img src={item.image} alt={item.name} className="w-14 h-14 rounded object-cover" />
            <div><p className="font-medium">{item.name}</p><p>Qty: {item.qty} · ${item.price.toFixed(2)}</p></div>
          </div>
        ))}
        <p>Total: <span className="font-semibold">${order.total.toFixed(2)}</span></p>
        <p>Payment status: {order.paymentStatus}</p>
        <p>Shipping: {order.shippingAddress?.line1}, {order.shippingAddress?.city}, {order.shippingAddress?.country}</p>
        <div>
          <p className="font-medium mb-1">Order status timeline</p>
          <div className="flex gap-2 flex-wrap">{steps.map((s)=><span key={s} className={`px-2 py-1 rounded-full text-xs ${steps.indexOf(s)<=steps.indexOf(order.status)?'bg-gray-900 text-white':'bg-gray-100 text-gray-600'}`}>{s}</span>)}</div>
        </div>
      </div>
    </div>
  );
}
