import React, { useState } from 'react';
import { sendVendorCampaign } from '../../services/api';
import toast from 'react-hot-toast';

export default function VendorCampaigns() {
  const [campaign, setCampaign] = useState({ type: 'push', target: 'all', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!campaign.message) return toast.error('Enter a message');
    setLoading(true);
    try {
      const res = await sendVendorCampaign(campaign);
      toast.success(res?.data?.message || 'Campaign sent successfully!');
      
      // If it's a whatsapp campaign and backend returns numbers, optionally open wa.me links
      if (campaign.type === 'whatsapp' && res?.data?.data?.whatsapp_numbers) {
        const numbers = res.data.data.whatsapp_numbers;
        if (numbers.length > 0) {
          // Open first number in Whatsapp Web for now as an example
          const text = encodeURIComponent(campaign.message);
          window.open(`https://wa.me/${numbers[0].replace(/\D/g,'')}?text=${text}`, '_blank');
          if (numbers.length > 1) {
             toast.success(`Redirected for 1st customer. ${numbers.length - 1} more in queue.`);
          }
        }
      }
      
      setCampaign({ ...campaign, message: '' });
    } catch (err) {
      toast.error('Failed to send campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-xl font-bold text-slate-800">Campaigns</h2>
      <p className="text-sm text-slate-500">Engage your customers with Push Notifications or WhatsApp Messages.</p>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
        
        <div>
          <label className="text-xs font-semibold text-slate-500">Campaign Type</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button 
              className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${campaign.type === 'push' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              onClick={() => setCampaign({...campaign, type: 'push'})}>
              🔔 Push Notification
            </button>
            <button 
              className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${campaign.type === 'whatsapp' ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              onClick={() => setCampaign({...campaign, type: 'whatsapp'})}>
              💬 WhatsApp
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">Target Audience</label>
          <select className="input-field w-full mt-1" value={campaign.target} onChange={e => setCampaign({...campaign, target: e.target.value})}>
            <option value="all">All My Customers</option>
            <option value="repeat">Repeat Customers (&gt;2 visits)</option>
            <option value="high_value">High Value Customers (&gt;₹5000)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-500">Message</label>
          <textarea 
            className="input-field w-full mt-1 h-24" 
            placeholder={campaign.type === 'push' ? "e.g. Shop today and get extra 100 JC Reward!" : "e.g. Hello! Special offer for our loyal customers..."}
            value={campaign.message}
            onChange={e => setCampaign({...campaign, message: e.target.value})}
          ></textarea>
        </div>

        <button onClick={handleSend} disabled={loading} className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all ${campaign.type === 'whatsapp' ? 'bg-green-600 hover:bg-green-700 hover:shadow-green-500/30' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'}`}>
          {loading ? 'Sending...' : `Send ${campaign.type === 'push' ? 'Notification' : 'WhatsApp'} Blast`}
        </button>
      </div>
    </div>
  );
}
