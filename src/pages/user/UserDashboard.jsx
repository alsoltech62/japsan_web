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
    <div className="min-h-screen bg-slate-50 pb-24 fade-in font-sans">
      <div className="px-4 pt-4 pb-6 space-y-6">
        
        {/* Total Wallet Balance Card */}
        <div className="relative group cursor-pointer overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg text-white" onClick={() => navigate('/user/wallet')}>
          <div className="absolute -right-4 -top-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-20"></div>
          <div className="p-5 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-medium text-sm">Total Wallet Balance</span>
                <span className="text-slate-400">👁️</span>
              </div>
              <img src="/JapSan.png" alt="Coins" className="w-12 h-12 absolute right-0 top-6 opacity-90 object-contain drop-shadow-md" />
            </div>
            
            <h2 className="text-3xl font-black mb-1">{Number(w.coin_balance || 0).toLocaleString()} <span className="text-orange-400 text-2xl">JC</span></h2>
            <p className="text-slate-400 text-xs font-medium mb-6">≈ ₹{Number(w.cash_wallet_balance || 0).toFixed(2)}</p>
            
            <button className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-white transition-colors">
              Wallet Details &gt;
            </button>
          </div>
        </div>

        {/* Promo Banner */}
        <div className="mt-6 mb-2 rounded-[24px] overflow-hidden shadow-lg border border-slate-200">
          <img src="https://img.freepik.com/free-vector/gradient-crypto-sale-banner_23-2149306019.jpg?w=1000" alt="Promo" className="w-full h-32 md:h-48 object-cover" />
        </div>

        {/* Primary Actions Row */}
        <div className="flex justify-between items-start px-2">
          {[
            { icon: <FiShoppingCart size={20}/>, label: 'Buy Coins', to: '/user/buy-coins', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
            { icon: <FiUsers size={20}/>, label: 'Send JC', to: '/user/scan-pay', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
            { icon: <FiMaximize size={20}/>, label: 'Scan & Pay', to: '/user/scan-pay', color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
            { icon: <FiGlobe size={20}/>, label: 'Request', to: '/user/wallet', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => navigate(item.to)}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm ${item.bg} ${item.color}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-[20px] p-4 flex items-center justify-between border border-orange-200">
          <div className="flex-1 pr-2">
            <h3 className="font-bold text-slate-800 text-sm mb-1">Invite & Earn More</h3>
            <p className="text-[10px] text-slate-600 mb-3 leading-tight">Refer your friends and earn Unlimited JC Rewards</p>
            <button onClick={() => navigate('/user/referral')} className="bg-slate-900 text-white text-[10px] font-bold px-4 py-1.5 rounded-lg hover:bg-slate-800 transition-colors">
              Invite Now
            </button>
          </div>
          <div className="text-4xl">🎁</div>
        </div>

        {/* Quick Access Grid */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Access</h3>
          <div className="grid grid-cols-4 gap-y-4">
            {[
              { icon: '👥', label: 'My Network', to: '/user/network' },
              { icon: '📄', label: 'Transactions', to: '/user/wallet' },
              { icon: '🎁', label: 'Rewards', to: '/user/referral' },
              { icon: '🏷️', label: 'Offers', to: '/user/nearby' },
              { icon: '🏆', label: 'Holdings', to: '/user/wallet' },
              { icon: '🏅', label: 'Rank', to: '/user/network' },
              { icon: '🛡️', label: 'KYC', to: '/user/profile' },
              { icon: '❓', label: 'Help Center', to: '/user/profile' }
            ].map((item, idx) => (
              <div key={idx} onClick={() => navigate(item.to)} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform">
                <div className="text-xl mb-1 text-slate-700">{item.icon}</div>
                <span className="text-[10px] font-medium text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Performance */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-slate-800">My Performance</h3>
            <span className="text-xs text-slate-500 cursor-pointer">This Month ⌵</span>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">👥</span>
                <span className="text-xs font-semibold text-slate-700">Team Business</span>
              </div>
              <span className="text-xs font-bold text-slate-800">₹{Number(w.total_revenue_generated||0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-orange-500">🔗</span>
                <span className="text-xs font-semibold text-slate-700">Total Referrals</span>
              </div>
              <span className="text-xs font-bold text-orange-500">{Number(w.total_coins_earned||0).toLocaleString()} JC</span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm">Recent Transactions</h3>
            <button onClick={() => navigate('/user/wallet')} className="text-slate-900 text-xs font-bold">View All</button>
          </div>
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
            <TransactionList transactions={data?.transactions?.slice(0,4) || []} />
          </div>
        </div>

      </div>
    </div>
  );
}
