import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/client.js";
import { setCredentials } from "../../store/slices/authSlice.js";

export function ProfilePage() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    dateOfBirth: "",
    gender: "",
    avatar: "",
  });

  useEffect(() => {
    api.get("/users/profile").then(({ data }) => {
      setForm({
        name: data.name || "",
        email: data.email || "",
        mobileNumber: data.mobileNumber || "",
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
        gender: data.gender || "",
        avatar: data.avatar || "",
      });
    });
  }, []);

  const save = async (e) => {
    e.preventDefault();
    const { data } = await api.put("/users/profile", form);
    dispatch(setCredentials({ user: data, token }));
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Profile</h1>
          <p className="text-[#a1a1aa] text-sm mt-1">Manage your personal information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-2.5 rounded-xl bg-[#262626] text-white text-sm font-medium hover:bg-[#303030] transition-all duration-200"
          >
            Edit Profile
          </button>
        )}
      </div>

      <form onSubmit={save} className="bg-[#171717] border border-[#262626] rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="avatar"
                className="h-32 w-32 rounded-full object-cover border-4 border-[#262626] shadow-lg"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-[#262626] border-4 border-[#303030] flex items-center justify-center shadow-lg">
                <span className="text-5xl">👤</span>
              </div>
            )}
            {isEditing && (
              <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs">Change</span>
              </div>
            )}
          </div>
          {isEditing && (
            <input
              className="mt-4 bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-2 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors w-full max-w-md"
              placeholder="Avatar URL"
              value={form.avatar}
              onChange={(e) => setForm({ ...form, avatar: e.target.value })}
            />
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
              Full Name
            </label>
            <input
              className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
              Email Address
            </label>
            <input
              className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
              Mobile Number
            </label>
            <input
              className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Mobile Number"
              value={form.mobileNumber}
              onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
              Date of Birth
            </label>
            <input
              className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm placeholder-[#a1a1aa] focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              disabled={!isEditing}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-[#a1a1aa] text-xs uppercase tracking-wide mb-2">
              Gender
            </label>
            <select
              className="w-full bg-[#0f0f0f] border border-[#262626] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4af37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              disabled={!isEditing}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              className="flex-1 px-6 py-3.5 rounded-xl bg-accent text-primary text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-lg shadow-accent/20"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-3.5 rounded-xl bg-[#262626] text-white text-sm font-medium hover:bg-[#303030] transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
