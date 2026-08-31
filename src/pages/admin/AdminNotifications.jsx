import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function AdminNotifications() {
  const [form, setForm] = useState({
    target: 'all',
    title: '',
    message: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      return toast.error("Title and message are required");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('target', form.target);
      formData.append('title', form.title);
      formData.append('message', form.message);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/admin/send_notification.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Notifications sent successfully!");
      setForm({ target: 'all', title: '', message: '' });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error(err.message || 'Failed to send notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
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
            <label className="block text-sm font-bold text-slate-700 mb-1">Image Upload (Optional)</label>
            <p className="text-xs text-slate-500 mb-2">Recommended: 16:9 aspect ratio (e.g. 800x450). Max size: 2MB.</p>
            <input 
              type="file" 
              accept="image/*"
              className="input-field" 
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Image Preview:</p>
                <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg border border-slate-200" />
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
