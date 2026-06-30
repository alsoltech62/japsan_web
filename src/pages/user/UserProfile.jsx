import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getProfile, updateProfile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const { logout, updateUser }= useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    getProfile().then(r => { setProfile(r.data.data); setForm({ name: r.data.data.name, email: r.data.data.email||'', city: r.data.data.city||'', area: r.data.data.area||'', dob: r.data.data.dob||'', profile_photo: r.data.data.profile_photo||'', kyc_document: r.data.data.kyc_document||'' }); })
      .catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    try {
      await updateProfile(form);
      setProfile(p => ({ ...p, ...form }));
      updateUser(form);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  }

  if (loading) return <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="h-16 bg-slate-200 rounded-2xl animate-pulse"/>)}</div>;

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-xl font-bold text-slate-800">👤 My Profile</h2>

      {/* Avatar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 text-center">
        {profile?.profile_photo ? (
          <img src={profile.profile_photo} alt="Profile" className="w-20 h-20 rounded-full mx-auto mb-3 object-cover border-2 border-orange-100" />
        ) : (
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">👤</div>
        )}
        {editing ? (
          <div className="space-y-3 text-left">
            <div><label className="text-sm font-medium text-slate-700">Photo URL</label>
              <input className="input-field mt-1" value={form.profile_photo} onChange={e=>setForm(f=>({...f,profile_photo:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">Name</label>
              <input className="input-field mt-1" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">Email</label>
              <input className="input-field mt-1" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">City</label>
              <input className="input-field mt-1" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">Area</label>
              <input className="input-field mt-1" value={form.area} onChange={e=>setForm(f=>({...f,area:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">Date of Birth</label>
              <input className="input-field mt-1" type="date" value={form.dob} onChange={e=>setForm(f=>({...f,dob:e.target.value}))} /></div>
            <div><label className="text-sm font-medium text-slate-700">KYC Document (URL)</label>
              <input className="input-field mt-1" value={form.kyc_document} onChange={e=>setForm(f=>({...f,kyc_document:e.target.value}))} placeholder="Aadhar/PAN Image URL" /></div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="btn-primary flex-1">Save</button>
              <button onClick={()=>setEditing(false)} className="btn-secondary flex-1">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-slate-800">{profile?.name}</h3>
            <p className="text-slate-500">{profile?.phone}</p>
            {profile?.email && <p className="text-slate-400 text-sm">{profile?.email}</p>}
            {(profile?.city || profile?.area) && <p className="text-slate-500 text-sm mt-1">📍 {profile?.area ? profile.area + ', ' : ''}{profile?.city}</p>}
            {profile?.dob && <p className="text-slate-500 text-sm">🎂 {profile?.dob}</p>}
            <span className={`badge mt-2 inline-flex ${profile?.kyc_status==='approved'?'badge-success':profile?.kyc_status==='pending'?'badge-warning':'badge-info'}`}>
              KYC: {profile?.kyc_status}
            </span>
            <button onClick={()=>setEditing(true)} className="btn-secondary mt-4 w-full">Edit Profile</button>
          </>
        )}
      </div>

      {/* Referral Code */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <p className="text-sm text-slate-500 mb-1">Your Referral Code</p>
        <div className="flex items-center gap-3">
          <p className="text-xl font-black text-orange-500 tracking-widest">{profile?.referral_code}</p>
          <button onClick={()=>{navigator.clipboard.writeText(profile?.referral_code||'');toast.success('Copied!');}} className="text-orange-500 text-sm font-medium">Copy</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          {label:'Total Earned',   value:`${Number(profile?.total_coins_earned||0).toLocaleString()} 🪙`},
          {label:'Total Redeemed', value:`${Number(profile?.total_coins_redeemed||0).toLocaleString()} 🪙`},
          {label:'Referral Invites',value:profile?.referral_stats?.total_referrals||0},
          {label:'Referral Coins', value:`${Number(profile?.referral_stats?.total_earned||0).toLocaleString()} 🪙`},
        ].map(({label,value}) => (
          <div key={label} className="stat-card p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      <button onClick={()=>{logout();navigate('/login');}}
        className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-semibold border border-red-100 hover:bg-red-100 transition-all">
        🚪 Logout
      </button>
    </div>
  );
}
