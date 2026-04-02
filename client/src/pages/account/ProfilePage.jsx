import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/client.js";
import { setCredentials } from "../../store/slices/authSlice.js";
import { ThemeToggle } from "../../components/account/ThemeToggle.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";

export function ProfilePage() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const { notify } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
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

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append("image", file);
      const { data } = await api.post("/users/profile/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.url) {
        setForm((prev) => ({ ...prev, avatar: data.url }));
      }
      notify("Avatar updated");
    } catch {
      notify("Unable to upload image", "error");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/users/profile", form);
      dispatch(setCredentials({ user: data, token }));
      setIsEditing(false);
      notify("Profile updated");
    } catch {
      notify("Could not save profile", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-wide text-text-primary">Profile</h1>
        <p className="text-xs text-text-muted mt-1">Personal information and preferences</p>
      </div>

      <ThemeToggle />

      <form onSubmit={save} className="rounded-2xl border border-border-subtle bg-bg-secondary p-4 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="avatar"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-text-primary">{form.name || "Your profile"}</p>
              <p className="text-xs text-text-muted">{form.email || "No email added"}</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="rounded-xl border border-border-subtle px-3 py-2 text-xs text-text-primary"
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="rounded-xl border border-border-subtle px-3 py-2 text-xs text-text-primary disabled:opacity-50"
            >
              {uploadingAvatar ? "Uploading" : "Photo"}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={uploadAvatar}
          />
        </div>

        <div className="grid gap-3">
          <input
            className="w-full rounded-xl border border-border-subtle bg-bg-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-ring"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!isEditing}
          />
          <input
            className="w-full rounded-xl border border-border-subtle bg-bg-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-ring"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={!isEditing}
          />
          <input
            className="w-full rounded-xl border border-border-subtle bg-bg-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-ring"
            placeholder="Mobile Number"
            value={form.mobileNumber}
            onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
            disabled={!isEditing}
          />
          <input
            className="w-full rounded-xl border border-border-subtle bg-bg-primary px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-ring"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            disabled={!isEditing}
          />
          <select
            className="w-full rounded-xl border border-border-subtle bg-bg-primary px-3 py-2.5 text-sm text-text-primary focus-ring"
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

        {isEditing && (
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 rounded-xl bg-text-primary text-bg-primary px-4 py-2.5 text-sm font-medium"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-xl border border-border-subtle px-4 py-2.5 text-sm text-text-primary"
            >
              Cancel
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
