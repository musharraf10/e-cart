import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../api/client.js";
import { logout } from "../../store/slices/authSlice.js";

export function AccountSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changePassword = async (e) => {
    e.preventDefault();
    await api.put("/users/change-password", { currentPassword, newPassword });
    alert("Password changed");
    setCurrentPassword("");
    setNewPassword("");
  };

  const deleteAccount = async () => {
    if (!window.confirm("Delete your account permanently?")) return;
    await api.delete("/users/delete-account");
    dispatch(logout());
    navigate("/");
  };

  const logoutAll = () => {
    dispatch(logout());
    navigate("/auth");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Account settings</h1>
      <form onSubmit={changePassword} className="lux-card p-4 space-y-3 text-sm">
        <h2 className="font-semibold">Change password</h2>
        <input className="lux-input" type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
        <input className="lux-input" type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        <button className="btn-primary">Update password</button>
      </form>
      <div className="lux-card p-4 space-y-3 text-sm">
        <h2 className="font-semibold">Security actions</h2>
        <button onClick={logoutAll} className="btn-secondary mr-2">Logout from current device</button>
        <button onClick={deleteAccount} className="rounded-xl px-4 py-2 border border-red-700 text-red-300">Delete account</button>
      </div>
    </div>
  );
}
