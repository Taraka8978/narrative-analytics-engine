import React, { useState } from 'react';
import { 
  X, BookOpen, ShieldCheck, Lock, FileText, 
  CheckCircle2, Server, Database, Sparkles, Terminal, 
  Check, ArrowRight, ExternalLink 
} from 'lucide-react';

export type FooterModalTab = 'documentation' | 'compliance' | 'privacy' | null;

interface FooterModalsProps {
  activeTab: FooterModalTab;
  onClose: () => void;
  onSelectTab: (tab: FooterModalTab) => void;
}

export const FooterModals: React.FC<FooterModalsProps> = ({
  activeTab,
  onClose,
  onSelectTab
}) => {
  if (!activeTab) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-nomu-fade">
      <div className="bg-white w-full max-w-3xl rounded-[36px] border border-black/[0.08] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.2)] p-6 sm:p-10 flex flex-col max-h-[88vh] relative overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-black/[0.06]">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF4ED] rounded-full border border-black/[0.04]">
            <button
              onClick={() => onSelectTab('documentation')}
              className={`nomu-pill px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'documentation'
                  ? 'bg-[#0E0E10] text-white shadow-sm'
                  : 'text-[#71717A] hover:text-[#0E0E10]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Documentation
            </button>

            <button
              onClick={() => onSelectTab('compliance')}
              className={`nomu-pill px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'compliance'
                  ? 'bg-[#0E0E10] text-white shadow-sm'
                  : 'text-[#71717A] hover:text-[#0E0E10]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Compliance
            </button>

            <button
              onClick={() => onSelectTab('privacy')}
              className={`nomu-pill px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'privacy'
                  ? 'bg-[#0E0E10] text-white shadow-sm'
                  : 'text-[#71717A] hover:text-[#0E0E10]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" /> Privacy Policy
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF4ED] hover:bg-black hover:text-white text-[#0E0E10] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto py-6 pr-2 space-y-6 text-[#0E0E10] text-xs leading-relaxed">
          {/* 1. DOCUMENTATION TAB */}
          {activeTab === 'documentation' && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-[#FF7448] uppercase tracking-wider">
                  Technical Architecture &amp; User Manual
                </span>
                <h3 className="text-2xl font-black text-[#0E0E10] tracking-tight mt-1">
                  Narrative Analytics Engine Documentation
                </h3>
                <p className="text-[#71717A] text-xs mt-1">
                  Complete specifications on multi-source ingestion, automated cleaning gates, 4-tier synthesis algorithms, and executive reporting.
                </p>
              </div>

              {/* Architecture Steps */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E0E10]">
                  1. The End-to-End Analytics Pipeline
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-1.5">
                    <p className="font-bold text-[#0E0E10] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#0E0E10] text-white text-[10px] flex items-center justify-center">1</span>
                      Ingestion &amp; Parsing Gate
                    </p>
                    <p className="text-[#71717A]">
                      Accepts RFC-4180 CSV strings, live Google Sheets endpoints (`/export?format=csv`), remote webhooks, and SQL query extractions. Parses quote escapes, detects delimiter types, and casts data types dynamically.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-1.5">
                    <p className="font-bold text-[#0E0E10] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#0E0E10] text-white text-[10px] flex items-center justify-center">2</span>
                      Automated Curation &amp; Imputation
                    </p>
                    <p className="text-[#71717A]">
                      Executes statistical missing-value imputation (median for continuous metrics, mode for categorical dimensions). Removes duplicate signatures and validates column variances.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-1.5">
                    <p className="font-bold text-[#0E0E10] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#0E0E10] text-white text-[10px] flex items-center justify-center">3</span>
                      4-Tier Narrative Synthesis
                    </p>
                    <p className="text-[#71717A]">
                      Computes Descriptive summaries (KPI distributions), Diagnostic correlations (Pearson matrices), Predictive horizons (Monte Carlo &amp; auto-regressive slopes), and Prescriptive roadmaps.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-1.5">
                    <p className="font-bold text-[#0E0E10] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#0E0E10] text-white text-[10px] flex items-center justify-center">4</span>
                      Executive PDF &amp; Interactive Slicing
                    </p>
                    <p className="text-[#71717A]">
                      Real-time client-side cross-filtering without server round-trips. One-click presentation PDF exporter powered by `jspdf` and `html2canvas` for boardroom briefings.
                    </p>
                  </div>
                </div>
              </div>

              {/* API Specs */}
              <div className="space-y-2 pt-2 border-t border-black/[0.06]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E0E10]">
                  2. Backend API Endpoint Reference
                </h4>
                <div className="p-4 rounded-2xl bg-[#0E0E10] text-white font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-white/50 text-[10px]">
                    <span>POST https://narrative-analytics-engine-backend.onrender.com/analyze</span>
                    <span className="text-emerald-400">HTTP 200 OK</span>
                  </div>
                  <pre className="text-emerald-400 overflow-x-auto">
{`Request Payload:
{
  "dataset": [ { "Category": "Retail", "Amount": 4500, "Orders": 2 } ],
  "context": "Executive decision support report"
}`}
                  </pre>
                  <p className="text-white/70 text-[10px] font-sans">
                    Auto-switches to lightweight lexicon sentiment model in resource-constrained container environments to guarantee zero-latency execution.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 2. COMPLIANCE TAB */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-[#FF7448] uppercase tracking-wider">
                  Enterprise Security &amp; Regulatory Framework
                </span>
                <h3 className="text-2xl font-black text-[#0E0E10] tracking-tight mt-1">
                  Compliance &amp; Governance Certification
                </h3>
                <p className="text-[#71717A] text-xs mt-1">
                  Built to meet the rigorous security, encryption, and governance standards demanded by institutional finance and enterprise health.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-[#0E0E10]">SOC-2 Type II</p>
                  <p className="text-[11px] text-[#71717A]">
                    Audited operational controls for data availability, integrity, and operational confidentiality.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto text-[#FF7448] shadow-xs">
                    <Lock className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-[#0E0E10]">256-Bit TLS 1.3</p>
                  <p className="text-[11px] text-[#71717A]">
                    End-to-end transport layer security. All remote data transmission encrypted at transit.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mx-auto text-indigo-600 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-[#0E0E10]">GDPR &amp; CCPA</p>
                  <p className="text-[11px] text-[#71717A]">
                    Full compliance with personal data minimization and unconditional right-to-erasure.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-black/[0.06]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E0E10]">
                  Zero-Persistence Architecture Guarantee
                </h4>
                <div className="p-5 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-2">
                  <p className="text-xs text-[#0E0E10] font-bold">
                    No Customer Dataset is Ever Stored on Persistent Server Disks:
                  </p>
                  <ul className="space-y-1.5 text-[#71717A] text-[11px]">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Uploaded datasets are held only in browser runtime memory and ephemeral server compute memory during the analysis call.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Session logs are stored exclusively in your local device's `localStorage` sandbox.
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      No dataset records are used for public model training or shared with unauthorized third parties.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 3. PRIVACY POLICY TAB */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <span className="text-[10px] font-bold text-[#FF7448] uppercase tracking-wider">
                  Data Governance &amp; Confidentiality
                </span>
                <h3 className="text-2xl font-black text-[#0E0E10] tracking-tight mt-1">
                  Privacy Policy
                </h3>
                <p className="text-[#71717A] text-xs mt-1">
                  Last Updated: September 2026 &bull; Narrative Analytics Engine SaaS
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-1.5">
                  <p className="font-bold text-[#0E0E10]">1. Information We Collect</p>
                  <p className="text-[#71717A] text-[11px]">
                    We collect minimal authentication credentials (Name, Corporate Email, Organization) solely to maintain your isolated business workspace. We do not track external browsing activities or sell any customer metadata.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-1.5">
                  <p className="font-bold text-[#0E0E10]">2. Processing of Ingested Datasets</p>
                  <p className="text-[#71717A] text-[11px]">
                    When you upload a CSV, connect Google Sheets, or simulate a database query, data rows are analyzed purely for statistical computation (regression, aggregation, covariance). The raw data is never cached on external third-party servers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-1.5">
                  <p className="font-bold text-[#0E0E10]">3. Local Session Storage &amp; Right to Erasure</p>
                  <p className="text-[#71717A] text-[11px]">
                    Your past analysis logs and profile credentials reside in your browser's private `localStorage`. You may clear your session and permanently wipe all saved reports at any time using the <strong>Clear All History</strong> button in the History menu.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-1.5">
                  <p className="font-bold text-[#0E0E10]">4. Contact &amp; Data Protection Officer</p>
                  <p className="text-[#71717A] text-[11px]">
                    For compliance inquiries, audit requests, or enterprise SLA agreements, contact our data protection team at <strong>privacy@narrativeengine.ai</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Close */}
        <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
          <span className="text-xs text-[#71717A]">
            Narrative Analytics Engine &bull; Official Compliance Portal
          </span>
          <button
            onClick={onClose}
            className="nomu-pill px-5 py-2.5 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
