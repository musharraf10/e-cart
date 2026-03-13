import { useEffect, useState } from "react";
import api from "../../api/client.js";

const empty = { fullName:"", phoneNumber:"", addressLine1:"", addressLine2:"", city:"", state:"", postalCode:"", country:"", isDefault:false };

export function AddressPage() {
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const load = () => api.get('/users/addresses').then(({data})=>setAddresses(data));
  useEffect(()=>{load();},[]);

  const submit = async (e) => {
    e.preventDefault();
    if (editingId) await api.put(`/users/addresses/${editingId}`, form);
    else await api.post('/users/addresses', form);
    setForm(empty); setEditingId(null); load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Addresses</h1>
      <form onSubmit={submit} className="bg-white rounded-xl p-4 shadow-sm grid sm:grid-cols-2 gap-3 text-sm">
        <input className="border rounded-lg px-3 py-2" placeholder="Full Name" value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})} required />
        <input className="border rounded-lg px-3 py-2" placeholder="Phone Number" value={form.phoneNumber} onChange={(e)=>setForm({...form,phoneNumber:e.target.value})} required />
        <input className="border rounded-lg px-3 py-2 sm:col-span-2" placeholder="Address Line 1" value={form.addressLine1} onChange={(e)=>setForm({...form,addressLine1:e.target.value})} required />
        <input className="border rounded-lg px-3 py-2 sm:col-span-2" placeholder="Address Line 2" value={form.addressLine2} onChange={(e)=>setForm({...form,addressLine2:e.target.value})} />
        <input className="border rounded-lg px-3 py-2" placeholder="City" value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})} required />
        <input className="border rounded-lg px-3 py-2" placeholder="State" value={form.state} onChange={(e)=>setForm({...form,state:e.target.value})} required />
        <input className="border rounded-lg px-3 py-2" placeholder="Postal Code" value={form.postalCode} onChange={(e)=>setForm({...form,postalCode:e.target.value})} required />
        <input className="border rounded-lg px-3 py-2" placeholder="Country" value={form.country} onChange={(e)=>setForm({...form,country:e.target.value})} required />
        <label className="sm:col-span-2 text-sm flex items-center gap-2"><input type="checkbox" checked={form.isDefault} onChange={(e)=>setForm({...form,isDefault:e.target.checked})} /> Set as default</label>
        <button className="sm:col-span-2 rounded-full bg-gray-900 text-white py-2">{editingId ? 'Update address' : 'Add address'}</button>
      </form>

      <div className="grid gap-3">
        {addresses.map((a)=>(
          <div key={a._id} className="bg-white rounded-xl p-4 shadow-sm text-sm">
            <p className="font-semibold">{a.fullName} {a.isDefault && <span className="text-xs text-accent">(Default)</span>}</p>
            <p>{a.phoneNumber}</p><p>{a.addressLine1} {a.addressLine2}</p><p>{a.city}, {a.state} {a.postalCode}</p><p>{a.country}</p>
            <div className="mt-2 flex gap-2 text-xs">
              <button className="border rounded-full px-2 py-1" onClick={()=>{setEditingId(a._id);setForm({...a});}}>Edit</button>
              <button className="border rounded-full px-2 py-1" onClick={()=>api.delete(`/users/addresses/${a._id}`).then(load)}>Delete</button>
              {!a.isDefault && <button className="border rounded-full px-2 py-1" onClick={()=>api.put(`/users/addresses/${a._id}`,{...a,isDefault:true}).then(load)}>Set default</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
