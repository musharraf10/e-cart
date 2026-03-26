import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/client.js";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data } = await api.post("/auth/reset-password", { token, email, password });
      setMessage(data.message || "Password reset successful.");
      setSuccess(true);
    } catch (err) {
      setSuccess(false);
      setMessage(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return <div className="text-center text-muted">Invalid reset link.</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-card border border-[#262626] rounded-2xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-white">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          value={password}
          minLength={6}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm"
        />
        <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-accent text-primary font-semibold text-sm">
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
      {message && <p className={`text-sm ${success ? "text-green-400" : "text-red-400"}`}>{message}</p>}
      <Link to="/auth" className="text-accent text-sm hover:underline">Back to auth</Link>
    </div>
  );
}
