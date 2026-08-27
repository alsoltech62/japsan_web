import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminNotifications() {
  const [form, setForm] = useState({
    target: 'all',
    title: '',
    message: '',
    image_url: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      return toast.error("Title and message are required");
    }

    setLoading(true);
    try {
      await api.post('/admin/send_notification.php', form);
      toast.success("Notifications sent successfully!");
      setForm({ target: 'all', title: '', message: '', image_url: '' });
    } catch (err) {
      toast.error(err.message || 'Failed to send notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800">Send Notification</h2>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Target Audience</label>
            <select 
              className="input-field"
              value={form.target}
              onChange={e => setForm({...form, target: e.target.value})}
            >
              <option value="all">All Users & Vendors</option>
              <option value="users">Users Only</option>
              <option value="vendors">Vendors Only</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. Special Offer!" 
              value={form.title}
              onChange={e => setForm({...form, title: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
            <textarea 
              className="input-field min-h-[120px]" 
              placeholder="Your notification message..." 
              value={form.message}
              onChange={e => setForm({...form, message: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Image URL (Optional)</label>
            <input 
              type="url" 
              className="input-field" 
              placeholder="https://example.com/image.png" 
              value={form.image_url}
              onChange={e => setForm({...form, image_url: e.target.value})}
            />
            {form.image_url && (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Image Preview:</p>
                <img src={form.image_url} alt="Preview" className="max-h-32 rounded-lg border border-slate-200" onError={(e) => e.target.style.display='none'} />
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin text-xl">↻</span> : <span>📢</span>}
            {loading ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}
