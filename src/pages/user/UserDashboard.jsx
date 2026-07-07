import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getWallet } from '../../services/api';
import CoinBalance from '../../components/common/CoinBalance';
import TransactionList from '../../components/common/TransactionList';
import { useAuth } from '../../context/AuthContext';
import { FiShoppingCart, FiMaximize, FiMapPin, FiUsers, FiGlobe, FiClock } from 'react-icons/fi';

export default function UserDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const { user }            = useAuth();
  const navigate            = useNavigate();

  useEffect(() => {
    getWallet().then(r => setData(r.data.data)).catch(() => toast.error('Failed to load wallet')).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 space-y-6">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-3xl animate-pulse"/>)}
    </div>
  );

  const w = data?.wallet || {};
  return (
    <div className="p-5 space-y-6 fade-in min-h-screen bg-slate-50/50 pb-24">
      {/* Greeting */}
      <div className="pt-2 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-br from-slate-900 to-slate-600 bg-clip-text text-transparent">
            Good day, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-slate-500 text-sm font-medium mt-1 tracking-wide">Let's grow your Japsan Coins</p>
        </div>
      </div>

      {/* Coin Balance Card */}
      <div className="relative group cursor-pointer" onClick={() => navigate('/user/wallet')}>
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
        <div className="relative">
          <CoinBalance coins={w.coin_balance} locked={w.locked_coin_balance} rate={data?.redemption_rate || 0.7} />
        </div>
      </div>

      {/* Expiring Alert */}
      {data?.expiring_coins_30d > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow transition-all">
          <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl shrink-0">
            ⚠️
          </div>
          <div>
            <p className="font-bold text-orange-800 text-sm">Coins expiring soon!</p>
            <p className="text-orange-600/80 text-xs font-medium mt-0.5">{Number(data.expiring_coins_30d).toLocaleString('en-IN')} coins expire in the next 30 days</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: <FiShoppingCart />, label:'Buy Coins', to:'/user/buy-coins', color:'text-orange-600', bg:'bg-orange-50 hover:bg-orange-500 hover:text-white border-orange-100' },
            { icon: <FiMaximize />,     label:'Scan QR',   to:'/user/scan-pay',  color:'text-blue-600',   bg:'bg-blue-50 hover:bg-blue-500 hover:text-white border-blue-100' },
            { icon: <FiMapPin />,       label:'Nearby',    to:'/user/nearby',    color:'text-emerald-600',bg:'bg-emerald-50 hover:bg-emerald-500 hover:text-white border-emerald-100' },
            { icon: <FiUsers />,        label:'Refer',     to:'/user/referral',  color:'text-purple-600', bg:'bg-purple-50 hover:bg-purple-500 hover:text-white border-purple-100' },
            { icon: <FiGlobe />,        label:'Network',   to:'/user/network',   color:'text-pink-600',   bg:'bg-pink-50 hover:bg-pink-500 hover:text-white border-pink-100' },
            { icon: <FiClock />,        label:'History',   to:'/user/wallet',    color:'text-slate-600',  bg:'bg-slate-100 hover:bg-slate-600 hover:text-white border-slate-200' },
          ].map(({icon,label,to,color,bg}) => (
            <button key={label} onClick={() => navigate(to)}
              className={`rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-3 font-semibold text-xs transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 border ${bg} ${color}`}>
              <div className="text-2xl">{icon}</div>
              <span className="tracking-wide">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Overview</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label:'Earned',   value: Number(w.total_coins_earned||0).toLocaleString(), icon:'📈', color:'text-emerald-600', bg:'bg-emerald-50' },
            { label:'Redeemed', value: Number(w.total_coins_redeemed||0).toLocaleString(), icon:'💸', color:'text-blue-600', bg:'bg-blue-50' },
            { label:'Expired',  value: Number(w.total_coins_expired||0).toLocaleString(), icon:'⏳', color:'text-rose-500', bg:'bg-rose-50' },
            { label:'Cash (₹)', value: Number(w.cash_wallet_balance||0).toFixed(2), icon:'💰', color:'text-purple-600', bg:'bg-purple-50' },
          ].map(({label,value,icon,color,bg}) => (
            <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <div className={`w-8 h-8 ${bg} ${color} rounded-full flex items-center justify-center text-sm group-hover:scale-110 transition-transform`}>{icon}</div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
              </div>
              <p className={`text-xl font-black ${color} pl-1 relative z-10`}>{value}</p>
              <div className={`absolute -bottom-4 -right-4 w-16 h-16 rounded-full ${bg} opacity-50 group-hover:scale-150 transition-transform duration-500`}></div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 uppercase tracking-wider text-sm">Recent Activity</h3>
          <button onClick={() => navigate('/user/wallet')} className="text-orange-500 text-sm font-bold hover:text-orange-600">View All →</button>
        </div>
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
          <TransactionList transactions={data?.transactions?.slice(0,5) || []} />
        </div>
      </div>
    </div>
  );
}
