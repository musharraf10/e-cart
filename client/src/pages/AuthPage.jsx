import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { HiEye, HiEyeOff } from "react-icons/hi";
import api from "../api/client.js";
import { setCredentials } from "../store/slices/authSlice.js";
import { GoogleLoginButton } from "../components/auth/GoogleLoginButton.jsx";
import { useToast } from "../components/ui/ToastProvider.jsx";

export function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notify } = useToast();

  const isLogin = mode === "login";
  const isForgot = mode === "forgot";
  const isRegister = mode === "register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegister && !acceptTerms) {
      notify("Please accept Terms & Conditions to create your account.", "error");
      return;
    }

    setLoading(true);
    try {
      setShowVerifyPrompt(false);
      if (isForgot) {
        const { data } = await api.post("/auth/forgot-password", { email: form.email });
        notify(data.message || "Password reset email sent", "success");
        setMode("login");
        return;
      }

      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const { data } = await api.post(endpoint, form);

      if (!isLogin) {
        notify(data.message || "Account created. Verify your email before login.", "success");
        setMode("login");
        return;
      }

      dispatch(setCredentials(data));
      const role = data?.user?.role;
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      const message = err.response?.data?.message || "Authentication failed";
      const shouldShowVerifyPrompt =
        isLogin &&
        err.response?.status === 403 &&
        message.toLowerCase().includes("verify your email");

      setShowVerifyPrompt(shouldShowVerifyPrompt);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const updateMode = (nextMode) => {
    setMode(nextMode);
    if (nextMode !== "register") {
      setAcceptTerms(false);
    }
  };

  const handleResendVerification = async () => {
    if (!form.email) {
      notify("Please enter your email first.", "error");
      return;
    }

    setResendLoading(true);
    try {
      const { data } = await api.post("/auth/resend-verification", { email: form.email });
      notify(data.message || "Verification email sent", "success");
    } catch (err) {
      notify(err.response?.data?.message || "Unable to resend verification email", "error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="
    min-h-screen 
    flex flex-col 
    justify-center 
    px-4 
    sm:items-center sm:justify-center
    bg-black
  "
    >
      <div className="relative rounded-2xl bg-card border border-[#262626] p-6 sm:p-8 md:p-10 shadow-card">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-primary font-bold text-lg">N</span>
          </div>
          <span className="text-xl font-semibold text-white tracking-tight">NoorFit</span>
        </div>

        <h1 className="text-2xl font-semibold text-white tracking-tight">
          {isForgot ? "Forgot password" : isLogin ? "Welcome back" : "Create account"}
        </h1>

        {!isForgot && (
          <div className="mt-6 space-y-3">
            <GoogleLoginButton disabled={loading} />
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-[#262626]" />
              <span className="text-xs text-muted">or</span>
              <div className="h-px flex-1 bg-[#262626]" />
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {!isLogin && !isForgot && (
            <div>
              <label className="block text-muted text-xs uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-muted text-xs uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              placeholder="you@email.com"
              autoComplete="email"
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setShowVerifyPrompt(false);
              }}
              className="w-full rounded-xl border border-[#262626] bg-primary px-4 py-3 text-white text-sm"
              required
            />
            {isLogin && showVerifyPrompt && (
              <div className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5">
                <p className="text-xs text-amber-300">
                  Your account is not verified yet. Please verify before login.
                </p>
                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="mt-1.5 text-xs font-semibold text-accent hover:underline disabled:opacity-60"
                >
                  {resendLoading ? "Sending..." : "Resend verification email"}
                </button>
              </div>
            )}
          </div>

          {!isForgot && (
            <div>
              <label className="block text-muted text-xs uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-xl border border-[#262626] bg-primary px-4 py-3 pr-12 text-white text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white p-1"
                >
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
              {isLogin && (
                <button type="button" onClick={() => updateMode("forgot")} className="inline-block text-accent text-xs mt-1.5 hover:underline">
                  Forgot password?
                </button>
              )}
            </div>
          )}

          {isRegister && (
            <label className="flex items-start gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#3a3a3a] bg-primary text-accent focus:ring-accent"
              />
              <span>
                I accept{" "}
                <Link to="/terms" className="text-accent hover:underline">
                  Terms & Conditions
                </Link>
                .
              </span>
            </label>
          )}

          <button type="submit" disabled={loading} className="w-full h-12 rounded-xl bg-accent text-primary text-sm font-semibold">
            {loading ? "Please wait…" : isForgot ? "Send reset email" : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-6">
          {isForgot ? (
            <button type="button" onClick={() => updateMode("login")} className="text-accent font-medium hover:underline">Back to sign in</button>
          ) : isLogin ? (
            <>
              Don&apos;t have an account? <button type="button" onClick={() => updateMode("register")} className="text-accent font-medium hover:underline">Create one</button>
            </>
          ) : (
            <>
              Already have an account? <button type="button" onClick={() => updateMode("login")} className="text-accent font-medium hover:underline">Sign in</button>
            </>
          )}
        </p>
      </div>
    </motion.div>
  );
}
