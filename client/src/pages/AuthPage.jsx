import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/client.js";
import { setCredentials } from "../store/slices/authSlice.js";

export function AuthPage() {
  const [mode, setMode] = useState("login");
  const [showPass, setShowPass] = useState(false);
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
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-2">
      <p className="text-3xl font-semibold mb-6">NoorFit</p>
      <div className="w-full max-w-md lux-card p-5 md:p-6 space-y-4">
        <h1 className="text-xl font-semibold text-center">{mode === "login" ? "Welcome back" : "Create your account"}</h1>

        <div className="flex gap-2 text-xs">
          <button type="button" onClick={() => setMode("login")} className={`flex-1 rounded-xl border py-2 ${mode === "login" ? "border-accent bg-accent text-black" : "border-borderlux text-muted"}`}>Sign in</button>
          <button type="button" onClick={() => setMode("register")} className={`flex-1 rounded-xl border py-2 ${mode === "register" ? "border-accent bg-accent text-black" : "border-borderlux text-muted"}`}>Create account</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          {mode === "register" && (
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="lux-input" />
          )}
          <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="lux-input" />
          <div className="relative">
            <input type={showPass ? "text" : "password"} placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="lux-input pr-20" />
            <button type="button" onClick={() => setShowPass((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted">{showPass ? "Hide" : "Show"}</button>
          </div>
          <div className="flex items-center justify-between">
            <span />
            <button type="button" className="text-xs text-accent">Forgot password?</button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full text-sm disabled:opacity-60">
            {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
