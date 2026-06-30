import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminUsers, adminUserAction } from '../../services/api';
import { format } from 'date-fns';

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [kyc, setKyc]         = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({});
  const limit = 20;

  function load() {
    setLoading(true);
    getAdminUsers({ search, status, kyc_status: kyc, page, limit }).then(r => {
      setUsers(r.data.data?.users || []);
      setTotal(r.data.data?.total || 0);
    }).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search, status, kyc, page]);

  const KYC_COLOR = { pending:'badge-warning', submitted:'badge-info', approved:'badge-success', rejected:'badge-danger' };

  async function doAction(action, userId, extra = {}) {
    try {
      await adminUserAction({ action, user_id: userId, ...extra });
      toast.success('Action completed');
      setModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  }

  return (
    <div className="space-y-4 fade-in">
      <h1 className="text-2xl font-bold text-slate-800">👥 User Management</h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input className="input-field flex-1" placeholder="Search name, phone, email..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
        <select className="input-field w-auto" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}>
          <option value="">All Users</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
        </select>
        <select className="input-field w-auto" value={kyc} onChange={e=>{setKyc(e.target.value);setPage(1);}}>
          <option value="">All KYC Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <p className="text-sm text-slate-500">{total} users found</p>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse"/>)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>{['Name','Phone','Balance','Transactions','KYC','Status','Actions'].map(h=><th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{u.phone}</td>
                    <td className="px-4 py-3 font-semibold text-orange-500 whitespace-nowrap">{Number(u.coin_balance||0).toLocaleString()} 🪙</td>
                    <td className="px-4 py-3 text-slate-600">{u.tx_count||0}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${KYC_COLOR[u.kyc_status]||'badge-info'}`}>{u.kyc_status||'pending'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${u.is_frozen?'badge-danger':u.is_active?'badge-success':'badge-warning'}`}>
                        {u.is_frozen?'Frozen':u.is_active?'Active':'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {(u.kyc_status === 'submitted' || u.kyc_status === 'pending') && (
                          <>
                            <button onClick={() => doAction('approve_kyc', u.id)} className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 font-medium">✅ Approve KYC</button>
                            <button onClick={() => setModal({type:'reject_kyc', userId:u.id, name:u.name})} className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 font-medium">❌ Reject</button>
                          </>
                        )}
                        <button onClick={() => setModal({ type:'freeze', userId:u.id, isFrozen:u.is_frozen, name:u.name })}
                          className={`text-xs px-3 py-1 rounded-lg font-medium ${u.is_frozen?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>
                          {u.is_frozen?'Unfreeze':'Freeze'}
                        </button>
                        <button onClick={() => setModal({ type:'adjust', userId:u.id, name:u.name })}
                          className="text-xs px-3 py-1 rounded-lg font-medium bg-orange-100 text-orange-700">
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {total > limit && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-4 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {Math.ceil(total/limit)}</span>
          <button onClick={() => setPage(p=>p+1)} disabled={page>=Math.ceil(total/limit)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm slide-up">
            {modal.type === 'freeze' && (
              <>
                <h3 className="font-bold text-lg mb-4">{modal.isFrozen ? 'Unfreeze' : 'Freeze'} Account</h3>
                <p className="text-slate-600 mb-4">User: <strong>{modal.name}</strong></p>
                {!modal.isFrozen && <textarea className="input-field mb-4 h-24 resize-none" placeholder="Reason for freezing..." value={form.reason||''} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} />}
                <div className="flex gap-3">
                  <button onClick={() => doAction(modal.isFrozen?'unfreeze':'freeze', modal.userId, {reason:form.reason})}
                    className="btn-primary flex-1">{modal.isFrozen?'Unfreeze':'Freeze'}</button>
                  <button onClick={() => { setModal(null); setForm({}); }} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'adjust' && (
              <>
                <h3 className="font-bold text-lg mb-4">Adjust Wallet — {modal.name}</h3>
                <input type="number" className="input-field mb-3" placeholder="Coins (positive to add, negative to deduct)" value={form.coins||''} onChange={e=>setForm(f=>({...f,coins:e.target.value}))} />
                <textarea className="input-field mb-4 h-20 resize-none" placeholder="Reason for adjustment..." value={form.reason||''} onChange={e=>setForm(f=>({...f,reason:e.target.value}))} />
                <div className="flex gap-3">
                  <button onClick={() => doAction('adjust_wallet', modal.userId, {coins:parseFloat(form.coins),reason:form.reason})}
                    className="btn-primary flex-1">Adjust</button>
                  <button onClick={() => { setModal(null); setForm({}); }} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'reject_kyc' && (
              <>
                <h3 className="font-bold text-lg mb-2">Reject KYC — {modal.name}</h3>
                <textarea className="input-field mb-4 h-24 resize-none" placeholder="Rejection notes..." value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
                <div className="flex gap-3">
                  <button onClick={() => doAction('reject_kyc', modal.userId, {notes:form.notes})} className="btn-primary flex-1 bg-red-500">Reject</button>
                  <button onClick={() => {setModal(null);setForm({});}} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
