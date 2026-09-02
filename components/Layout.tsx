import React from 'react';
import { UserProfile } from '../types';
import { ShieldCheck, LogOut, User, Building, Activity } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user?: UserProfile | null;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Top Enterprise Navigation Header */}
      <header className="border-b border-slate-200/80 sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20">
              <span className="text-white font-black text-xs tracking-wider">NA</span>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                Narrative Analytics
              </h1>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                Enterprise Decision Suite
              </span>
            </div>
          </div>

          {/* Center Status Indicators (Desktop) */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>API Gateway: Live (Render SG)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-600 font-medium rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>SOC-2 Type II Certified</span>
            </div>
          </div>

          {/* User Profile & Session Controls */}
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 leading-tight">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[140px]">{user.company}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user.avatar || 'CL'}
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Sign Out of Session"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg text-slate-500 hover:text-rose-600 text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Sign Out</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400 font-medium">Guest Session</span>
            </div>
          )}
        </div>
      </header>

      {/* Main App Workspace */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>

      {/* Enterprise Footer */}
      <footer className="border-t border-slate-200/80 py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 space-y-4">
          <p className="max-w-2xl mx-auto leading-relaxed text-slate-400 font-light">
            Automated enterprise decision-support architecture integrating descriptive volume aggregates, diagnostic Pearson correlations, linear growth forecasting, and prescriptive executive action checklists.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
            <span>&copy; 2026 Narrative Analytics Inc.</span>
            <span>&bull;</span>
            <span className="text-slate-600 font-semibold">256-bit TLS Encrypted Tunnel</span>
            <span>&bull;</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Data Privacy Governance</a>
            <span>&bull;</span>
            <a href="#" className="hover:text-slate-800 transition-colors">Compliance Verification</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
