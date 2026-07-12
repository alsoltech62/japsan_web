import axios from 'axios';

// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/japsan pay-ecosystem/backend/api';
// const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
// const BASE_URL =
//   import.meta.env.VITE_API_URL ||
//   'https://japsoncoin.foodpulse.in/backend/api';
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  'https://odofast.in/backend/api';
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('japsan_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('japsan_token');
      localStorage.removeItem('japsan_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── AUTH ──────────────────────────────────────────────────────
export const sendOtp = (data) => api.post('/auth/send_otp.php', data);
export const verifyOtp = (data) => api.post('/auth/verify_otp.php', data);
export const registerVendor = (data) => api.post('/auth/register_vendor.php', data);

// ── USER ──────────────────────────────────────────────────────
export const getProfile = () => api.get('/users/profile.php');
export const updateProfile = (data) => api.put('/users/profile.php', data);
export const uploadFile = (data) => api.post('/upload.php', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getNearbyVendors = (params) => api.get('/users/nearby_vendors.php', { params });
export const scanVendorQR = (vendorId) => api.get(`/qr/scan.php?vendor_id=${vendorId}`);
export const userPayVendor = (data) => api.post('/transactions/user_pay.php', data);
export const userTransfer = (data) => api.post('/transactions/user_transfer.php', data);
export const getNetwork = () => api.get('/users/network.php');

// ── WALLET ────────────────────────────────────────────────────
export const getWallet = () => api.get('/wallet/get_wallet.php');

// ── TRANSACTIONS ──────────────────────────────────────────────
export const processPayment = (data) => api.post('/transactions/process_payment.php', data);
export const buyCoins = (data) => api.post('/transactions/buy_coins.php', data);
export const getTransactions = (params) => api.get('/transactions/history.php', { params });

// ── VENDOR ────────────────────────────────────────────────────
export const getVendorProfile = () => api.get('/vendors/profile.php');
export const updateVendorProfile = (data) => api.put('/vendors/profile.php', data);
export const getROIDashboard = (params) => api.get('/vendors/roi_dashboard.php', { params });
export const getVendorQR = () => api.get('/qr/generate.php');
export const requestWithdraw = (data) => api.post('/vendors/withdraw.php', data);
export const getWithdrawals = () => api.get('/vendors/withdraw.php');
export const getRewardSettings = () => api.get('/vendors/reward_settings.php');
export const updateRewardSettings = (data) => api.put('/vendors/reward_settings.php', data);
export const getVendorOffers = () => api.get('/vendors/offers.php');
export const createVendorOffer = (data) => api.post('/vendors/offers.php', data);
export const sendVendorCampaign = (data) => api.post('/vendors/campaigns.php', data);

// ── REFERRAL ──────────────────────────────────────────────────
export const getReferrals = () => api.get('/referral/get_referrals.php');

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const getNotifications = (params) => api.get('/notifications/list.php', { params });
export const markNotifRead = (data) => api.put('/notifications/list.php', data);

// ── ADMIN ─────────────────────────────────────────────────────
export const getAdminDashboard = (params) => api.get('/admin/dashboard.php', { params });
export const getSettings = () => api.get('/admin/settings.php');
export const updateSettings = (data) => api.put('/admin/settings.php', data);
export const getAdminUsers = (params) => api.get('/admin/users.php', { params });
export const adminUserAction = (data) => api.put('/admin/users.php', data);
export const getAdminVendors = (params) => api.get('/admin/vendors.php', { params });
export const adminVendorAction = (data) => api.put('/admin/vendors.php', data);
export const getAdminWithdrawals = (params) => api.get('/admin/withdrawals.php', { params });
export const adminWithdrawAction = (data) => api.put('/admin/withdrawals.php', data);

export default api;
