import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/client.js";

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ loading: true, message: "Verifying your email...", success: false });

  useEffect(() => {
    async function verify() {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setState({ loading: false, message: "Invalid verification link.", success: false });
        return;
      }

      try {
        const { data } = await api.post("/auth/verify-email", { token, email });
        setState({ loading: false, message: data.message || "Email verified.", success: true });
      } catch (err) {
        setState({ loading: false, message: err.response?.data?.message || "Verification failed.", success: false });
      }
    }

    verify();
  }, [searchParams]);

  return (
    <div className="max-w-md mx-auto bg-card border border-[#262626] rounded-2xl p-6 text-center space-y-4">
      <h1 className="text-2xl font-semibold text-white">Email Verification</h1>
      <p className="text-sm text-muted">{state.message}</p>
      {!state.loading && (
        <Link to="/auth" className="inline-block px-4 py-2 rounded-xl bg-accent text-primary font-semibold text-sm">
          {state.success ? "Continue to login" : "Back to auth"}
        </Link>
      )}
    </div>
  );
}
