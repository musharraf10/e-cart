import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import api from "../../api/client.js";
import { auth, googleProvider } from "../../config/firebase.js";
import { setCredentials } from "../../store/slices/authSlice.js";
import { useToast } from "../ui/ToastProvider.jsx";

export function GoogleLoginButton({ disabled = false }) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notify } = useToast();

  const handleGoogleSignIn = async () => {
    if (loading || disabled) return;

    setLoading(true);

    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      const token = await user.getIdToken();
      const { data } = await api.post("/auth/google", { token });

      dispatch(setCredentials(data));

      if (data?.user?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }

      notify("Logged in with Google", "success");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Google sign-in failed";
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={disabled || loading}
      className="w-full h-12 flex items-center justify-center gap-3 rounded-xl border border-[#262626] bg-primary text-white text-sm font-semibold active:scale-95 transition-transform disabled:opacity-60"
    >
      {/* Google SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        className="w-5 h-5 bg-white rounded-full p-[2px]"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.15 0 5.97 1.08 8.2 3.2l6.1-6.1C34.4 2.5 29.5 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.2 5.6C12 13 17.6 9.5 24 9.5z"
        />
        <path
          fill="#34A853"
          d="M46.5 24.5c0-1.6-.1-2.8-.4-4H24v7.6h12.7c-.3 2.1-1.7 5.3-4.7 7.4l7.3 5.7c4.2-3.9 7.2-9.6 7.2-16.7z"
        />
        <path
          fill="#4A90E2"
          d="M9.8 28.9c-1-2.9-1-6 0-8.9l-7.2-5.6C.9 17.7 0 20.8 0 24s.9 6.3 2.6 9.6l7.2-5.7z"
        />
        <path
          fill="#FBBC05"
          d="M24 48c6.5 0 12-2.1 16-5.7l-7.3-5.7c-2 1.4-4.7 2.4-8.7 2.4-6.4 0-11.9-4.3-13.9-10.1l-7.2 5.7C6.6 42.6 14.6 48 24 48z"
        />
      </svg>

      {loading ? "Connecting to Google..." : "Continue with Google"}
    </button>
  );
}