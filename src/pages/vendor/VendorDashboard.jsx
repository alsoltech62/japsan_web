import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getWallet } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function VendorDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const { user }              = useAuth();
  const navigate              = useNavigate();

  useEffect(() => {
    getWallet().then(r => setData(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse"/>)}</div>;

  const w = data?.wallet || {};

  return (
    <div className="p-4 space-y-4 fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-800">🏪 {w.business_name || user?.name}</h2>
        <div className="flex items-center gap-2 mt-1">
          <span className={`badge ${w.kyc_status==='approved'?'badge-success':w.kyc_status==='submitted'?'badge-warning':'badge-danger'}`}>
            KYC: {w.kyc_status}
          </span>
        </div>
      </div>

      {w.kyc_status !== 'approved' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="font-semibold text-amber-800 text-sm">⚠️ KYC Pending</p>
          <p className="text-amber-700 text-xs mt-1">Your KYC is under review. You'll be able to process payments once approved.</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:'Coin Balance',     value:`${Number(w.coin_balance||0).toLocaleString()} 🪙`,   color:'text-orange-500' },
          { label:'Cash Wallet',      value:`₹${Number(w.cash_wallet_balance||0).toFixed(2)}`,    color:'text-blue-500' },
          { label:'Total Revenue',    value:`₹${Number(w.total_revenue_generated||0).toFixed(0)}`, color:'text-green-600' },
          { label:'Total Customers',  value:w.total_customers||0,                                   color:'text-purple-600' },
        ].map(({label,value,color}) => (
          <div key={label} className="stat-card p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon:'👤', label:'Profile', to:'/vendor/profile', color:'from-blue-400 to-blue-600', desc:'My Info' },
          { icon:'💳', label:'Process', to:'/vendor/payment', color:'from-orange-400 to-orange-600', desc:'Accept' },
          { icon:'📱', label:'Show QR', to:'/vendor/qr',      color:'from-purple-400 to-purple-600',desc:'QR Code' },
          { icon:'🏦', label:'Withdraw',to:'/vendor/withdraw', color:'from-green-400 to-green-600', desc:'To Bank' },
          { icon:'⚙️', label:'Rewards', to:'/vendor/reward-settings', color:'from-pink-400 to-pink-600', desc:'Settings' },
          { icon:'🎁', label:'Offers',  to:'/vendor/offers',  color:'from-yellow-400 to-yellow-600', desc:'Promos' },
          { icon:'📢', label:'Campaign',to:'/vendor/campaigns',color:'from-red-400 to-red-600', desc:'Notify' },
        ].map(({icon,label,to,color,desc}) => (
          <button key={to} onClick={() => navigate(to)}
            className="bg-white rounded-2xl p-2 text-center border border-slate-100 hover:border-orange-200 hover:shadow transition-all group flex flex-col items-center">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl mb-1`}>{icon}</div>
            <p className="font-semibold text-slate-800 text-xs group-hover:text-orange-600">{label}</p>
            <p className="text-[10px] text-slate-400 leading-tight">{desc}</p>
          </button>
        ))}
      </div>

      {/* Pending Withdrawals */}
      {data?.pending_withdrawals?.length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="font-semibold text-blue-800 text-sm">⏳ Pending Withdrawals</p>
          {data.pending_withdrawals.map(w => (
            <div key={w.id} className="mt-2 flex justify-between text-sm text-blue-700">
              <span>₹{w.amount_requested}</span>
              <span className="badge badge-info">{w.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800">Recent Transactions</h3>
          <button onClick={() => navigate('/vendor/wallet')} className="text-orange-500 text-sm font-medium">See all</button>
        </div>
        {data?.transactions?.slice(0,5).map(tx => (
          <div key={tx.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 mb-2">
            <span className="text-xl">💳</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800">{tx.user_name || 'Customer'}</p>
              <p className="text-xs text-slate-400">Bill: ₹{Number(tx.bill_amount||0).toFixed(0)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">+{Number(tx.coins_amount||0).toLocaleString()} 🪙</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
