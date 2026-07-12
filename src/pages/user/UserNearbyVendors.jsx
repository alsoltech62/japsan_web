import React, { useState, useEffect } from 'react';
import { getNearbyVendors } from '../../services/api';
import toast from 'react-hot-toast';

export default function UserNearbyVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate getting location
    getNearbyVendors({ lat: 22.5726, lng: 88.3639 })
      .then(res => {
        let data = res.data.data || [];
        if (data.length === 0) {
          data.push({
            id: 'dummy',
            business_name: 'Japsan SuperMart (Demo)',
            business_address: 'Main Market Area',
            city: 'Demo City',
            owner_name: 'Demo Vendor',
            distance: '1.2',
            cashback_percent: '10',
            visiting_card_photo: 'https://placehold.co/600x400/png?text=Visiting+Card',
            latest_offer: {
              title: 'Mega Diwali Sale',
              description: 'Get 50% Off on Groceries and daily essentials up to ₹500.'
            }
          });
        }
        setVendors(data);
      })
      .catch(() => toast.error('Failed to load nearby vendors'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 space-y-4 fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800">Nearby Vendors</h2>
      </div>
      <p className="text-sm text-slate-500">Discover shops around you accepting Japsan Pays</p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      ) : vendors.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">No vendors found nearby.</div>
      ) : (
        <div className="space-y-3">
          {vendors.map(v => (
            <div key={v.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start gap-4">
              {v.profile_photo ? (
                <img src={v.profile_photo} alt="logo" className="w-12 h-12 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl shrink-0">
                  🏪
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm">{v.business_name || v.owner_name}</h3>
                <p className="text-xs text-slate-500">{[v.business_address, v.city].filter(Boolean).join(', ')}</p>
                
                {v.latest_offer && (
                  <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-2">
                    <p className="text-[10px] font-bold text-green-700 uppercase mb-0.5">🔥 Active Offer</p>
                    <p className="text-xs font-semibold text-green-800">{v.latest_offer.title}</p>
                    {v.latest_offer.description && (
                      <p className="text-[10px] text-green-600 line-clamp-2 mt-0.5">{v.latest_offer.description}</p>
                    )}
                  </div>
                )}
                
                <div className="mt-2 flex items-center gap-2">
                  <span className="badge badge-success">{v.cashback_percent}% Cashback</span>
                  <span className="text-xs text-slate-400">~{v.distance || '1.2'} km</span>
                </div>
                
                {v.visiting_card_photo && (
                  <div className="mt-3">
                    <p className="text-xs text-slate-400 mb-1 font-medium">Visiting Card</p>
                    <img src={v.visiting_card_photo} alt="Visiting Card" className="w-full max-w-[200px] h-auto rounded-lg border border-slate-200 shadow-sm" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
