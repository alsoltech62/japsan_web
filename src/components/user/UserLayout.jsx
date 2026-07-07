import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiHome, FiCreditCard, FiShoppingCart, FiUsers, FiBell, FiUser, FiLogOut, FiChevronLeft } from 'react-icons/fi';
import NotificationBadge from '../common/NotificationBadge';

const navItems = [
  { to:'/user/dashboard',     icon:<FiHome size={20}/>,        label:'Home' },
  { to:'/user/wallet',        icon:<FiCreditCard size={20}/>,  label:'Wallet' },
  { to:'/user/buy-coins',     icon:<FiShoppingCart size={20}/>,label:'Buy Coins' },
  { to:'/user/referral',      icon:<FiUsers size={20}/>,       label:'Refer & Earn' },
  { to:'/user/notifications', icon:<FiBell size={20}/>,        label:'Alerts' },
  { to:'/user/profile',       icon:<FiUser size={20}/>,        label:'Profile' },
];

export default function UserLayout() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  function handleLogout() { logout(); navigate('/login'); }
  function goBack() { navigate(-1); }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {location.pathname !== '/user/dashboard' && (
            <button onClick={goBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all">
              <FiChevronLeft size={24} />
            </button>
          )}
          <div className="w-8 h-8 coin-gradient rounded-full flex items-center justify-center text-sm">🪙</div>
          <div>
            <p className="font-bold text-slate-800 text-sm leading-tight">Japsan Coin</p>
            <p className="text-xs text-slate-400">Hi, {user?.name?.split(' ')[0]}!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBadge userType="user" />
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all" title="Logout">
            <FiLogOut size={18}/>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-20 overflow-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex items-center justify-around px-2 py-2 z-30 shadow-lg">
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
