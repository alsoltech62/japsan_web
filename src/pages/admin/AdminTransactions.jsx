import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { format } from 'date-fns';

const TX_COLORS = { completed:'badge-success', pending:'badge-warning', failed:'badge-danger', reversed:'badge-info', cancelled:'badge-danger' };

export default function AdminTransactions() {
  const [items, setItems]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');
  const [type, setType]     = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  function load() {
    setLoading(true);
    api.get('/admin/transactions.php', { params: { search, type, page, limit } })
      .then(r => { setItems(r.data.data?.transactions || []); setTotal(r.data.data?.total || 0); })
      .catch(() => toast.error('Failed'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search, type, page]);

  return (
    <div className="space-y-4 fade-in">
      <h1 className="text-2xl font-bold text-slate-800">📋 All Transactions</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <input className="input-field flex-1" placeholder="Search ref, user, vendor..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        <select className="input-field w-auto" value={type} onChange={e=>{setType(e.target.value);setPage(1);}}>
          <option value="">All Types</option>
          {['coin_purchase','coin_redemption','cashback','referral_reward','withdrawal','payment','admin_credit','admin_debit','coin_expiry'].map(t=>(
            <option key={t} value={t}>{t.replace(/_/g,' ')}</option>
          ))}
        </select>
      </div>
      <p className="text-sm text-slate-500">{total} transactions</p>

      {loading ? (
        <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-14 bg-slate-200 rounded-xl animate-pulse"/>)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-slate-400"><div className="text-5xl mb-3">📋</div><p>No transactions</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>{['Ref','Type','User','Vendor','Coins','INR','Profit','Status','Date'].map(h=><th key={h} className="px-3 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {items.map(t => (
                  <tr key={t.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-xs text-slate-500">{t.transaction_ref}</td>
                    <td className="px-3 py-2 text-xs font-medium text-slate-700 whitespace-nowrap">{t.type?.replace(/_/g,' ')}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{t.user_name||'—'}</td>
                    <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">{t.vendor_name||'—'}</td>
                    <td className="px-3 py-2 font-semibold text-orange-500 whitespace-nowrap">{t.coins_amount>0?Number(t.coins_amount).toLocaleString()+' 🪙':'—'}</td>
                    <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{t.amount_inr>0?`₹${Number(t.amount_inr).toFixed(2)}`:'—'}</td>
                    <td className="px-3 py-2 text-green-600 whitespace-nowrap">{t.platform_profit>0?`₹${Number(t.platform_profit).toFixed(2)}`:'—'}</td>
                    <td className="px-3 py-2"><span className={`badge ${TX_COLORS[t.status]||'badge-info'}`}>{t.status}</span></td>
                    <td className="px-3 py-2 text-xs text-slate-400 whitespace-nowrap">{t.created_at?format(new Date(t.created_at),'dd MMM, hh:mm a'):''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {total > limit && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {Math.ceil(total/limit)}</span>
          <button onClick={() => setPage(p=>p+1)} disabled={page>=Math.ceil(total/limit)} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
