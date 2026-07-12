import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';
import { getVendorQR } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function VendorQRCode() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const { user }              = useAuth();

  useEffect(() => {
    getVendorQR().then(r => setData(r.data.data)).catch(() => toast.error('Failed to load QR')).finally(() => setLoading(false));
  }, []);

  function openWhatsApp() {
    const number = data?.vendor?.whatsapp || data?.vendor?.phone;
    if (!number) return;
    window.open(`https://wa.me/${number.replace(/\D/g,'')}`, '_blank');
  }

  function downloadQR() {
    const svg = document.querySelector('#vendor-qr svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href = url; a.download = 'japsan-qr.svg'; a.click();
    URL.revokeObjectURL(url);
    toast.success('QR downloaded!');
  }

  if (loading) return <div className="p-6 space-y-4">{[1,2].map(i=><div key={i} className="h-40 bg-slate-200 rounded-2xl animate-pulse"/>)}</div>;

  const qrValue = data?.qr_data || JSON.stringify({ vendor_id: user?.id, type: 'japsan_vendor_qr' });

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-xl font-bold text-slate-800">📱 My QR Code</h2>
      <p className="text-slate-500 text-sm">Show this to customers for instant coin transactions</p>

      {/* QR Card */}
      <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow text-center" id="vendor-qr">
        <div className="inline-block p-4 bg-white rounded-2xl border-4 border-orange-500 shadow-lg">
          <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true}
            imageSettings={{ src: '', excavate: true }} />
        </div>
        <div className="mt-4">
          <p className="font-bold text-slate-800 text-lg">{data?.vendor?.business_name || user?.name}</p>
          <p className="text-slate-500 text-sm">{data?.vendor?.phone}</p>
          <div className="bg-orange-50 border border-orange-100 rounded-xl py-1 px-3 mt-1 inline-flex items-center gap-2">
            <p className="text-orange-700 font-bold text-sm">{data?.vendor?.phone || user?.phone}@japsan</p>
            <button onClick={() => {navigator.clipboard.writeText(`${data?.vendor?.phone || user?.phone}@japsan`); toast.success('UPI ID Copied!');}} className="text-orange-500 hover:text-orange-700" title="Copy UPI ID">
              <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
          <div className="mt-2"><p className="badge badge-orange">Japsan Pay Vendor</p></div>
        </div>
        <div className="mt-3 bg-orange-50 rounded-xl p-3">
          <p className="text-sm text-orange-700 font-medium">Cashback: {data?.vendor?.cashback_pct || 10}% coins on every purchase</p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 flex justify-around">
        <div className="text-center">
          <p className="text-2xl font-black text-orange-500">{data?.scan_count || 0}</p>
          <p className="text-xs text-slate-500">Total Scans</p>
        </div>
        <div className="w-px bg-slate-100"/>
        <div className="text-center">
          <p className="text-2xl font-black text-blue-500">{data?.vendor?.cashback_pct || 10}%</p>
          <p className="text-xs text-slate-500">Cashback Rate</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={downloadQR} className="btn-secondary flex items-center justify-center gap-2">
          📥 Download QR
        </button>
        <button onClick={openWhatsApp} className="flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-3 font-semibold hover:bg-green-600 transition-all">
          💬 WhatsApp
        </button>
      </div>

      <div className="bg-slate-50 rounded-2xl p-4">
        <p className="font-semibold text-slate-700 text-sm mb-2">How it works:</p>
        <ol className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2"><span className="font-bold text-orange-500">1.</span> Customer scans this QR code</li>
          <li className="flex gap-2"><span className="font-bold text-orange-500">2.</span> They enter bill amount & coins to use</li>
          <li className="flex gap-2"><span className="font-bold text-orange-500">3.</span> System calculates coin discount + cash</li>
          <li className="flex gap-2"><span className="font-bold text-orange-500">4.</span> Customer earns cashback coins automatically</li>
        </ol>
      </div>
    </div>
  );
}
