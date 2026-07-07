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
          data = [
            { id: 'dummy1', business_name: 'Dummy Example Vendor 1', city: 'Example City', state: 'EX', cashback_percent: 5, distance: 0.8 },
            { id: 'dummy2', business_name: 'Dummy Grocery Store', city: 'Example City', state: 'EX', cashback_percent: 10, distance: 1.5 },
            { id: 'dummy3', business_name: 'Example Cafe', city: 'Example City', state: 'EX', cashback_percent: 2, distance: 2.1 }
          ];
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
      <p className="text-sm text-slate-500">Discover shops around you accepting Japsan Coins</p>

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
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl shrink-0">
                🏪
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800 text-sm">{v.business_name || v.owner_name}</h3>
                <p className="text-xs text-slate-500">{v.city}, {v.state}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="badge badge-success">{v.cashback_percent}% Cashback</span>
                  <span className="text-xs text-slate-400">~{v.distance || '1.2'} km</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
