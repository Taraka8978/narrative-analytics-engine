import React from 'react';
import { ArrowRight, Sparkles, ArrowUpRight, CheckCircle2, Database, ShieldCheck } from 'lucide-react';

interface HeroLandingProps {
  onOpenAuth: () => void;
  onExploreDemo: () => void;
  isAuthenticated: boolean;
}

export const HeroLanding: React.FC<HeroLandingProps> = ({ 
  onOpenAuth, 
  onExploreDemo,
  isAuthenticated 
}) => {
  return (
    <section className="relative pt-6 pb-12 sm:pb-16 flex flex-col items-center text-center space-y-12">
      {/* Background Subtle Grid Pattern */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute inset-0 -top-24 h-[600px] w-full max-w-7xl mx-auto opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] -z-10"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />

      {/* Top Badge (Nomu Trophy Badge style) */}
      <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-[#0E0E10] border border-black/[0.06] shadow-sm hover:shadow-md transition-shadow">
        <span className="w-2 h-2 rounded-full bg-[#FF7448] animate-pulse" />
        <span>Enterprise Decision Suite &bull; SOC-2 Audited</span>
      </div>

      {/* Main Hero Headline (Nomu Typography with black animated pill) */}
      <div className="max-w-4xl space-y-4">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#0E0E10] leading-[1.12]">
          Turn raw datasets
          <br />
          <span className="relative overflow-hidden bg-[#0E0E10] text-white inline-flex items-center justify-center align-middle px-4 sm:px-8 py-1 sm:py-2 my-1 rounded-2xl md:rounded-3xl shadow-xl mx-2 group">
            <span className="relative z-10 text-white flex items-center gap-2">
              <span>into decisions</span>
              <span className="text-[#FF7448] text-sm sm:text-base font-mono">✦</span>
            </span>
          </span>
          <br />
          on autopilot<span className="text-[#FF7448]">.</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-[#71717A] max-w-2xl mx-auto font-normal leading-relaxed pt-2">
          Ditch the maze of static spreadsheets, manual formulas, and guesswork.
          <br className="hidden sm:inline" />
          Go from raw CSV to an executive boardroom narrative in 5 minutes.
        </p>
      </div>

      {/* CTA Button Group */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={onExploreDemo}
          className="nomu-pill px-8 py-3.5 rounded-full bg-[#FF7448] hover:bg-[#F26235] text-white text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <span>Ingest Data &amp; Test Engine</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {!isAuthenticated && (
          <button
            onClick={onOpenAuth}
            className="nomu-pill px-7 py-3.5 rounded-full bg-white hover:bg-[#FAF4ED] text-[#0E0E10] border border-black/[0.08] text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Client Sign In</span>
            <ArrowUpRight className="w-4 h-4 text-[#71717A]" />
          </button>
        )}
      </div>

      {/* Tactile Tumbling Pills Stack (Nomu Screenshot 2 style) */}
      <div className="w-full max-w-3xl pt-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#71717A] mb-4">
          Everything your data stack replaces in one autonomous pipeline:
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-2xl mx-auto">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#10B981] text-white shadow-xs -rotate-2 hover:rotate-0 transition-transform cursor-default">
            📊 an inventory &amp; sales spreadsheet
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FF7448] text-white shadow-xs rotate-1 hover:rotate-0 transition-transform cursor-default">
            ✉️ emailing 14 regional directors
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#0E0E10] text-white shadow-xs -rotate-1 hover:rotate-0 transition-transform cursor-default">
            📑 executive PDF deck export
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#3B82F6] text-white shadow-xs rotate-2 hover:rotate-0 transition-transform cursor-default">
            📈 a predictive regression forecast
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#8B5CF6] text-white shadow-xs -rotate-2 hover:rotate-0 transition-transform cursor-default">
            ⚡ Google Sheets live streaming
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#059669] text-white shadow-xs rotate-1 hover:rotate-0 transition-transform cursor-default">
            🛡️ automated null imputation
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#6366F1] text-white shadow-xs -rotate-1 hover:rotate-0 transition-transform cursor-default">
            🎛️ real-time categorical slicing
          </span>
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#D97706] text-white shadow-xs rotate-2 hover:rotate-0 transition-transform cursor-default">
            🛢️ Snowflake &amp; PostgreSQL queries
          </span>
        </div>
      </div>

      {/* Supported By / Integrates With Bar (Nomu Screenshot 2 style) */}
      <div className="w-full pt-8 border-t border-black/[0.06] flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-xs text-[#71717A]">
        <span className="font-bold text-[10px] uppercase tracking-wider shrink-0 text-[#0E0E10]/60">
          Native Connectors &amp; Sources:
        </span>
        <div className="flex flex-wrap items-center justify-center gap-6 font-bold tracking-tight text-[#0E0E10]/70 text-xs sm:text-sm">
          <span className="hover:text-[#0E0E10] transition-colors">Snowflake</span>
          <span>&bull;</span>
          <span className="hover:text-[#0E0E10] transition-colors">Google Sheets</span>
          <span>&bull;</span>
          <span className="hover:text-[#0E0E10] transition-colors">PostgreSQL</span>
          <span>&bull;</span>
          <span className="hover:text-[#0E0E10] transition-colors">Databricks</span>
          <span>&bull;</span>
          <span className="hover:text-[#0E0E10] transition-colors">BigQuery</span>
          <span>&bull;</span>
          <span className="hover:text-[#0E0E10] transition-colors">Supabase</span>
        </div>
      </div>
    </section>
  );
};
