import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { scanVendorQR, userPayVendor, userTransfer, getWallet } from '../../services/api';
import { FiCamera, FiCheckCircle, FiX, FiImage } from 'react-icons/fi';
import { QrReader } from 'react-qr-reader';
import jsQR from 'jsqr';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';

export default function UserScanAndPay() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scan');
  const [vendorId, setVendorId] = useState('');
  const [vendorDetails, setVendorDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  
  const [billAmount, setBillAmount] = useState('');
  const [coinsToUse, setCoinsToUse] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [pin, setPin] = useState('');
  
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const navigate = useNavigate();

  const handleScan = async (scannedText) => {
    const query = scannedText || vendorId;
    if (!query) return toast.error('Enter Vendor/User ID to simulate scan');
    setLoading(true);
    try {
      const res = await scanVendorQR(query);
      if (res.data.success) {
        if (res.data.data.vendor) {
          setVendorDetails(res.data.data.vendor);
          setUserDetails(null);
        } else if (res.data.data.user) {
          setUserDetails(res.data.data.user);
          setVendorDetails(null);
        }
        const wRes = await getWallet();
        setWallet(wRes.data.data.wallet);
      } else {
        toast.error(res.data.message || 'Not found');
      }
    } catch (err) {
      toast.error('Invalid QR or User/Vendor not found');
    } finally {
      setLoading(false);
    }
  };

  const handleQRResult = async (result, error) => {
    if (result) {
      setShowScanner(false);
      setVendorId(result?.text || result);
      handleScan(result?.text || result);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          handleQRResult({ text: code.data });
        } else {
          toast.error('No QR code found in the image.');
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePayVendor = async () => {
    if (!billAmount || isNaN(billAmount)) return toast.error('Enter valid bill amount');
    if (pin.length < 4) return toast.error('Enter 4-digit PIN');
    setLoading(true);
    try {
      const payload = {
        vendor_id: vendorDetails.id,
        bill_amount: Number(billAmount),
        coins_to_use: Number(coinsToUse || 0),
        payment_method: 'online',
        pin: pin
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

  const handleTransfer = async () => {
    if (!transferAmount || isNaN(transferAmount)) return toast.error('Enter valid amount');
    if (pin.length < 4) return toast.error('Enter 4-digit PIN');
    setLoading(true);
    try {
      const payload = {
        receiver_id: userDetails.id,
        amount: Number(transferAmount),
        pin: pin
      };
      const res = await userTransfer(payload);
      if (res.data.success) {
        toast.success('Transfer successful!');
        navigate('/user/dashboard');
      } else {
        toast.error(res.data.message || 'Transfer failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer processing failed');
    } finally {
      setLoading(false);
    }
  };

  const qrValue = JSON.stringify({ user_id: user?.id, type: 'japsan_user_qr' });

  return (
    <div className="p-4 space-y-4 fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => window.history.back()} className="text-slate-500 hover:bg-slate-100 p-2 rounded-full">
          <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="24" width="24" xmlns="http://www.w3.org/2000/svg"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>
        <h2 className="text-xl font-bold text-slate-800">Scan & Pay</h2>
      </div>

      <div className="flex bg-slate-200 p-1 rounded-xl">
        <button
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'scan' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          onClick={() => setActiveTab('scan')}
        >
          Scan QR
        </button>
        <button
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'my_qr' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
          onClick={() => setActiveTab('my_qr')}
        >
          My QR
        </button>
      </div>
      
      {activeTab === 'my_qr' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4 text-center">
          <p className="text-slate-500 text-sm">Show this QR to receive coins</p>
          <div className="inline-block p-4 bg-white rounded-2xl border-4 border-orange-500 shadow-lg">
            <QRCodeSVG value={qrValue} size={200} level="H" includeMargin={true} />
          </div>
          <div className="mt-2">
            <p className="font-bold text-slate-800 text-lg">{user?.name}</p>
            <p className="text-slate-500 text-sm">{user?.phone}</p>
          </div>
        </div>
      )}

      {activeTab === 'scan' && !vendorDetails && !userDetails && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center space-y-4">
          
          {showScanner ? (
            <div className="w-full max-w-sm relative">
              <button 
                onClick={() => setShowScanner(false)}
                className="absolute top-2 right-2 z-10 bg-white p-2 rounded-full shadow-md text-red-500"
              >
                <FiX />
              </button>
              <div className="rounded-xl overflow-hidden border-2 border-orange-500">
                <QrReader
                  onResult={handleQRResult}
                  constraints={{ facingMode: 'environment' }}
                  className="w-full"
                />
              </div>
              <p className="text-center mt-2 text-sm text-slate-500">Point camera at Vendor/User QR</p>
            </div>
          ) : (
            <>
              <div className="flex gap-4">
                <div 
                  className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center text-orange-500 cursor-pointer hover:bg-orange-200 transition"
                  onClick={() => setShowScanner(true)}
                >
                  <FiCamera size={32} />
                </div>
                
                <label className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-200 transition relative">
                  <FiImage size={32} />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                </label>
              </div>
              <p className="text-slate-500 text-sm text-center">Tap camera to scan or image icon to upload QR, or enter ID below</p>
            </>
          )}

          {!showScanner && (
            <>
              <input
                type="text"
                placeholder="Enter Vendor/User ID or Phone"
                className="input-field text-center w-full max-w-xs"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              />
              <button onClick={() => handleScan()} disabled={loading} className="btn-primary w-full max-w-xs">
                {loading ? 'Scanning...' : 'Proceed'}
              </button>
            </>
          )}
        </div>
      )}

      {/* VENDOR PAYMENT UI */}
      {vendorDetails && (
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

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Enter 4-Digit PIN</label>
              <input
                type="password"
                maxLength="4"
                className="input-field w-full text-lg mt-1 tracking-widest text-center"
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button onClick={handlePayVendor} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiCheckCircle />
              {loading ? 'Processing...' : 'Confirm Payment'}
            </button>
            <button onClick={() => setVendorDetails(null)} className="btn-secondary w-full mt-2 text-slate-500 bg-slate-100">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* USER TRANSFER UI */}
      {userDetails && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xl">
              👤
            </div>
            <div>
              <p className="font-bold text-slate-800">{userDetails.name}</p>
              <p className="text-xs text-slate-500">{userDetails.phone} • {userDetails.city}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <div className="bg-orange-50 rounded-xl p-3 flex justify-between items-center text-sm">
              <span className="text-orange-700">Available Balance:</span>
              <span className="font-bold text-orange-700">{wallet?.coin_balance || 0} 🪙</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Amount to Transfer (Coins)</label>
              <input
                type="number"
                className="input-field w-full text-lg mt-1"
                placeholder="0"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">Enter 4-Digit PIN</label>
              <input
                type="password"
                maxLength="4"
                className="input-field w-full text-lg mt-1 tracking-widest text-center"
                placeholder="****"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button onClick={handleTransfer} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              <FiCheckCircle />
              {loading ? 'Processing...' : 'Send Coins'}
            </button>
            <button onClick={() => setUserDetails(null)} className="btn-secondary w-full mt-2 text-slate-500 bg-slate-100">
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
