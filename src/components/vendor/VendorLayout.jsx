import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiTrendingUp, FiCreditCard, FiGrid, FiDollarSign, FiUsers, FiLogOut } from 'react-icons/fi';
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
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">🏪</div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">Vendor Panel</p>
            <p className="text-xs text-slate-400">{user?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBadge userType="vendor" />
          <button onClick={() => { logout(); navigate('/login'); }} className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all"><FiLogOut size={18}/></button>
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
