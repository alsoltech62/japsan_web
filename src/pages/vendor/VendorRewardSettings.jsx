import React, { useState, useEffect } from 'react';
import { getRewardSettings, updateRewardSettings } from '../../services/api';
import toast from 'react-hot-toast';

export default function VendorRewardSettings() {
  const [settings, setSettings] = useState({
    base_cashback: '10',
    smart_rules: [{ amount: '500', reward: '25' }],
    loyalty_enabled: true,
    loyalty_visits: '5',
    loyalty_reward: '100'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRewardSettings()
      .then(res => {
        if (res.data.data) setSettings(res.data.data);
      })
      .catch(() => toast.error('Failed to load reward settings'));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateRewardSettings(settings);
      toast.success('Reward settings updated!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => {
    setSettings(s => ({ ...s, smart_rules: [...s.smart_rules, { amount: '', reward: '' }] }));
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-xl font-bold text-slate-800">Reward Settings</h2>

      {/* Basic Cashback */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
        <h3 className="font-bold text-slate-800">Automatic Cashback</h3>
        <p className="text-xs text-slate-500">Set the default % of Japsan Coins awarded to customers on every purchase.</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            className="input-field w-24"
            value={settings.base_cashback}
            onChange={(e) => setSettings({ ...settings, base_cashback: e.target.value })}
          />
          <span className="font-medium text-slate-600">%</span>
        </div>
      </div>

      {/* Smart Rules */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Smart Reward Rules</h3>
          <button onClick={addRule} className="text-sm font-medium text-blue-600">+ Add Rule</button>
        </div>
        <p className="text-xs text-slate-500">Set fixed coin rewards for specific bill amounts.</p>
        
        {settings.smart_rules.map((rule, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <span className="text-sm text-slate-600">Buy ₹</span>
            <input
              type="number"
              className="input-field w-full"
              placeholder="Amt"
              value={rule.amount}
              onChange={(e) => {
                const newRules = [...settings.smart_rules];
                newRules[idx].amount = e.target.value;
                setSettings({ ...settings, smart_rules: newRules });
              }}
            />
            <span className="text-sm text-slate-600">=</span>
            <input
              type="number"
              className="input-field w-full"
              placeholder="Coins"
              value={rule.reward}
              onChange={(e) => {
                const newRules = [...settings.smart_rules];
                newRules[idx].reward = e.target.value;
                setSettings({ ...settings, smart_rules: newRules });
              }}
            />
            <span className="text-sm text-slate-600">🪙</span>
          </div>
        ))}
      </div>

      {/* Loyalty Program */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Loyalty Program</h3>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={settings.loyalty_enabled} onChange={e => setSettings({...settings, loyalty_enabled: e.target.checked})} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>
        <p className="text-xs text-slate-500">Reward repeat customers after a certain number of visits.</p>
        {settings.loyalty_enabled && (
          <div className="flex gap-2 items-center mt-2">
            <span className="text-sm text-slate-600">After</span>
            <input type="number" className="input-field w-16" value={settings.loyalty_visits} onChange={e => setSettings({...settings, loyalty_visits: e.target.value})} />
            <span className="text-sm text-slate-600">visits, give</span>
            <input type="number" className="input-field w-20" value={settings.loyalty_reward} onChange={e => setSettings({...settings, loyalty_reward: e.target.value})} />
            <span className="text-sm text-slate-600">🪙</span>
          </div>
        )}
      </div>

      <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
