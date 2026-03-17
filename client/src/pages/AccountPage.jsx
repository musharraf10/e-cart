import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
          Hi, {user.name}
        </h1>
        <p className="text-muted text-sm mt-1">Welcome to your account</p>
      </div>

      <section className="rounded-xl bg-card border border-[#262626] p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Order history
        </h2>
        {orders.length === 0 ? (
          <p className="text-muted text-sm">
            You have no orders yet.{" "}
            <Link to="/" className="text-accent font-medium hover:underline">
              Discover NoorFit pieces
            </Link>{" "}
            tailored for everyday comfort.
          </p>
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o._id}
                to={`/account/orders/${o._id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#262626] px-4 py-3 hover:border-accent/30 transition-colors"
              >
                <div className="text-sm">
                  <p className="font-medium text-white">
                    {o.items.length} item{o.items.length > 1 ? "s" : ""} · $
                    {o.total.toFixed(2)}
                  </p>
                  <p className="text-muted text-xs">
                    {new Date(o.createdAt).toLocaleDateString()} · {o.status}
                  </p>
                </div>
                <span className="text-muted text-xs uppercase tracking-wide">
                  {o.paymentMethod === "cod"
                    ? "Cash on delivery"
                    : "Online"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
