import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getWallet } from '../../services/api';
import TransactionList from '../../components/common/TransactionList';
import { useNavigate } from 'react-router-dom';

export default function VendorWallet() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    getWallet().then(r => setData(r.data.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 space-y-4">{[1,2,3].map(i=><div key={i} className="h-20 bg-slate-200 rounded-2xl animate-pulse"/>)}</div>;

  const w = data?.wallet || {};
  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-xl font-bold text-slate-800">💼 Vendor Wallet</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="coin-card p-4 text-white">
          <p className="text-xs text-slate-400">Coin Balance</p>
          <p className="text-2xl font-black text-yellow-400">{Number(w.coin_balance||0).toLocaleString()} 🪙</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100">
          <p className="text-xs text-slate-400">Cash Wallet</p>
          <p className="text-2xl font-black text-green-600">₹{Number(w.cash_wallet_balance||0).toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label:'Total Revenue',      value:`₹${Number(w.total_revenue_generated||0).toLocaleString('en-IN')}` },
          { label:'Coins Distributed',  value:`${Number(w.total_coins_distributed||0).toLocaleString()} 🪙` },
        ].map(({label,value}) => (
          <div key={label} className="stat-card p-4">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            <p className="font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {data?.pending_withdrawals?.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
          <p className="font-semibold text-amber-800 text-sm">⏳ Pending Withdrawal Requests</p>
          {data.pending_withdrawals.map(r => (
            <div key={r.id} className="flex justify-between mt-2 text-sm text-amber-700">
              <span>₹{r.amount_requested}</span><span className="badge badge-warning">{r.status}</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate('/vendor/withdraw')} className="btn-primary w-full">🏦 Withdraw to Bank</button>

      <div>
        <h3 className="font-bold text-slate-800 mb-3">Transaction History</h3>
        <TransactionList transactions={data?.transactions || []} />
      </div>
    </div>
  );
}
