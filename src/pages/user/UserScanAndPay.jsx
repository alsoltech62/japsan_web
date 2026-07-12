import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (user && (!user.name || !user.city)) {
      toast.error('Please complete your profile (Name, City) to make payments');
      navigate('/user/profile');
    }
  }, [user, navigate]);

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
      const msg = err.response?.data?.message || 'Payment processing failed';
      toast.error(msg);
      if (err.response?.data?.data?.profile_incomplete) {
        navigate('/user/profile');
      }
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
      const msg = err.response?.data?.message || 'Transfer processing failed';
      toast.error(msg);
      if (err.response?.data?.data?.profile_incomplete) {
        navigate('/user/profile');
      }
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
            <div className="bg-orange-50 border border-orange-100 rounded-xl py-1 px-3 mt-2 inline-flex items-center gap-2">
              <span className="text-orange-700 font-bold text-sm">{user?.phone}@japsan</span>
              <button onClick={() => {navigator.clipboard.writeText(`${user?.phone}@japsan`); toast.success('UPI ID Copied!');}} className="text-orange-500 hover:text-orange-700" title="Copy UPI ID">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              </button>
            </div>
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
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center gap-3 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-12 bg-blue-50"></div>
            {vendorDetails.profile_photo ? (
              <img src={vendorDetails.profile_photo} alt="Logo" className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm z-10" />
            ) : (
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl border-4 border-white shadow-sm z-10">
                🏪
              </div>
            )}
            <div className="z-10">
              <p className="font-bold text-slate-800 text-lg">{vendorDetails.business_name || vendorDetails.owner_name}</p>
              <p className="text-xs text-slate-500 font-medium">{vendorDetails.city || 'Local Shop'}</p>
              {vendorDetails.address && (
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">{vendorDetails.address}</p>
              )}
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

            <div className="relative">
              <label className="text-xs font-semibold text-slate-500 uppercase text-center block w-full mb-2">Enter 4-Digit PIN</label>
              <div className="flex gap-4 justify-center mt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${pin.length > i ? 'bg-slate-800 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    {pin.length > i && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                ))}
              </div>
              <input
                type="number"
                className="absolute inset-0 top-6 opacity-0 cursor-text w-full h-[calc(100%-24px)]"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
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

            <div className="relative">
              <label className="text-xs font-semibold text-slate-500 uppercase text-center block w-full mb-2">Enter 4-Digit PIN</label>
              <div className="flex gap-4 justify-center mt-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${pin.length > i ? 'bg-slate-800 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    {pin.length > i && <div className="w-3 h-3 bg-white rounded-full"></div>}
                  </div>
                ))}
              </div>
              <input
                type="number"
                className="absolute inset-0 top-6 opacity-0 cursor-text w-full h-[calc(100%-24px)]"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
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
