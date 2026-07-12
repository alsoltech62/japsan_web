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
    <div className="min-h-screen bg-slate-50 pb-24 fade-in font-sans">
      <div className="px-4 pt-4 pb-6 space-y-6">
        
        {/* Total Wallet Balance Card */}
        <div className="relative group cursor-pointer overflow-hidden rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-800 shadow-lg text-white" onClick={() => navigate('/vendor/wallet')}>
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

        {/* KYC Status */}
        {w.kyc_status !== 'approved' && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-[20px] p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl shrink-0">⚠️</div>
            <div>
              <p className="font-bold text-orange-800 text-sm">KYC {w.kyc_status}</p>
              <p className="text-[10px] text-orange-600/80 leading-tight">Your KYC is under review. Please wait for approval.</p>
            </div>
          </div>
        )}

        {/* Quick Access Grid */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-3">Quick Access</h3>
          <div className="grid grid-cols-4 gap-y-6">
            {[
              { icon: '👤', label:'Profile', to:'/vendor/profile' },
              { icon: '💳', label:'Process', to:'/vendor/payment' },
              { icon: '📱', label:'Show QR', to:'/vendor/qr' },
              { icon: '🏦', label:'Withdraw',to:'/vendor/withdraw' },
              { icon: '⚙️', label:'Rewards', to:'/vendor/reward-settings' },
              { icon: '🎁', label:'Offers',  to:'/vendor/offers' },
              { icon: '📢', label:'Campaign',to:'/vendor/campaigns' },
              { icon: '📊', label:'Wallet', to:'/vendor/wallet' }
            ].map((item, idx) => (
              <div key={idx} onClick={() => navigate(item.to)} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-105 transition-transform">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-2xl mb-1 text-slate-700">{item.icon}</div>
                <span className="text-[10px] font-semibold text-slate-600">{item.label}</span>
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
                <span className="text-emerald-500">📈</span>
                <span className="text-xs font-semibold text-slate-700">Total Revenue</span>
              </div>
              <span className="text-xs font-bold text-slate-800">₹{Number(w.total_revenue_generated||0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-orange-500">👥</span>
                <span className="text-xs font-semibold text-slate-700">Total Customers</span>
              </div>
              <span className="text-xs font-bold text-orange-500">{w.total_customers||0}</span>
            </div>
          </div>
        </div>

        {/* Pending Withdrawals */}
        {data?.pending_withdrawals?.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="font-semibold text-blue-800 text-sm">⏳ Pending Withdrawals</p>
            {data.pending_withdrawals.map(wd => (
              <div key={wd.id} className="mt-2 flex justify-between text-sm text-blue-700">
                <span>₹{wd.amount_requested}</span>
                <span className="badge badge-info">{wd.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-sm">Recent Transactions</h3>
            <button onClick={() => navigate('/vendor/wallet')} className="text-slate-900 text-xs font-bold">View All</button>
          </div>
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
            {data?.transactions?.slice(0,5).map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg">💳</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{tx.user_name || 'Customer'}</p>
                  <p className="text-[10px] text-slate-400">Bill: ₹{Number(tx.bill_amount||0).toFixed(0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">+{Number(tx.coins_amount||0).toLocaleString()} JC</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
