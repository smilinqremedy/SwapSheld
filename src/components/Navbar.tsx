'use client';

import React from 'react';
import { Shield, CheckCircle2, ArrowLeftRight, Clock, MapPin, AlertTriangle, PlusCircle, UserCircle } from 'lucide-react';
import { User } from '@/types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (u: User) => void;
  allUsers: User[];
  activeEscrowOrdersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  allUsers,
  activeEscrowOrdersCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#090d16]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('marketplace')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Swap<span className="text-emerald-400">Shield</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                  NG
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium -mt-0.5">
                48-Hour Gadget Escrow
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'marketplace'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Marketplace
            </button>

            <button
              onClick={() => setActiveTab('how-it-works')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'how-it-works'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              How It Works
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'calculator'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
              Swap Calculator
            </button>

            <button
              onClick={() => setActiveTab('escrow')}
              className={`relative px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'escrow'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Clock className="w-4 h-4 text-cyan-400" />
              Escrow Vault
              {activeEscrowOrdersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-slate-950 rounded-full animate-pulse">
                  {activeEscrowOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('hubs')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'hubs'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              Partner Hubs
            </button>

            <button
              onClick={() => setActiveTab('disputes')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'disputes'
                  ? 'bg-slate-800 text-emerald-400 border border-slate-700'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Disputes
            </button>

            <a
              href="/admin/hub-workbench"
              className="px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              Tech Workbench
            </a>
          </nav>

          {/* Action Button & User Profile Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('list-gadget')}
              className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Gadget</span>
            </button>

            {/* Switch User for Testing Perspectives */}
            <div className="relative group">
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 cursor-pointer">
                {currentUser.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.full_name}
                    className="w-7 h-7 rounded-full object-cover border border-emerald-500"
                  />
                ) : (
                  <UserCircle className="w-7 h-7 text-slate-400" />
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-200 leading-none">
                    {currentUser.full_name.split(' ')[0]}
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    ⭐ {currentUser.trust_score.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* User Dropdown Selector */}
              <div className="absolute right-0 mt-2 w-56 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50">
                <p className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Switch Active User
                </p>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setCurrentUser(u)}
                    className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      currentUser.id === u.id
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <p>{u.full_name}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </div>
                    {u.bvn_verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
