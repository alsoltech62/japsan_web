import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getVendorProfile, updateVendorProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function VendorProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const { logout, updateUser }= useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    getVendorProfile().then(r => {
      setProfile(r.data.data);
      setForm({
        business_name: r.data.data.business_name || '',
        owner_name: r.data.data.owner_name || '',
        email: r.data.data.email || '',
        city: r.data.data.city || '',
        business_address: r.data.data.business_address || '',
        whatsapp_number: r.data.data.whatsapp_number || '',
        bank_account_number: r.data.data.bank_account_number || '',
        bank_ifsc: r.data.data.bank_ifsc || '',
        bank_name: r.data.data.bank_name || ''
      });
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    try {
      await updateVendorProfile(form);
      setProfile(p => ({ ...p, ...form }));
      updateUser(form);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  }

  if (loading) return <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse"/>)}</div>;

  return (
    <div className="p-4 space-y-4 fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800">🏪 Vendor Profile</h2>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-100 text-center shadow-sm">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">🏪</div>
        
        {editing ? (
          <div className="space-y-3 text-left">
            <div><label className="text-sm font-medium text-slate-700">Business Name</label>
              <input className="input-field mt-1" value={form.business_name} onChange={e=>setForm(f=>({...f,business_name:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">Owner Name</label>
              <input className="input-field mt-1" value={form.owner_name} onChange={e=>setForm(f=>({...f,owner_name:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">Email</label>
              <input className="input-field mt-1" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">WhatsApp Number</label>
              <input className="input-field mt-1" value={form.whatsapp_number} onChange={e=>setForm(f=>({...f,whatsapp_number:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">City</label>
              <input className="input-field mt-1" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">Business Address</label>
              <input className="input-field mt-1" value={form.business_address} onChange={e=>setForm(f=>({...f,business_address:e.target.value}))} /></div>
            
            <hr className="my-2" />
            <h4 className="font-bold text-sm text-slate-700">Bank Details</h4>
            <div><label className="text-sm font-medium text-slate-700">Bank Name</label>
              <input className="input-field mt-1" value={form.bank_name} onChange={e=>setForm(f=>({...f,bank_name:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">Account Number</label>
              <input className="input-field mt-1" value={form.bank_account_number} onChange={e=>setForm(f=>({...f,bank_account_number:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">IFSC Code</label>
              <input className="input-field mt-1" value={form.bank_ifsc} onChange={e=>setForm(f=>({...f,bank_ifsc:e.target.value}))} /></div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} className="btn-primary flex-1">Save</button>
              <button onClick={()=>setEditing(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-slate-800">{profile?.business_name}</h3>
            <p className="text-slate-500 font-medium">{profile?.owner_name}</p>
            <p className="text-slate-400 text-sm mt-1">📞 {profile?.phone}</p>
            {profile?.email && <p className="text-slate-400 text-sm">{profile?.email}</p>}
            <p className="text-slate-500 text-sm mt-1">📍 {profile?.city}</p>
            <span className={`badge mt-2 inline-flex ${profile?.kyc_status==='approved'?'badge-success':profile?.kyc_status==='pending'?'badge-warning':'badge-info'}`}>
              KYC: {profile?.kyc_status}
            </span>
            <button onClick={()=>setEditing(true)} className="btn-secondary mt-4 w-full border-blue-200 text-blue-600 hover:bg-blue-50">Edit Profile</button>
          </>
        )}
      </div>

      <button onClick={()=>{logout();navigate('/login');}}
        className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-semibold border border-red-100 hover:bg-red-100 transition-all shadow-sm">
        🚪 Logout
      </button>
    </div>
  );
}
