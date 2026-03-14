import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/client.js";
import { setCredentials } from "../../store/slices/authSlice.js";

export function ProfilePage() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const [form, setForm] = useState({ name: "", email: "", mobileNumber: "", dateOfBirth: "", gender: "", avatar: "" });

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
    alert("Profile updated");
  };

  return (
    <form onSubmit={save} className="lux-card p-5 space-y-4">
      <h1 className="text-xl font-semibold">Profile</h1>
      {form.avatar && <img src={form.avatar} alt="avatar" className="h-20 w-20 rounded-full object-cover border border-borderlux" />}
      <div className="grid sm:grid-cols-2 gap-3 text-sm">
        <input className="lux-input" placeholder="Full Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        <input className="lux-input" placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
        <input className="lux-input" placeholder="Mobile Number" value={form.mobileNumber} onChange={(e)=>setForm({...form,mobileNumber:e.target.value})} />
        <input className="lux-input" placeholder="Avatar URL" value={form.avatar} onChange={(e)=>setForm({...form,avatar:e.target.value})} />
        <input className="lux-input" type="date" value={form.dateOfBirth} onChange={(e)=>setForm({...form,dateOfBirth:e.target.value})} />
        <select className="lux-input" value={form.gender} onChange={(e)=>setForm({...form,gender:e.target.value})}>
          <option value="">Gender (optional)</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>
      <button className="btn-primary">Save changes</button>
    </form>
  );
}
