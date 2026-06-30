import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getWallet } from '../../services/api';
import CoinBalance from '../../components/common/CoinBalance';
import TransactionList from '../../components/common/TransactionList';
import { useAuth } from '../../context/AuthContext';

export default function UserDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const { user }            = useAuth();
  const navigate            = useNavigate();

  useEffect(() => {
    getWallet().then(r => setData(r.data.data)).catch(() => toast.error('Failed to load wallet')).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl animate-pulse"/>)}
    </div>
  );

  const w = data?.wallet || {};
  return (
    <div className="p-4 space-y-4 fade-in">
      {/* Greeting */}
      <div className="pt-2">
        <h2 className="text-xl font-bold text-slate-800">Good day, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-slate-500 text-sm">Your coin dashboard</p>
      </div>

      {/* Coin Balance Card */}
      <CoinBalance coins={w.coin_balance} locked={w.locked_coin_balance} rate={data?.redemption_rate || 0.7} />

      {/* Expiring Alert */}
      {data?.expiring_coins_30d > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-amber-800 text-sm">Coins expiring soon!</p>
            <p className="text-amber-700 text-xs">{Number(data.expiring_coins_30d).toLocaleString('en-IN')} coins expire in the next 30 days</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon:'🛒', label:'Buy Coins',  to:'/user/buy-coins',  color:'bg-orange-50 text-orange-600' },
          { icon:'📱', label:'Scan QR',    to:'/user/scan-pay',   color:'bg-blue-50 text-blue-600' },
          { icon:'📍', label:'Nearby',     to:'/user/nearby',     color:'bg-red-50 text-red-600' },
          { icon:'👥', label:'Refer',      to:'/user/referral',   color:'bg-green-50 text-green-600' },
          { icon:'🌐', label:'Network',    to:'/user/network',    color:'bg-purple-50 text-purple-600' },
          { icon:'📜', label:'History',    to:'/user/wallet',     color:'bg-slate-50 text-slate-600' },
        ].map(({icon,label,to,color}) => (
          <button key={to} onClick={() => navigate(to)}
            className={`${color} rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 font-medium text-xs sm:text-sm hover:opacity-80 transition-all active:scale-95 shadow-sm border border-white/50`}>
            <span className="text-2xl mb-1">{icon}</span>{label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:'Total Earned',   value: Number(w.total_coins_earned||0).toLocaleString(), icon:'📈', color:'text-green-600' },
          { label:'Total Redeemed', value: Number(w.total_coins_redeemed||0).toLocaleString(), icon:'💸', color:'text-blue-600' },
          { label:'Expired Coins',  value: Number(w.total_coins_expired||0).toLocaleString(), icon:'⏰', color:'text-red-500' },
          { label:'Cash Wallet',    value: `₹${Number(w.cash_wallet_balance||0).toFixed(2)}`, icon:'💰', color:'text-purple-600' },
        ].map(({label,value,icon,color}) => (
          <div key={label} className="stat-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <span>{icon}</span>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800">Recent Activity</h3>
          <button onClick={() => navigate('/user/wallet')} className="text-orange-500 text-sm font-medium">See all</button>
        </div>
        <TransactionList transactions={data?.transactions?.slice(0,5) || []} />
      </div>
    </div>
  );
}
