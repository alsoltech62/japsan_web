import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { scanVendorQR, userPayVendor, getWallet } from '../../services/api';
import { FiCamera, FiCheckCircle } from 'react-icons/fi';

export default function UserScanAndPay() {
  const [vendorId, setVendorId] = useState('');
  const [vendorDetails, setVendorDetails] = useState(null);
  const [billAmount, setBillAmount] = useState('');
  const [coinsToUse, setCoinsToUse] = useState('');
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleScan = async () => {
    if (!vendorId) return toast.error('Enter Vendor ID to simulate scan');
    setLoading(true);
    try {
      const res = await scanVendorQR(vendorId);
      if (res.data.success) {
        setVendorDetails(res.data.data.vendor);
        const wRes = await getWallet();
        setWallet(wRes.data.data.wallet);
      } else {
        toast.error(res.data.message || 'Vendor not found');
      }
    } catch (err) {
      toast.error('Invalid QR or Vendor');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!billAmount || isNaN(billAmount)) return toast.error('Enter valid bill amount');
    setLoading(true);
    try {
      const payload = {
        vendor_id: vendorDetails.id,
        bill_amount: Number(billAmount),
        coins_to_use: Number(coinsToUse || 0),
        payment_method: 'online'
      };
      const res = await userPayVendor(payload);
      if (res.data.success) {
        toast.success('Payment successful!');
        navigate('/user/dashboard');
      } else {
        toast.error(res.data.message || 'Payment failed');
      }
    } catch (err) {
      toast.error('Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-xl font-bold text-slate-800">Scan & Pay</h2>
      
      {!vendorDetails ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4">
          <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
            <FiCamera size={40} />
          </div>
          <p className="text-slate-500 text-sm text-center">Scan vendor QR code or enter Vendor ID below to simulate</p>
          <input
            type="text"
            placeholder="Enter Vendor ID (e.g. 1)"
            className="input-field text-center w-full max-w-xs"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
          />
          <button onClick={handleScan} disabled={loading} className="btn-primary w-full max-w-xs">
            {loading ? 'Scanning...' : 'Simulate Scan'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl">
              🏪
            </div>
            <div>
              <p className="font-bold text-slate-800">{vendorDetails.business_name || vendorDetails.owner_name}</p>
              <p className="text-xs text-slate-500">{vendorDetails.city || 'Local Shop'}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Bill Amount (₹)</label>
              <input
                type="number"
                className="input-field w-full text-lg mt-1"
                placeholder="0.00"
                value={billAmount}
                onChange={(e) => setBillAmount(e.target.value)}
              />
            </div>
            
            <div>
              <div className="flex justify-between items-end">
                <label className="text-xs font-semibold text-slate-500 uppercase">Use Coins (Max: {wallet?.coin_balance || 0})</label>
                <span className="text-xs text-orange-500 font-medium cursor-pointer" onClick={() => setCoinsToUse(wallet?.coin_balance || 0)}>Max</span>
              </div>
              <input
                type="number"
                className="input-field w-full mt-1"
                placeholder="0"
                value={coinsToUse}
                onChange={(e) => setCoinsToUse(e.target.value)}
                max={wallet?.coin_balance || 0}
              />
            </div>
            
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Bill Amount:</span>
                <span className="font-medium">₹{Number(billAmount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coin Discount:</span>
                <span className="font-medium text-green-600">-₹{(Number(coinsToUse || 0) * 0.70).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t border-slate-200">
                <span className="text-slate-800">To Pay:</span>
                <span className="text-slate-800">₹{Math.max(0, Number(billAmount || 0) - (Number(coinsToUse || 0) * 0.70)).toFixed(2)}</span>
              </div>
            </div>

            <button onClick={handlePay} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiCheckCircle />
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
            <button onClick={() => setVendorDetails(null)} className="btn-secondary w-full mt-2 text-slate-500 bg-slate-100">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
