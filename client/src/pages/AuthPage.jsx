import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { setCredentials } from "../store/slices/authSlice.js";

export function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);
      dispatch(setCredentials(data));
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-sm p-5 space-y-4">
      <h1 className="text-xl font-semibold">
        {mode === "login" ? "Welcome back" : "Create your NoorFit account"}
      </h1>
      <div className="flex gap-2 text-xs">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-full border py-1 ${
            mode === "login"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-300"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`flex-1 rounded-full border py-1 ${
            mode === "register"
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-300"
          }`}
        >
          Create account
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        {mode === "register" && (
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded-lg px-3 py-2"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded-lg px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-gray-900 text-white font-semibold py-2 text-sm disabled:opacity-60"
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}

