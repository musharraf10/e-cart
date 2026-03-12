import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api/client.js";

export function AccountPage() {
  const user = useSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    api.get("/orders/me").then(({ data }) => setOrders(data));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Hi, {user.name}</h1>
      <section className="bg-white rounded-xl p-4 shadow-sm space-y-3 text-sm">
        <h2 className="text-sm font-semibold">Order history</h2>
        {orders.length === 0 ? (
          <p className="text-xs text-gray-500">
            You have no orders yet. Discover NoorFit pieces tailored for everyday comfort.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <div
                key={o._id}
                className="border rounded-lg px-3 py-2 flex items-center justify-between gap-3"
              >
                <div className="text-xs">
                  <p className="font-medium">
                    {o.items.length} item{o.items.length > 1 ? "s" : ""} · $
                    {o.total.toFixed(2)}
                  </p>
                  <p className="text-gray-500">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.status}
                  </p>
                </div>
                <span className="text-[11px] uppercase tracking-wide text-gray-500">
                  {o.paymentMethod === "cod" ? "Cash on delivery" : "Online"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

