import React, { useEffect, useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { getVendorProfile, updateVendorProfile, uploadFile } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function VendorProfile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { logout, updateUser }= useAuth();
  const navigate              = useNavigate();
  const fileInputRef = useRef(null);

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
        bank_name: r.data.data.bank_name || '',
        visiting_card_photo: r.data.data.visiting_card_photo || ''
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await uploadFile(fd);
      if (res.data.success) {
        setForm(f => ({ ...f, visiting_card_photo: res.data.data.url }));
        toast.success('Photo uploaded!');
      } else {
        toast.error(res.data.message || 'Upload failed');
      }
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

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
            <div>
              <label className="text-sm font-medium text-slate-700">Visiting Card Photo</label>
              <div className="mt-1 flex items-center gap-3">
                {form.visiting_card_photo && (
                  <img src={form.visiting_card_photo} alt="Visiting Card" className="w-16 h-12 object-cover rounded shadow-sm border border-slate-200" />
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-secondary text-sm" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Card'}
                </button>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              </div>
            </div>

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
            <div className="bg-orange-50 border border-orange-100 rounded-xl py-1 px-3 mt-2 inline-flex items-center gap-2 mx-auto">
              <span className="text-orange-500 font-bold text-sm">QR</span>
              <span className="text-orange-700 font-bold text-sm">{profile?.phone}@japsan</span>
              <button onClick={() => {navigator.clipboard.writeText(`${profile?.phone}@japsan`); toast.success('UPI ID Copied!');}} className="text-orange-500 hover:text-orange-700" title="Copy UPI ID">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
            {profile?.email && <p className="text-slate-400 text-sm mt-2">{profile?.email}</p>}
            <p className="text-slate-500 text-sm mt-1">📍 {profile?.business_address ? `${profile.business_address}, ${profile.city}` : profile?.city}</p>
            {profile?.visiting_card_photo && (
              <div className="mt-3">
                <p className="text-xs text-slate-400 mb-1">Visiting Card</p>
                <img src={profile.visiting_card_photo} alt="Visiting Card" className="w-full max-w-[200px] mx-auto rounded shadow-sm border border-slate-100" />
              </div>
            )}
            <span className={`badge mt-2 inline-flex ${profile?.kyc_status==='approved'?'badge-success':profile?.kyc_status==='pending'?'badge-warning':'badge-info'}`}>
              KYC: {profile?.kyc_status}
            </span>
            <button onClick={()=>setEditing(true)} className="btn-secondary mt-4 w-full border-blue-200 text-blue-600 hover:bg-blue-50">Edit Profile</button>
          </>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm mt-4">
        <div className="p-4 border-b border-slate-50">
          <h3 className="font-bold text-slate-800">Support & Information</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {[
            {icon: 'ℹ️', label: 'About Us', text: 'Japsan Pay Ecosystem connects users and vendors through a dynamic rewards and payment system.'},
            {icon: '🎧', label: 'Support & Help', text: 'Contact us at support@japsanpay.com or call +91 98765 43210. Available 24/7.'},
            {icon: '❓', label: 'FAQs / Q&A', text: 'Q: How to withdraw? A: Use the withdraw section to transfer coins to your bank account.\nQ: When do referral coins unlock? A: When referred users make their first transaction.'},
            {icon: '🔒', label: 'Privacy Policy', text: 'Your data is secured and only used for KYC and transactions.'}
          ].map((item, idx) => (
            <details key={idx} className="group p-4 bg-white [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span className="font-medium text-slate-700">{item.label}</span>
                </div>
                <span className="transition group-open:rotate-180">
                  <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><polyline points="6 9 12 15 18 9" /></svg>
                </span>
              </summary>
              <p className="mt-3 text-sm text-slate-500 pl-8 leading-relaxed whitespace-pre-wrap">{item.text}</p>
            </details>
          ))}
        </div>
      </div>

      <button onClick={()=>{logout();navigate('/login');}}
        className="w-full py-3 bg-red-50 text-red-600 rounded-2xl font-semibold border border-red-100 hover:bg-red-100 transition-all shadow-sm">
        🚪 Logout
      </button>
    </div>
  );
}
