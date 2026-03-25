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
      const message = error?.response?.data?.message || error?.message || "Google sign-in failed";
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
      className="w-full h-12 rounded-xl border border-[#262626] bg-primary text-white text-sm font-semibold active:scale-95 transition-transform disabled:opacity-60"
    >
      {loading ? "Connecting to Google..." : "Continue with Google"}
    </button>
  );
}
