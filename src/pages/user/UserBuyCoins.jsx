import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { buyCoins, getWallet } from '../../services/api';

const PACKAGES = [
  { coins:100,   bonus:0,    label:'Starter',  popular:false },
  { coins:500,   bonus:0,    label:'Regular',  popular:false },
  { coins:1000,  bonus:100,  label:'Popular',  popular:true  },
  { coins:2000,  bonus:200,  label:'Pro',      popular:false },
  { coins:5000,  bonus:500,  label:'Premium',  popular:false },
];

export default function UserBuyCoins() {
  const [selected, setSelected] = useState(null);
  const [custom, setCustom]     = useState('');
  const [method, setMethod]     = useState('upi');
  const [txRef, setTxRef]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [wallet, setWallet]     = useState(null);
  const [success, setSuccess]   = useState(null);

  useEffect(() => {
    getWallet().then(r => setWallet(r.data.data?.wallet)).catch(()=>{});
  }, []);

  const coins   = selected ? selected.coins : (parseInt(custom)||0);
  const bonus   = selected ? selected.bonus : 0;
  const total   = coins + bonus;
  const amtInr  = coins;

  async function handleBuy() {
    if (!coins || coins < 10) return toast.error('Enter at least 10 coins');
    if (!txRef.trim()) return toast.error('Enter payment reference / transaction ID');
    setLoading(true);
    try {
      const res = await buyCoins({ coins_requested: coins, payment_gateway_ref: txRef, payment_method: method });
      setSuccess(res.data.data);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    }
    setLoading(false);
  }

  if (success) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[70vh] slide-up">
      <div className="text-7xl mb-4">🎉</div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Coins Purchased!</h2>
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow border border-orange-100 text-center">
        <p className="text-5xl font-black text-orange-500">{Number(success.total_coins).toLocaleString()}</p>
        <p className="text-slate-500 mt-1">Total Coins Added</p>
        {success.bonus_coins > 0 && <p className="mt-2 badge badge-success mx-auto">+{success.bonus_coins} Bonus Coins!</p>}
        <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
          <p>Amount Paid: <strong>₹{success.amount_paid_inr}</strong></p>
          <p>Ref: <span className="font-mono text-xs">{success.transaction_ref}</span></p>
        </div>
      </div>
      <button onClick={() => setSuccess(null)} className="btn-secondary mt-6">Buy More Coins</button>
    </div>
  );

  return (
    <div className="p-4 space-y-4 fade-in">
      <h2 className="text-xl font-bold text-slate-800">🛒 Buy Coins</h2>
      {wallet && (
        <div className="bg-orange-50 rounded-2xl p-3 flex items-center gap-2 text-sm">
          <span>🪙</span>
          <span className="text-orange-700">Current Balance: <strong>{Number(wallet.coin_balance||0).toLocaleString()} coins</strong></span>
        </div>
      )}

      {/* Packages */}
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-3">Select Package</p>
        <div className="grid grid-cols-2 gap-3">
          {PACKAGES.map(pkg => (
            <button key={pkg.coins} onClick={() => { setSelected(pkg); setCustom(''); }}
              className={`relative p-4 rounded-2xl border-2 text-left transition-all ${selected?.coins === pkg.coins ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white hover:border-orange-300'}`}>
              {pkg.popular && <span className="absolute -top-2 right-3 badge badge-success text-xs">POPULAR</span>}
              <p className="text-lg font-black text-slate-800">{pkg.coins.toLocaleString()} 🪙</p>
              {pkg.bonus > 0 && <p className="text-xs font-semibold text-green-600">+{pkg.bonus} bonus coins!</p>}
              <p className="text-sm text-slate-500 mt-1">= ₹{pkg.coins}</p>
              <p className="text-xs font-medium text-slate-400">{pkg.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom */}
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-2">Or enter custom amount</p>
        <input className="input-field" type="number" placeholder="Enter coins (min 10)" min={10} value={custom}
          onChange={e => { setCustom(e.target.value); setSelected(null); }} />
      </div>

      {/* Summary */}
      {coins > 0 && (
        <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-slate-600">Coins</span><span className="font-semibold">{coins.toLocaleString()}</span></div>
          {bonus > 0 && <div className="flex justify-between text-sm text-green-600"><span>Bonus Coins</span><span className="font-semibold">+{bonus.toLocaleString()}</span></div>}
          <div className="flex justify-between font-bold border-t border-slate-200 pt-2"><span>Total Coins</span><span className="text-orange-500">{total.toLocaleString()} 🪙</span></div>
          <div className="flex justify-between text-sm"><span className="text-slate-600">Amount to Pay</span><span className="font-bold text-slate-800">₹{amtInr}</span></div>
        </div>
      )}

      {/* Payment */}
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-2">Payment Method</p>
        <div className="flex gap-2">
          {[['upi','UPI'],['card','Card'],['cash','Cash']].map(([val,label]) => (
            <button key={val} onClick={()=>setMethod(val)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${method===val?'border-orange-500 bg-orange-50 text-orange-600':'border-slate-200 text-slate-600'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Payment Reference / Transaction ID</label>
        <input className="input-field" placeholder="Enter UPI/transaction reference" value={txRef} onChange={e=>setTxRef(e.target.value)} />
        <p className="text-xs text-slate-400 mt-1">Pay ₹{amtInr || '---'} to UPI: japsan@upi and enter transaction ID above</p>
      </div>

      <button onClick={handleBuy} disabled={loading||!coins||!txRef} className="btn-primary w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? '⏳ Processing...' : `💰 Buy ${total>0?total.toLocaleString()+' Coins':'Coins'}`}
      </button>
    </div>
  );
}
