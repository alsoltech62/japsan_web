import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiTrendingUp, FiCreditCard, FiGrid, FiDollarSign, FiUsers, FiLogOut, FiChevronLeft } from 'react-icons/fi';
import NotificationBadge from '../common/NotificationBadge';

const navItems = [
  { to:'/vendor/dashboard', icon:<FiHome size={20}/>,        label:'Home' },
  { to:'/vendor/roi',       icon:<FiTrendingUp size={20}/>,  label:'ROI' },
  { to:'/vendor/payment',   icon:<FiCreditCard size={20}/>,  label:'Payment' },
  { to:'/vendor/qr',        icon:<FiGrid size={20}/>,        label:'QR Code' },
  { to:'/vendor/wallet',    icon:<FiDollarSign size={20}/>,  label:'Wallet' },
  { to:'/vendor/referral',  icon:<FiUsers size={20}/>,       label:'Refer' },
];

export default function VendorLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          {location.pathname !== '/vendor/dashboard' && (
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-800 hover:bg-slate-100 rounded-full transition-all">
              <FiChevronLeft size={24} />
            </button>
          )}
          <img src="/JapSan.png" alt="Logo" className="w-8 h-8 rounded-lg" />
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">Vendor Panel</p>
            <p className="text-[10px] text-slate-500 font-medium">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBadge userType="vendor" />
          <button onClick={() => { logout(); navigate('/login'); }} className="p-2 text-slate-600 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all"><FiLogOut size={18}/></button>
        </div>
      </header>
      <main className="flex-1 pb-20 overflow-auto"><Outlet /></main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex items-center justify-around px-2 py-2 z-30 shadow-lg">
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icon}<span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
