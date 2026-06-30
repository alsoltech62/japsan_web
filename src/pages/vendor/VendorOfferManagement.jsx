import React, { useState, useEffect } from 'react';
import { getVendorOffers, createVendorOffer } from '../../services/api';
import toast from 'react-hot-toast';

export default function VendorOfferManagement() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', type: 'Festival Offer', valid_until: '' });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = () => {
    setLoading(true);
    getVendorOffers()
      .then(res => setOffers(res.data.data || []))
      .catch(() => toast.error('Failed to load offers'))
      .finally(() => setLoading(false));
  };

  const handleCreate = async () => {
    if (!newOffer.title || !newOffer.valid_until) return toast.error('Fill required fields');
    try {
      await createVendorOffer(newOffer);
      toast.success('Offer created!');
      setShowModal(false);
      setNewOffer({ title: '', description: '', type: 'Festival Offer', valid_until: '' });
      fetchOffers();
    } catch (err) {
      toast.error('Failed to create offer');
    }
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">My Offers</h2>
        <button onClick={() => setShowModal(true)} className="btn-primary py-2 px-4 text-sm">+ New Offer</button>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-xl" />)}</div>
      ) : offers.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">No active offers. Create one to attract customers!</div>
      ) : (
        <div className="space-y-3">
          {offers.map(o => (
            <div key={o.id} className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl shadow-sm relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-400 opacity-20 rounded-full blur-xl"></div>
              <h3 className="font-bold text-yellow-800">{o.title}</h3>
              <p className="text-xs text-yellow-700 font-medium mb-2">{o.type}</p>
              <p className="text-sm text-yellow-900 mb-2">{o.description}</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-warning text-[10px]">Valid till: {new Date(o.valid_until).toLocaleDateString()}</span>
                <span className={`badge ${o.status === 'active' ? 'badge-success' : 'badge-danger'} text-[10px]`}>{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4 slide-up">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-lg text-slate-800">Create Offer</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500">Offer Type</label>
              <select className="input-field w-full mt-1" value={newOffer.type} onChange={e => setNewOffer({...newOffer, type: e.target.value})}>
                <option>Cashback Offer</option>
                <option>Festival Offer</option>
                <option>Happy Hour Offer</option>
                <option>Bonus Coin Offer</option>
              </select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-500">Title</label>
              <input type="text" className="input-field w-full mt-1" placeholder="e.g. Diwali Dhamaka" value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">Description</label>
              <textarea className="input-field w-full mt-1 h-20" placeholder="e.g. Get double coins on purchases above ₹1000" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})}></textarea>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500">Valid Until</label>
              <input type="date" className="input-field w-full mt-1" value={newOffer.valid_until} onChange={e => setNewOffer({...newOffer, valid_until: e.target.value})} />
            </div>

            <button onClick={handleCreate} className="btn-primary w-full">Create Offer</button>
          </div>
        </div>
      )}
    </div>
  );
}
