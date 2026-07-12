import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminVendors, adminVendorAction } from '../../services/api';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState('');
  const [kyc, setKyc]         = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({});
  const limit = 20;

  function load() {
    setLoading(true);
    getAdminVendors({ search, kyc_status: kyc, page, limit }).then(r => {
      setVendors(r.data.data?.vendors || []);
      setTotal(r.data.data?.total || 0);
    }).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [search, kyc, page]);

  async function doAction(action, vendorId, extra = {}) {
    try {
      await adminVendorAction({ action, vendor_id: vendorId, ...extra });
      toast.success('Action completed');
      setModal(null); setForm({});
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  const KYC_COLOR = { pending:'badge-warning', submitted:'badge-info', approved:'badge-success', rejected:'badge-danger' };

  return (
    <div className="space-y-4 fade-in">
      <h1 className="text-2xl font-bold text-slate-800">🏪 Vendor Management</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <input className="input-field flex-1" placeholder="Search business, phone, owner..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
        <select className="input-field w-auto" value={kyc} onChange={e=>{setKyc(e.target.value);setPage(1);}}>
          <option value="">All KYC Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <p className="text-sm text-slate-500">{total} vendors found</p>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse"/>)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>{['Business','Phone','City','KYC','Revenue','Cashback','Actions'].map(h=><th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} className="border-t border-slate-50 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{v.business_name}</p>
                      <p className="text-xs text-slate-400">{v.owner_name} • {v.business_type}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{v.phone}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{v.city}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${KYC_COLOR[v.kyc_status]||'badge-info'}`}>{v.kyc_status}</span>
                      <div className="mt-1 flex flex-col gap-1">
                        {v.kyc_document && (
                          <a href={v.kyc_document} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline font-medium hover:text-blue-800 flex items-center gap-1">
                            <span>📄</span> View Front
                          </a>
                        )}
                        {v.kyc_document_back && (
                          <a href={v.kyc_document_back} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline font-medium hover:text-blue-800 flex items-center gap-1">
                            <span>📄</span> View Back
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-green-600 whitespace-nowrap">₹{Number(v.total_revenue_generated||0).toFixed(0)}</td>
                    <td className="px-4 py-3 text-orange-600 font-semibold">{v.cashback_percent}%</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {(v.kyc_status === 'submitted' || v.kyc_status === 'pending') && (
                          <>
                            <button onClick={() => doAction('approve_kyc', v.id)} className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 font-medium">✅ Approve KYC</button>
                            <button onClick={() => setModal({type:'reject_kyc', vendorId:v.id, name:v.business_name})} className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 font-medium">❌ Reject</button>
                          </>
                        )}
                        <button onClick={() => setModal({type:'freeze', vendorId:v.id, isFrozen:v.is_frozen, name:v.business_name})}
                          className={`text-xs px-2 py-1 rounded-lg font-medium ${v.is_frozen?'bg-green-100 text-green-700':'bg-slate-100 text-slate-700'}`}>
                          {v.is_frozen?'Unfreeze':'Freeze'}
                        </button>
                        <button onClick={() => setModal({type:'cashback', vendorId:v.id, name:v.business_name, current:v.cashback_percent})}
                          className="text-xs px-2 py-1 rounded-lg bg-orange-100 text-orange-700 font-medium">Cashback %</button>
                      </div>
                    </td>
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

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm slide-up">
            {modal.type === 'freeze' && (
              <>
                <h3 className="font-bold text-lg mb-2">{modal.isFrozen?'Unfreeze':'Freeze'} — {modal.name}</h3>
                {!modal.isFrozen && <textarea className="input-field mb-4 h-24 resize-none" placeholder="Reason..." value={form.reason||''} onChange={e=>setForm(f=>({...f,reason:e.target.value}))}/>}
                <div className="flex gap-3">
                  <button onClick={() => doAction(modal.isFrozen?'unfreeze':'freeze', modal.vendorId, {reason:form.reason})} className="btn-primary flex-1">{modal.isFrozen?'Unfreeze':'Freeze'}</button>
                  <button onClick={() => {setModal(null);setForm({});}} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'reject_kyc' && (
              <>
                <h3 className="font-bold text-lg mb-2">Reject KYC — {modal.name}</h3>
                <textarea className="input-field mb-4 h-24 resize-none" placeholder="Rejection notes..." value={form.notes||''} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}/>
                <div className="flex gap-3">
                  <button onClick={() => doAction('reject_kyc', modal.vendorId, {notes:form.notes})} className="btn-primary flex-1 bg-red-500">Reject</button>
                  <button onClick={() => {setModal(null);setForm({});}} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'cashback' && (
              <>
                <h3 className="font-bold text-lg mb-2">Set Cashback % — {modal.name}</h3>
                <p className="text-sm text-slate-500 mb-3">Current: {modal.current}%</p>
                <input type="number" className="input-field mb-4" placeholder="New cashback %" min={1} max={20} value={form.pct||modal.current} onChange={e=>setForm(f=>({...f,pct:e.target.value}))}/>
                <div className="flex gap-3">
                  <button onClick={() => doAction('update_cashback', modal.vendorId, {cashback_percent:form.pct})} className="btn-primary flex-1">Update</button>
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
