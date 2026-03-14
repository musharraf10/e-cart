import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api/client.js";

const steps = ["pending", "processing", "shipped", "delivered"];

const statusColors = {
  pending: "bg-[#52525b] text-white",
  processing: "bg-[#d4af37] text-white",
  shipped: "bg-[#3b82f6] text-white",
  delivered: "bg-[#22c55e] text-white",
  cancelled: "bg-[#ef4444] text-white",
};

export function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(({ data }) => setOrder(data));
  }, [id]);

  if (!order)
    return (
      <div className="text-sm text-[#a1a1aa]">Loading order details...</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/account/orders")}
          className="text-[#d4af37] hover:text-[#ff7a1a] transition-colors"
        >
          ← Back to Orders
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Order #{order._id.slice(-6).toUpperCase()}
          </h1>
          <p className="text-[#a1a1aa] text-sm mt-1">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
            <h2 className="text-white text-lg font-semibold mb-6">Order Items</h2>
            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 border-b border-[#262626] pb-4 last:border-b-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-[#0f0f0f]"
                  />
                  <div className="flex-1">
                    <p className="text-white font-semibold">{item.name}</p>
                    <p className="text-[#a1a1aa] text-sm mt-1">
                      Qty: {item.qty}
                    </p>
                    <p className="text-white font-medium mt-2">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
            <h2 className="text-white text-lg font-semibold mb-6">
              Shipping Address
            </h2>
            <div className="space-y-2 text-sm">
              <p className="text-white font-semibold">
                {order.shippingAddress?.name}
              </p>
              <p className="text-[#a1a1aa]">
                {order.shippingAddress?.line1}
              </p>
              {order.shippingAddress?.line2 && (
                <p className="text-[#a1a1aa]">
                  {order.shippingAddress.line2}
                </p>
              )}
              <p className="text-[#a1a1aa]">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                {order.shippingAddress?.zip}
              </p>
              <p className="text-[#a1a1aa]">{order.shippingAddress?.country}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
            <h2 className="text-white text-lg font-semibold mb-6">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Subtotal</span>
                <span className="text-white">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Shipping</span>
                <span className="text-white">Free</span>
              </div>
              <div className="border-t border-[#262626] pt-3 flex justify-between">
                <span className="text-white font-semibold">Total</span>
                <span className="text-[#d4af37] text-xl font-bold">
                  ${order.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
            <h2 className="text-white text-lg font-semibold mb-6">
              Order Status
            </h2>
            <div
              className={`px-4 py-2 rounded-full text-center text-sm font-semibold mb-6 ${statusColors[order.status] || statusColors.pending
                }`}
            >
              {order.status.toUpperCase()}
            </div>

            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step}
                  className={`flex items-center gap-3 text-sm ${steps.indexOf(step) <= steps.indexOf(order.status)
                      ? "opacity-100"
                      : "opacity-50"
                    }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${steps.indexOf(step) <= steps.indexOf(order.status)
                        ? "bg-[#d4af37]"
                        : "bg-[#262626]"
                      }`}
                  ></div>
                  <span
                    className={`capitalize ${steps.indexOf(step) <= steps.indexOf(order.status)
                        ? "text-white"
                        : "text-[#a1a1aa]"
                      }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
            <h2 className="text-white text-lg font-semibold mb-4">
              Payment Info
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Method</span>
                <span className="text-white capitalize">
                  {order.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : "Online Payment"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#a1a1aa]">Status</span>
                <span className="text-white capitalize">
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
