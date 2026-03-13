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
    await api.put('/users/change-password', { currentPassword, newPassword });
    alert('Password changed');
    setCurrentPassword('');
    setNewPassword('');
  };

  const deleteAccount = async () => {
    if (!window.confirm('Delete your account permanently?')) return;
    await api.delete('/users/delete-account');
    dispatch(logout());
    navigate('/');
  };

  const logoutAll = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Account settings</h1>
      <form onSubmit={changePassword} className="bg-white rounded-xl p-4 shadow-sm space-y-3 text-sm">
        <h2 className="font-semibold">Change password</h2>
        <input className="w-full border rounded-lg px-3 py-2" type="password" placeholder="Current password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} required />
        <input className="w-full border rounded-lg px-3 py-2" type="password" placeholder="New password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} required />
        <button className="rounded-full bg-gray-900 text-white px-4 py-2">Update password</button>
      </form>
      <div className="bg-white rounded-xl p-4 shadow-sm space-y-3 text-sm">
        <h2 className="font-semibold">Security actions</h2>
        <button onClick={logoutAll} className="px-4 py-2 rounded-full border">Logout from current device</button>
        <button onClick={deleteAccount} className="px-4 py-2 rounded-full border border-red-300 text-red-600 ml-2">Delete account</button>
      </div>
    </div>
  );
}
