import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaTrophy, FaCoins } from 'react-icons/fa';
import { FiTrendingUp, FiTarget, FiCopy, FiShare2, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function UserNetwork() {
  const [loading, setLoading] = useState(true);
  const [networkData, setNetworkData] = useState({
    personalBusiness: 0,
    level1Business: 0,
    totalTeamBusiness: 0,
    totalReferrals: 0,
    referralIncome: 0,
    transactionReward: 0,
    holdingReward: 0,
    totalEarnings: 0,
    rank: 'Starter',
    referralCode: '---',
    directReferrals: []
  });

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        const res = await api.get('/network/dashboard.php');
        if (res.data?.success && res.data?.data) {
          setNetworkData(prev => ({ ...prev, ...res.data.data }));
        }
      } catch (e) {
        console.error("Failed to load network data", e);
      } finally {
        setLoading(false);
      }
    };
    fetchNetwork();
  }, []);

  const copyCode = () => {
    navigator.clipboard.writeText(networkData.referralCode);
    toast.success('Referral Code Copied!');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full pt-20">
        <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10 space-y-8 fade-in relative p-4">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-600 tracking-tight">
            Network Business
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Build your network, earn lifetime rewards.</p>
        </div>

        {/* Current Rank Badge */}
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-4 bg-white border border-slate-100 px-6 py-4 rounded-2xl shadow-sm relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white shadow-lg">
            <FaTrophy size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Current Rank</p>
            <p className="text-xl font-bold text-slate-800 tracking-wide">{networkData.rank}</p>
          </div>
        </motion.div>
      </div>

      {/* Share Box */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 relative overflow-hidden shadow-xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full transition-opacity opacity-50 group-hover:opacity-100"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Invite Friends & Earn</h3>
            <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
              Share your referral code and earn lifetime rewards. You get up to <span className="text-orange-400 font-bold">1 JC</span> per transaction made by your direct network, down to 3 levels deep!
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 p-2 pr-2 pl-6 rounded-2xl border border-white/10 w-full md:w-auto backdrop-blur-sm">
            <span className="text-2xl font-black text-white tracking-[0.2em]">{networkData.referralCode}</span>
            <div className="flex gap-2">
              <button onClick={copyCode} className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all">
                <FiCopy size={18} />
              </button>
              <button className="p-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl text-white transition-all shadow-lg">
                <FiShare2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Business Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Earnings" amount={`JC ${Number(networkData.totalEarnings).toFixed(2)}`} icon={FaCoins} color="from-orange-400 to-amber-600" />
        <StatCard title="Referral Income" amount={`JC ${Number(networkData.referralIncome).toFixed(2)}`} icon={FaUsers} color="from-blue-400 to-indigo-600" />
        <StatCard title="Holding Rewards" amount={`JC ${Number(networkData.holdingReward).toFixed(2)}`} icon={FiTarget} color="from-purple-400 to-fuchsia-600" />
        <StatCard title="Total Team Business" amount={`JC ${Number(networkData.totalTeamBusiness).toFixed(2)}`} icon={FiTrendingUp} color="from-emerald-400 to-teal-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Network Breakdown */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-50 pb-4">Business Breakdown</h3>
            
            <div className="space-y-5">
              <LevelStat level="Personal" business={networkData.personalBusiness} percent={(networkData.personalBusiness / (networkData.totalTeamBusiness || 1)) * 100} />
              <LevelStat level="Level 1" business={networkData.level1Business} percent={(networkData.level1Business / (networkData.totalTeamBusiness || 1)) * 100} />
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-50 text-center">
              <p className="text-sm text-slate-500 mb-1">Total Direct Referrals</p>
              <p className="text-4xl font-black text-slate-800">{networkData.totalReferrals}</p>
            </div>
          </div>
        </div>

        {/* Right Col: Direct Referrals Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FaUsers size={20} className="text-orange-500" />
                My Network
              </h3>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-2">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Business</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {networkData.directReferrals?.map((ref, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-bold flex items-center justify-center">
                            {ref.name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="text-slate-800 font-medium">{ref.name || 'User'}</p>
                            <p className="text-xs text-slate-500">Joined recently</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                        {ref.business > 0 ? `JC ${Number(ref.business).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!networkData.directReferrals || networkData.directReferrals.length === 0) && (
                <div className="py-16 text-center text-slate-400">
                  <FaUsers size={48} className="mx-auto mb-4 opacity-20" />
                  <p>You have no direct referrals yet.</p>
                  <p className="text-sm mt-1">Share your code to start building your network!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon: Icon, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group"
    >
      <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${color} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-md`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="relative z-10">
        <h4 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</h4>
        <p className="text-2xl font-black text-slate-800">{amount}</p>
      </div>
    </motion.div>
  );
}

function LevelStat({ level, business, percent }) {
  const p = Math.min(100, Math.max(0, percent || 0));
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <p className="text-sm font-bold text-slate-800">{level}</p>
        <p className="text-sm font-medium text-slate-500">JC {Number(business).toFixed(2)}</p>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${p}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-orange-400 to-amber-400"
        ></motion.div>
      </div>
    </div>
  );
}
