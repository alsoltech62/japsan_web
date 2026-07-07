import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { processPayment } from '../../services/api';

export default function VendorPayment() {
  const [phone, setPhone]         = useState('');
  const [bill, setBill]           = useState('');
  const [coinsToUse, setCoinsToUse] = useState(0);
  const [method, setMethod]       = useState('upi');
  const [manualBonus, setManualBonus] = useState('');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);

  const billAmt   = parseFloat(bill) || 0;
  const discount  = coinsToUse * 0.7;
  const cashToPay = Math.max(0, billAmt - discount).toFixed(2);

  async function handleProcess() {
    if (!phone || phone.length < 10) return toast.error('Enter valid customer phone');
    if (!billAmt || billAmt <= 0) return toast.error('Enter bill amount');
    setLoading(true);
    try {
      const payload = { 
        user_phone: phone, 
        bill_amount: billAmt, 
        coins_to_use: coinsToUse, 
        payment_method: method,
        manual_bonus_coins: manualBonus ? parseFloat(manualBonus) : 0
      };
      const res = await processPayment(payload);
      setResult(res.data.data);
      toast.success('Payment processed!');
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); }
    setLoading(false);
  }

  if (result) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] slide-up">
      <div className="text-7xl mb-4">✅</div>
      <h2 className="text-2xl font-black text-slate-800 mb-4">Payment Successful!</h2>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow border border-green-100 space-y-3">
        {[
          ['Bill Amount',    `₹${Number(result.bill_amount).toFixed(2)}`],
          ['Coins Used',     `${Number(result.coins_used).toLocaleString()} 🪙`],
          ['Coin Discount',  `₹${Number(result.coin_discount).toFixed(2)}`],
          ['Cash Collected', `₹${Number(result.cash_paid).toFixed(2)}`],
          ['Cashback Given', `${Number(result.cashback_coins).toLocaleString()} 🪙`],
        ].map(([label, val]) => (
          <div key={label} className="flex justify-between border-b border-slate-50 pb-2">
            <span className="text-sm text-slate-500">{label}</span>
            <span className="font-bold text-slate-800">{val}</span>
          </div>
        ))}
        <p className="text-xs text-slate-400 text-center">Ref: {result.transaction_ref}</p>
      </div>
      <button onClick={() => { setResult(null); setPhone(''); setBill(''); setCoinsToUse(0); setManualBonus(''); }} className="btn-primary mt-6">New Transaction</button>
    </div>
  );

  return (
    <div className="p-4 space-y-4 fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800">💳 Process Payment</h2>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Customer Phone Number</label>
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-600 font-medium">+91</div>
          <input className="input-field" type="tel" placeholder="Customer's phone" value={phone}
            onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))} maxLength={10}/>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Bill Amount (₹)</label>
        <input className="input-field text-xl font-bold" type="number" placeholder="0.00" min="0" step="0.01"
          value={bill} onChange={e => setBill(e.target.value)} />
      </div>

      {billAmt > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Customer Coins to Use: <strong className="text-orange-500">{coinsToUse.toLocaleString()} 🪙</strong></label>
            <input type="range" min={0} max={Math.min(500, Math.floor(billAmt/0.7))} step={10} value={coinsToUse}
              onChange={e=>setCoinsToUse(parseInt(e.target.value))} className="w-full accent-orange-500"/>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>0</span><span>Max: {Math.min(500, Math.floor(billAmt/0.7))} coins</span>
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-sm">
            {coinsToUse > 0 && <div className="flex justify-between text-green-600"><span>Coin Discount</span><span>-₹{discount.toFixed(2)}</span></div>}
            <div className="flex justify-between font-bold"><span>Cash to Collect</span><span className="text-orange-500">₹{cashToPay}</span></div>
          </div>
        </div>
      )}

      {billAmt > 0 && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Manual Reward / Bonus Coins (Optional)</label>
          <div className="flex gap-2">
            <input className="input-field flex-1" type="number" placeholder="Enter extra coins to give" value={manualBonus}
              onChange={e=>setManualBonus(e.target.value)} min="0" />
            <div className="flex items-center px-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-600 font-bold">🪙 JC</div>
          </div>
          <p className="text-xs text-slate-400 mt-1">Leave empty to use automatic Smart Rules & Cashback.</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Method</label>
        <div className="flex gap-2">
          {[['upi','📱 UPI'],['card','💳 Card']].map(([val,label])=>(
            <button key={val} onClick={()=>setMethod(val)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${method===val?'border-orange-500 bg-orange-50 text-orange-600':'border-slate-200 text-slate-600'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {billAmt > 0 && (
        <div className="bg-orange-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-slate-600">Cashback customer will earn:</p>
          <p className="text-2xl font-black text-orange-500">~{Math.floor(billAmt*0.1).toLocaleString()} 🪙</p>
          <p className="text-xs text-slate-400">(based on your cashback %)</p>
        </div>
      )}

      <button onClick={handleProcess} disabled={loading||!billAmt||!phone} className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? '⏳ Processing...' : '✅ Process Payment'}
      </button>
    </div>
  );
}
