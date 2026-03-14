import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api.get("/orders/me").then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Orders</h1>
      {orders.map((o) => (
        <Link key={o._id} to={`/account/orders/${o._id}`} className="block lux-card p-4 text-sm hover:scale-[1.01] transition-all">
          <p className="font-semibold">Order #{o._id.slice(-6).toUpperCase()}</p>
          <p className="text-muted text-xs">{new Date(o.createdAt).toLocaleDateString()} · {o.status}</p>
          <p>{o.items.length} items · ${o.total.toFixed(2)} · {o.paymentMethod === "cod" ? "Cash on delivery" : "Online"}</p>
        </Link>
      ))}
      {orders.length === 0 && <p className="text-sm text-muted">No orders yet.</p>}
    </div>
  );
}
