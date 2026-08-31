import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getAdminVendors, adminVendorAction } from '../../services/api';

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [kyc, setKyc] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
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

  const KYC_COLOR = { pending: 'badge-warning', submitted: 'badge-info', approved: 'badge-success', rejected: 'badge-danger' };

  async function downloadExcel() {
    try {
      const toastId = toast.loading('Generating Excel...');
      const r = await getAdminVendors({ search, kyc_status: kyc, page: 1, limit: 99999 });
      const allVendors = r.data.data?.vendors || [];
      toast.dismiss(toastId);
      if (!allVendors.length) return toast.error('No vendors found to download');

      const headers = ['ID', 'Business Name', 'Owner Name', 'Phone', 'Email', 'Business Type', 'City', 'Address', 'Bank Account', 'Bank IFSC', 'KYC Status', 'Revenue', 'Status', 'Registered At'];
      const rows = allVendors.map(v => [
        v.id, `"${v.business_name || ''}"`, `"${v.owner_name || ''}"`, `"${v.phone || ''}"`, `"${v.email || ''}"`, `"${v.business_type || ''}"`,
        `"${v.city || ''}"`, `"${v.business_address || ''}"`, `"${v.bank_account_number || ''}"`, `"${v.bank_ifsc || ''}"`,
        v.kyc_status, v.total_revenue_generated || 0, v.is_frozen ? 'Frozen' : v.is_active ? 'Active' : 'Inactive', v.created_at
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Vendors_Export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to download Excel');
    }
  }

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">🏪 Vendor Management</h1>
        <button onClick={downloadExcel} className="btn-primary flex items-center gap-2">
          <span>📥</span> Export to Excel
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input className="input-field flex-1" placeholder="Search business, phone, owner..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <select className="input-field w-auto" value={kyc} onChange={e => { setKyc(e.target.value); setPage(1); }}>
          <option value="">All KYC Status</option>
          <option value="pending">Pending</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <p className="text-sm text-slate-500">{total} vendors found</p>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-200 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-left">
                <tr>{['Business', 'Phone', 'City', 'KYC', 'Revenue', 'Cashback', 'Actions'].map(h => <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">{h}</th>)}</tr>
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
                      <span className={`badge ${KYC_COLOR[v.kyc_status] || 'badge-info'}`}>{v.kyc_status}</span>
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
                    <td className="px-4 py-3 font-semibold text-green-600 whitespace-nowrap">₹{Number(v.total_revenue_generated || 0).toFixed(0)}</td>
                    <td className="px-4 py-3 text-orange-600 font-semibold">{v.cashback_percent}%</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => doAction('approve_kyc', v.id)} className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 font-medium">✅ Approve KYC</button>
                        <button onClick={() => setModal({ type: 'reject_kyc', vendorId: v.id, name: v.business_name })} className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 font-medium">❌ Reject</button>
                        <button onClick={() => setModal({ type: 'freeze', vendorId: v.id, isFrozen: v.is_frozen, name: v.business_name })}
                          className={`text-xs px-2 py-1 rounded-lg font-medium ${v.is_frozen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                          {v.is_frozen ? 'Unfreeze' : 'Freeze'}
                        </button>
                        <button onClick={() => setModal({ type: 'cashback', vendorId: v.id, name: v.business_name, current: v.cashback_percent })}
                          className="text-xs px-2 py-1 rounded-lg bg-orange-100 text-orange-700 font-medium">Cashback %</button>
                        <button onClick={() => setModal({ type: 'adjust', vendorId: v.id, name: v.business_name })}
                          className="text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-700 font-medium">Adjust</button>
                        <button onClick={() => { 
                          setForm({ 
                            business_name: v.business_name, 
                            owner_name: v.owner_name || '', 
                            email: v.email || '', 
                            business_type: v.business_type || '', 
                            city: v.city || '', 
                            business_address: v.business_address || '' 
                          }); 
                          setModal({ type: 'edit_vendor', vendor: v }); 
                        }} className="text-xs px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 font-medium">Edit</button>
                        <button onClick={() => setModal({ type: 'profile', vendor: v })}
                          className="text-xs px-2 py-1 rounded-lg bg-blue-100 text-blue-700 font-medium">Profile</button>
                        <a href={`https://wa.me/${(v.phone || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" 
                          className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 font-medium flex items-center justify-center">
                          WhatsApp
                        </a>
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
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">← Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {Math.ceil(total / limit)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / limit)} className="px-4 py-2 rounded-xl border text-sm disabled:opacity-40">Next →</button>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm slide-up">
            {modal.type === 'freeze' && (
              <>
                <h3 className="font-bold text-lg mb-2">{modal.isFrozen ? 'Unfreeze' : 'Freeze'} — {modal.name}</h3>
                {!modal.isFrozen && <textarea className="input-field mb-4 h-24 resize-none" placeholder="Reason..." value={form.reason || ''} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />}
                <div className="flex gap-3">
                  <button onClick={() => doAction(modal.isFrozen ? 'unfreeze' : 'freeze', modal.vendorId, { reason: form.reason })} className="btn-primary flex-1">{modal.isFrozen ? 'Unfreeze' : 'Freeze'}</button>
                  <button onClick={() => { setModal(null); setForm({}); }} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'reject_kyc' && (
              <>
                <h3 className="font-bold text-lg mb-2">Reject KYC — {modal.name}</h3>
                <textarea className="input-field mb-4 h-24 resize-none" placeholder="Rejection notes..." value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                <div className="flex gap-3">
                  <button onClick={() => doAction('reject_kyc', modal.vendorId, { notes: form.notes })} className="btn-primary flex-1 bg-red-500">Reject</button>
                  <button onClick={() => { setModal(null); setForm({}); }} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'cashback' && (
              <>
                <h3 className="font-bold text-lg mb-2">Set Cashback % — {modal.name}</h3>
                <p className="text-sm text-slate-500 mb-3">Current: {modal.current}%</p>
                <input type="number" className="input-field mb-4" placeholder="New cashback %" min={1} max={20} value={form.pct || modal.current} onChange={e => setForm(f => ({ ...f, pct: e.target.value }))} />
                <div className="flex gap-3">
                  <button onClick={() => doAction('update_cashback', modal.vendorId, { cashback_percent: form.pct })} className="btn-primary flex-1">Update</button>
                  <button onClick={() => { setModal(null); setForm({}); }} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'adjust' && (
              <>
                <h3 className="font-bold text-lg mb-4">Adjust Wallet — {modal.name}</h3>

                <input type="number" className="input-field mb-3" placeholder="Amount (positive to add, negative to deduct)" value={form.coins || ''} onChange={e => setForm(f => ({ ...f, coins: e.target.value }))} />
                <textarea className="input-field mb-4 h-20 resize-none" placeholder="Reason for adjustment..." value={form.reason || ''} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} />
                <div className="flex gap-3">
                  <button onClick={() => doAction('adjust_wallet', modal.vendorId, { coins: parseFloat(form.coins), reason: form.reason, wallet_type: form.walletType || 'coin_balance' })}
                    className="btn-primary flex-1">Adjust</button>
                  <button onClick={() => { setModal(null); setForm({}); }} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
            {modal.type === 'profile' && (
              <>
                <h3 className="font-bold text-xl mb-4">Vendor Profile — {modal.vendor.business_name}</h3>
                <div className="space-y-3 mb-6 text-sm max-h-[60vh] overflow-y-auto pr-2">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500">Business Name:</span><span className="font-medium text-right">{modal.vendor.business_name}</span>
                    <span className="text-slate-500">Owner Name:</span><span className="font-medium text-right">{modal.vendor.owner_name || 'N/A'}</span>
                    <span className="text-slate-500">Phone:</span><span className="font-medium text-right">{modal.vendor.phone}</span>
                    <span className="text-slate-500">Email:</span><span className="font-medium text-right">{modal.vendor.email || 'N/A'}</span>
                    <span className="text-slate-500">Business Type:</span><span className="font-medium text-right">{modal.vendor.business_type || 'N/A'}</span>
                    <span className="text-slate-500">City:</span><span className="font-medium text-right">{modal.vendor.city || 'N/A'}</span>
                    <span className="text-slate-500">Coin Balance:</span><span className="font-bold text-orange-500 text-right">{modal.vendor.coin_balance || 0} 🪙</span>
                    <span className="text-slate-500">Cash Balance:</span><span className="font-bold text-green-600 text-right">₹{Number(modal.vendor.cash_wallet_balance || 0).toFixed(2)}</span>
                    <span className="text-slate-500">Cashback %:</span><span className="font-medium text-right">{modal.vendor.cashback_percent || 0}%</span>
                    <span className="text-slate-500">Address:</span><span className="font-medium text-right">{modal.vendor.business_address || 'N/A'}</span>

                    <div className="col-span-2 mt-2 mb-1 border-t border-slate-100 pt-2"><span className="font-bold text-slate-700">Bank Details</span></div>
                    <span className="text-slate-500">Bank Name:</span><span className="font-medium text-right">{modal.vendor.bank_name || 'N/A'}</span>
                    <span className="text-slate-500">Account No:</span><span className="font-medium text-right">{modal.vendor.bank_account_number || 'N/A'}</span>
                    <span className="text-slate-500">IFSC:</span><span className="font-medium text-right">{modal.vendor.bank_ifsc || 'N/A'}</span>

                    <div className="col-span-2 mt-2 mb-1 border-t border-slate-100 pt-2"><span className="font-bold text-slate-700">Financials</span></div>
                    <span className="text-slate-500">Cash Wallet:</span><span className="font-bold text-green-600 text-right">₹{modal.vendor.cash_wallet_balance || 0}</span>
                    <span className="text-slate-500">Coin Balance:</span><span className="font-bold text-orange-500 text-right">{modal.vendor.coin_balance || 0} 🪙</span>
                    <span className="text-slate-500">Total Revenue:</span><span className="font-medium text-right">₹{modal.vendor.total_revenue_generated || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { 
                    setForm({ 
                      business_name: modal.vendor.business_name, 
                      owner_name: modal.vendor.owner_name || '', 
                      email: modal.vendor.email || '', 
                      business_type: modal.vendor.business_type || '', 
                      city: modal.vendor.city || '', 
                      business_address: modal.vendor.business_address || '' 
                    }); 
                    setModal({ type: 'edit_vendor', vendor: modal.vendor }); 
                  }} className="btn-primary flex-1">Edit</button>
                  <a href={`https://wa.me/${modal.vendor.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex-1 text-center bg-green-100 text-green-700 border-green-200 hover:bg-green-200">WhatsApp</a>
                  <button onClick={() => setModal(null)} className="btn-secondary flex-1">Close</button>
                </div>
              </>
            )}
            {modal.type === 'edit_vendor' && (
              <>
                <h3 className="font-bold text-xl mb-4">Edit Vendor — {modal.vendor.business_name}</h3>
                <div className="space-y-3 mb-6 max-h-[60vh] overflow-y-auto pr-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Business Name</label>
                    <input type="text" className="input-field" value={form.business_name || ''} onChange={e => setForm({...form, business_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Owner Name</label>
                    <input type="text" className="input-field" value={form.owner_name || ''} onChange={e => setForm({...form, owner_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <input type="email" className="input-field" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Business Type</label>
                    <input type="text" className="input-field" value={form.business_type || ''} onChange={e => setForm({...form, business_type: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">City</label>
                    <input type="text" className="input-field" value={form.city || ''} onChange={e => setForm({...form, city: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Address</label>
                    <input type="text" className="input-field" value={form.business_address || ''} onChange={e => setForm({...form, business_address: e.target.value})} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => doAction('update_profile', modal.vendor.id, form)} className="btn-primary flex-1">Save</button>
                  <button onClick={() => setModal({ type: 'profile', vendor: modal.vendor })} className="btn-secondary flex-1">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
