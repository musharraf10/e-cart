import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../api/client.js";
import { logout } from "../../store/slices/authSlice.js";
import { useToast } from "../../components/ui/ToastProvider.jsx";

export function AccountSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notify } = useToast();

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put("/users/change-password", { currentPassword, newPassword });
      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("Failed to update password");
    }
  };

  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    )
      return;
    try {
      await api.delete("/users/delete-account");
      dispatch(logout());
      navigate("/");
    } catch (err) {
      notify("Failed to delete account", "error");
    }
  };

  const logoutAll = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // best effort
    }
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-[#a1a1aa] text-sm mt-1">Manage your security and account preferences</p>
      </div>

      <form onSubmit={changePassword} className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
        <h2 className="text-white text-lg font-semibold mb-6">Change Password</h2>

        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${message.includes("successfully")
                ? "bg-green-900/30 text-green-400 border border-green-900"
                : "bg-red-900/30 text-red-400 border border-red-900"
              }`}
          >
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
              Current Password
            </label>
            <input
              className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors"
              type="password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
              New Password
            </label>
            <input
              className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors"
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <p className="text-[#a1a1aa] text-xs mt-2">Use at least 8 characters</p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-8 px-6 py-3.5 rounded-xl bg-accent text-primary text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-lg shadow-accent/20"
        >
          Update Password
        </button>
      </form>

      <div className="space-y-6">
        <div className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
          <h2 className="text-white text-lg font-semibold mb-4">Logout</h2>
          <p className="text-[#a1a1aa] text-sm mb-6">
            Sign out from your current device
          </p>
          <button
            onClick={logoutAll}
            className="px-6 py-3 rounded-xl bg-[#262626] text-white text-sm font-medium hover:bg-[#303030] transition-all duration-200"
          >
            Logout from Current Device
          </button>
        </div>

        <div className="bg-[#171717] border border-red-900/30 rounded-2xl p-8 shadow-xl">
          <h2 className="text-white text-lg font-semibold mb-4">Danger Zone</h2>
          <p className="text-[#a1a1aa] text-sm mb-6">
            Delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={deleteAccount}
            className="px-6 py-3 rounded-xl bg-red-900/20 text-red-400 text-sm font-medium hover:bg-red-900/40 transition-all duration-200 border border-red-900/50"
          >
            Delete Account Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
