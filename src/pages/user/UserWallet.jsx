import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getWallet } from '../../services/api';
import CoinBalance from '../../components/common/CoinBalance';
import TransactionList from '../../components/common/TransactionList';

export default function UserWallet() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    getWallet().then(r => setData(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse"/>)}</div>;

  const w  = data?.wallet || {};
  const txs = (data?.transactions || []).filter(t => filter === 'all' || t.type === filter);

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-xl font-bold text-slate-800">💳 My Wallet</h2>
      <CoinBalance coins={w.coin_balance} locked={w.locked_coin_balance} rate={data?.redemption_rate||0.7}/>

      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-2xl font-black text-orange-500">🪙 {Number(w.coin_balance||0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500 mt-1">Available Coins</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-purple-500">₹{Number(w.cash_wallet_balance||0).toFixed(2)}</p>
            <p className="text-xs text-slate-500 mt-1">Cash Wallet</p>
          </div>
        </div>
        {w.locked_coin_balance > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">🔒 <span className="font-semibold">{Number(w.locked_coin_balance).toLocaleString()}</span> coins locked (referral)</p>
          </div>
        )}
      </div>

      {data?.expiring_coins_30d > 0 && (
        <div className="bg-red-50 rounded-2xl p-4 flex gap-3 items-center border border-red-100">
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-semibold text-red-800 text-sm">{Number(data.expiring_coins_30d).toLocaleString()} coins expiring in 30 days!</p>
            <p className="text-xs text-red-600">Use them before they expire to avoid losing value</p>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[['all','All'],['payment','Payments'],['cashback','Cashback'],['coin_purchase','Purchases'],['referral_reward','Referrals']].map(([val,label])=>(
          <button key={val} onClick={()=>setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filter===val?'bg-orange-500 text-white shadow':'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'}`}>
            {label}
          </button>
        ))}
      </div>

      <TransactionList transactions={txs} emptyMessage="No transactions for this filter"/>
    </div>
  );
}
