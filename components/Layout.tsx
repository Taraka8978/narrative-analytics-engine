import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Logo } from './Logo';
import { FooterModals, FooterModalTab } from './FooterModals';
import { LogOut, ArrowUpRight, ShieldCheck, Sparkles, CheckCircle2, Clock } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user?: UserProfile | null;
  onLogout?: () => void;
  currentStep?: 'connect' | 'staging' | 'dashboard';
  onOpenHistory?: () => void;
  historyCount?: number;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout,
  currentStep = 'connect',
  onOpenHistory,
  historyCount = 0
}) => {
  const [activeFooterTab, setActiveFooterTab] = useState<FooterModalTab>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF9F6] text-[#0E0E10] font-sans antialiased selection:bg-[#FF7448] selection:text-white">
      {/* Floating Pill Navigation Bar (Nomu-style) */}
      <div className="sticky top-4 z-50 w-full max-w-6xl mx-auto px-4 sm:px-6">
        <header className="flex items-center justify-between gap-4 rounded-full bg-white/80 backdrop-blur-xl border border-black/[0.06] pl-5 pr-4 py-3 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.1)] text-[#0E0E10] transition-all">
          {/* Custom Brand Logo with Full Name */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center group">
              <Logo size="sm" showWordmark={true} />
            </a>
          </div>

          {/* Stepper Navigation Pills (Desktop) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-[#FAF4ED] p-1 rounded-full border border-black/[0.04] text-xs font-medium text-[#71717A]">
            <span className={`px-4 py-1.5 rounded-full transition-all ${
              currentStep === 'connect' 
                ? 'bg-white text-[#0E0E10] font-bold shadow-sm' 
                : 'hover:text-[#0E0E10]'
            }`}>
              01 Connect
            </span>
            <span className={`px-4 py-1.5 rounded-full transition-all ${
              currentStep === 'staging' 
                ? 'bg-white text-[#0E0E10] font-bold shadow-sm' 
                : 'hover:text-[#0E0E10]'
            }`}>
              02 Staging
            </span>
            <span className={`px-4 py-1.5 rounded-full transition-all ${
              currentStep === 'dashboard' 
                ? 'bg-white text-[#0E0E10] font-bold shadow-sm' 
                : 'hover:text-[#0E0E10]'
            }`}>
              03 Intelligence
            </span>
          </nav>

          {/* User Profile, Activity History & Action Pill */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {/* User-Specific Analysis History Button */}
                {onOpenHistory && (
                  <button
                    onClick={onOpenHistory}
                    className="nomu-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF4ED] hover:bg-white text-xs font-bold text-[#0E0E10] border border-black/[0.04] shadow-xs transition-all cursor-pointer"
                    title="View saved analyses for your profile"
                  >
                    <Clock className="w-3.5 h-3.5 text-[#FF7448]" />
                    <span className="hidden sm:inline">History</span>
                    {historyCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#FF7448] text-white text-[9px] font-bold flex items-center justify-center">
                        {historyCount}
                      </span>
                    )}
                  </button>
                )}

                <div className="hidden sm:flex flex-col text-right pr-1">
                  <span className="text-xs font-bold text-[#0E0E10] leading-none">{user.name}</span>
                  <span className="text-[10px] text-[#71717A] mt-0.5 truncate max-w-[120px]">{user.company}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#0E0E10] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.avatar || 'US'}
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    title="Sign Out"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#71717A] hover:text-[#0E0E10] hover:bg-black/[0.04] transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Exit</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FAF4ED] text-[#0E0E10] text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-[#FF7448] animate-pulse" />
                <span>Verified Portal</span>
              </div>
            )}
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {children}
      </main>

      {/* Editorial Footer (Nomu-style) */}
      <footer className="w-full border-t border-black/[0.06] bg-[#FAF4ED]/60 mt-auto py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#71717A]">
          <div className="flex items-center gap-3">
            <Logo size="sm" showWordmark={true} />
            <span className="hidden sm:inline">&bull;</span>
            <span className="hidden sm:inline">Data into explainable decision intelligence in 5 minutes.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5 font-medium">
            <span className="inline-flex items-center gap-1.5 text-[#0E0E10]">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> API Gateway Active
            </span>
            <button 
              type="button"
              onClick={() => setActiveFooterTab('documentation')}
              className="hover:text-[#0E0E10] transition-colors cursor-pointer"
            >
              Documentation
            </button>
            <button 
              type="button"
              onClick={() => setActiveFooterTab('compliance')}
              className="hover:text-[#0E0E10] transition-colors cursor-pointer"
            >
              Compliance
            </button>
            <button 
              type="button"
              onClick={() => setActiveFooterTab('privacy')}
              className="hover:text-[#0E0E10] transition-colors cursor-pointer"
            >
              Privacy
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Footer Modals (Documentation / Compliance / Privacy) */}
      <FooterModals 
        activeTab={activeFooterTab} 
        onClose={() => setActiveFooterTab(null)} 
        onSelectTab={setActiveFooterTab} 
      />
    </div>
  );
};
