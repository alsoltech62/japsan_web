import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSettings, updateSettings } from '../../services/api';

const GROUPS = {
  'Coin Economy': ['coin_purchase_price_inr','redemption_rate_min','redemption_rate_max','redemption_rate_current','coin_expiry_days'],
  'Bonus & Cashback': ['bonus_threshold','bonus_coins','cashback_percent','max_cashback_percent'],
  'Limits & Caps': ['daily_redemption_cap','vendor_distribution_limit','min_withdrawal_amount'],
  'Fees & Settlement': ['vendor_withdrawal_fee_percent','settlement_delay_days'],
  'Referral System': ['referral_coins_user_user','referral_coins_vendor_user','referral_coins_vendor_vendor','referral_lock_days','referral_unlock_on_transaction'],
  'Feature Toggles': ['feature_referral','feature_qr_payment','feature_whatsapp','feature_notifications','feature_coin_purchase'],
  'Platform Info': ['platform_name','support_phone','support_email','otp_expiry_minutes','max_otp_attempts'],
};

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [dirty, setDirty]       = useState({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [activeGroup, setActiveGroup] = useState('Coin Economy');

  useEffect(() => {
    getSettings().then(r => setSettings(r.data.data)).catch(() => toast.error('Failed to load settings')).finally(() => setLoading(false));
  }, []);

  function handleChange(key, value) {
    setDirty(d => ({ ...d, [key]: value }));
  }

  async function handleSave() {
    if (!Object.keys(dirty).length) return toast('No changes to save');
    setSaving(true);
    try {
      await updateSettings(dirty);
      setSettings(s => {
        const updated = { ...s };
        Object.entries(dirty).forEach(([k,v]) => { if (updated[k]) updated[k] = { ...updated[k], value: v, raw: String(v) }; });
        return updated;
      });
      setDirty({});
      toast.success(`${Object.keys(dirty).length} setting(s) saved!`);
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    setSaving(false);
  }

  function getValue(key) {
    return dirty[key] !== undefined ? dirty[key] : (settings[key]?.raw ?? '');
  }

  if (loading) return <div className="space-y-4">{[1,2,3].map(i=><div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse"/>)}</div>;

  const keys = GROUPS[activeGroup] || [];

  return (
    <div className="space-y-5 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">⚙️ Platform Settings</h1>
        {Object.keys(dirty).length > 0 && (
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-4 py-2 disabled:opacity-50">
            {saving ? '⏳ Saving...' : `💾 Save ${Object.keys(dirty).length} Change(s)`}
          </button>
        )}
      </div>

      <p className="text-sm text-slate-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        ⚠️ All platform rules are controlled here — no coding needed. Changes take effect immediately.
      </p>

      {/* Group Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Object.keys(GROUPS).map(g => (
          <button key={g} onClick={() => setActiveGroup(g)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeGroup===g?'bg-orange-500 text-white':'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'}`}>
            {g}
          </button>
        ))}
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {keys.map((key, idx) => {
          const s = settings[key];
          if (!s) return null;
          const isDirty = dirty[key] !== undefined;
          const isBoolean = s.type === 'boolean';
          return (
            <div key={key} className={`p-4 ${idx < keys.length-1 ? 'border-b border-slate-100' : ''} ${isDirty ? 'bg-orange-50' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <label className="block font-semibold text-slate-700 text-sm">{key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</label>
                  {s.description && <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isDirty && <span className="text-xs text-orange-500 font-medium">Modified</span>}
                  {isBoolean ? (
                    <button onClick={() => handleChange(key, getValue(key)==='true' ? 'false' : 'true')}
                      className={`relative w-12 h-6 rounded-full transition-all ${getValue(key)==='true'?'bg-green-500':'bg-slate-300'}`}>
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-all shadow ${getValue(key)==='true'?'right-0.5':'left-0.5'}`}/>
                    </button>
                  ) : (
                    <input type={s.type==='number'?'number':'text'}
                      className={`w-36 px-3 py-2 border-2 rounded-xl text-sm font-medium text-right focus:outline-none transition-all ${isDirty?'border-orange-400 bg-white':'border-slate-200'}`}
                      value={getValue(key)} onChange={e => handleChange(key, e.target.value)} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
