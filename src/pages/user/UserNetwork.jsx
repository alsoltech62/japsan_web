import React, { useState, useEffect } from 'react';
import { getNetwork } from '../../services/api';
import toast from 'react-hot-toast';

export default function UserNetwork() {
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNetwork()
      .then(res => setNetwork(res.data.data))
      .catch(() => toast.error('Failed to load network'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-xl font-bold text-slate-800">My Network</h2>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-purple-50 p-4 rounded-xl text-center border border-purple-100">
              <p className="text-2xl font-bold text-purple-600">{network?.total_size || 0}</p>
              <p className="text-xs text-purple-700 font-medium">Total Network Size</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100">
              <p className="text-2xl font-bold text-green-600">₹{network?.team_earnings || 0}</p>
              <p className="text-xs text-green-700 font-medium">Team Earnings</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
            <h3 className="font-bold text-slate-800 mb-3">Direct Referrals</h3>
            {network?.direct_referrals?.length === 0 ? (
              <p className="text-sm text-slate-500">No direct referrals yet.</p>
            ) : (
              <div className="space-y-3">
                {network?.direct_referrals?.map(r => (
                  <div key={r.id} className="flex justify-between items-center pb-2 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{r.name}</p>
                      <p className="text-xs text-slate-400">Joined {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className="badge badge-success">Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
