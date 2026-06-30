import React, { useState, useEffect } from 'react';
import { getNearbyVendors } from '../../services/api';
import toast from 'react-hot-toast';

export default function UserNearbyVendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate getting location
    getNearbyVendors({ lat: 22.5726, lng: 88.3639 })
      .then(res => setVendors(res.data.data || []))
      .catch(() => toast.error('Failed to load nearby vendors'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-xl font-bold text-slate-800">Nearby Vendors</h2>
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
