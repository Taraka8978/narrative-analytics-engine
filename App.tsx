import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AuthModal } from './components/AuthModal';
import { HeroLanding } from './components/HeroLanding';
import { DataSourceHub } from './components/DataSourceHub';
import { AnalysisHistoryModal } from './components/AnalysisHistoryModal';
import { DataRow, AnalysisSummary, DataQualityReport, UserProfile, AnalysisLogEntry } from './types';
import { assessDataQuality, analyzeDataset, cleanDataset } from './services/geminiService';
import { 
  CheckCircle2, AlertCircle, Wand2, Download, Table, 
  Sparkles, ArrowRight, X, Loader2, Clock, Lock, ArrowUpRight,
  ShieldCheck, FileSpreadsheet, BarChart3, Database
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('narrative_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [rawData, setRawData] = useState<DataRow[] | null>(null);
  const [dataSourceName, setDataSourceName] = useState<string>('');
  const [cleanedData, setCleanedData] = useState<DataRow[] | null>(null);
  const [cleaningReport, setCleaningReport] = useState<string[] | null>(null);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Authentication Modal State (Non-blocking)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // User-Specific Analysis Activity Logs
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [userLogs, setUserLogs] = useState<AnalysisLogEntry[]>([]);

  // Load user logs on auth change
  useEffect(() => {
    if (currentUser) {
      try {
        const stored = localStorage.getItem(`narrative_logs_${currentUser.id}`);
        setUserLogs(stored ? JSON.parse(stored) : []);
      } catch {
        setUserLogs([]);
      }
    } else {
      setUserLogs([]);
    }
  }, [currentUser]);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('narrative_auth_user', JSON.stringify(user));
    } catch {}

    // If there is an active analysis, associate it with the logged in user
    if (analysis && rawData) {
      const pendingLog: AnalysisLogEntry = {
        id: `log_${Date.now()}`,
        userId: user.id,
        datasetName: dataSourceName || 'Curated Dataset',
        timestamp: new Date().toISOString(),
        rowCount: (cleanedData || rawData).length,
        qualityScore: qualityReport?.score || 95,
        metricName: analysis.metadata?.metric_name || 'Metric',
        summaryPreview: analysis.descriptive?.narrative?.slice(0, 160) || 'Analysis complete.',
        analysis: analysis,
        cleanedData: cleanedData || rawData
      };

      try {
        const stored = localStorage.getItem(`narrative_logs_${user.id}`);
        const existing = stored ? JSON.parse(stored) : [];
        const updated = [pendingLog, ...existing].slice(0, 30);
        localStorage.setItem(`narrative_logs_${user.id}`, JSON.stringify(updated));
        setUserLogs(updated);
      } catch {}
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRawData(null);
    setAnalysis(null);
    try {
      localStorage.removeItem('narrative_auth_user');
    } catch {}
  };

  const handleDataLoaded = (data: DataRow[], sourceName: string) => {
    setRawData(data);
    setDataSourceName(sourceName);
    setQualityReport(assessDataQuality(data));
    setCleanedData(null);
    setCleaningReport(null);
    setError(null);
  };

  const handleCleaning = () => {
    if (!rawData) return;
    const { cleanedData, report } = cleanDataset(rawData);
    setCleanedData(cleanedData);
    setCleaningReport(report);
  };

  const downloadCSV = () => {
    const dataToExport = cleanedData || rawData;
    if (!dataToExport || dataToExport.length === 0) return;

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(row => Object.values(row).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cleaned_analytics_dataset.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const runAnalysis = async () => {
    const targetData = cleanedData || rawData;
    if (!targetData || targetData.length === 0) {
      setError('No data available to analyze after cleaning.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setLoadingStep('Initializing statistical engines...');
    
    try {
      setLoadingStep('Synthesizing narrative layers...');
      const results = await analyzeDataset(targetData);
      setAnalysis(results);
      setError(null);

      // Log directly to the authenticated user's profile history
      if (currentUser) {
        const newLog: AnalysisLogEntry = {
          id: `log_${Date.now()}`,
          userId: currentUser.id,
          datasetName: dataSourceName || 'Curated Dataset',
          timestamp: new Date().toISOString(),
          rowCount: targetData.length,
          qualityScore: qualityReport?.score || 95,
          metricName: results.metadata?.metric_name || 'Metric',
          summaryPreview: results.descriptive?.narrative?.slice(0, 160) || '4-tier narrative analysis complete.',
          analysis: results,
          cleanedData: targetData
        };

        setUserLogs(prev => {
          const updated = [newLog, ...prev.filter(l => l.id !== newLog.id)].slice(0, 30);
          try {
            localStorage.setItem(`narrative_logs_${currentUser.id}`, JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch (err: any) {
      setError(`Synthesis Error: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleSelectLog = (log: AnalysisLogEntry) => {
    setAnalysis(log.analysis);
    setCleanedData(log.cleanedData || null);
    setDataSourceName(log.datasetName);
    setIsHistoryOpen(false);
  };

  const handleDeleteLog = (id: string) => {
    if (!currentUser) return;
    setUserLogs(prev => {
      const updated = prev.filter(l => l.id !== id);
      try {
        localStorage.setItem(`narrative_logs_${currentUser.id}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearAllLogs = () => {
    if (!currentUser) return;
    setUserLogs([]);
    try {
      localStorage.removeItem(`narrative_logs_${currentUser.id}`);
    } catch {}
  };

  const reset = () => {
    setRawData(null);
    setDataSourceName('');
    setCleanedData(null);
    setCleaningReport(null);
    setQualityReport(null);
    setAnalysis(null);
    setError(null);
  };

  // 1. Loading Screen (Nomu-style)
  if (isLoading) {
    return (
      <Layout 
        user={currentUser} 
        onLogout={handleLogout} 
        currentStep="staging"
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={userLogs.length}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      >
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-nomu-fade">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#FFF0EB] flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-[#FF7448] animate-spin" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#0E0E10] tracking-tight">{loadingStep}</h2>
            <p className="text-[#71717A] text-xs font-normal max-w-xs mx-auto">
              Running regression matrices, correlation coefficients, and descriptive summarization in real time.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // 2. Analysis Dashboard View (Only accessible for active analysis)
  if (analysis) {
    return (
      <Layout 
        user={currentUser} 
        onLogout={handleLogout} 
        currentStep="dashboard"
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={userLogs.length}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      >
        <Dashboard analysis={analysis} onReset={reset} data={cleanedData || rawData || []} />
        
        {/* History Modal */}
        <AnalysisHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          logs={userLogs}
          onSelectLog={handleSelectLog}
          onDeleteLog={handleDeleteLog}
          onClearAll={handleClearAllLogs}
          userName={currentUser?.name || 'Guest User'}
        />

        {/* Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLogin={handleLogin}
        />
      </Layout>
    );
  }

  // 3. PUBLIC SHOWCASE LANDING (Displayed when visitor is NOT authenticated)
  // Protected: Visitors can browse the entire premium website, but cannot ingest datasets or run the engine without signing in!
  if (!currentUser) {
    return (
      <Layout 
        user={null} 
        onOpenAuth={() => setIsAuthModalOpen(true)}
        currentStep="connect"
      >
        <div className="w-full space-y-16 animate-nomu-fade">
          {/* Nomu-Style Hero Section */}
          <HeroLanding
            onOpenAuth={() => setIsAuthModalOpen(true)}
            onExploreDemo={() => setIsAuthModalOpen(true)}
            isAuthenticated={false}
          />

          {/* Protected Client Workspace Gate Card */}
          <section className="bg-white rounded-[36px] border border-black/[0.06] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center space-y-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF4ED] text-xs font-bold text-[#0E0E10]">
                <Lock className="w-3.5 h-3.5 text-[#FF7448]" />
                Protected Enterprise Client Workspace
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-[#0E0E10] tracking-tight">
                Authentication Required to Ingest Datasets
              </h3>
              <p className="text-xs sm:text-sm text-[#71717A] max-w-xl mx-auto leading-relaxed font-normal">
                To protect proprietary computational models and guarantee zero data leakage, file ingestion, Google Sheets syncing, and 4-tier synthesis are restricted to authorized clients and partners.
              </p>
            </div>

            {/* 3 Capabilities Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-5 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-2">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#FF7448] shadow-xs">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#0E0E10]">Multi-Source Ingestion</h4>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  Direct CSV upload, live Google Sheets sync, SQL query endpoints, and curated enterprise benchmark sets.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-2">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#0E0E10] shadow-xs">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#0E0E10]">4-Tier Synthesis</h4>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  Descriptive summaries, Pearson diagnostic correlations, Monte Carlo predictive horizons, and prescriptive actions.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] space-y-2">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-[#0E0E10]">Executive PDF Reports</h4>
                <p className="text-xs text-[#71717A] leading-relaxed">
                  Presentation-ready A4 executive slide decks exportable with 1-click for board meetings and leadership briefings.
                </p>
              </div>
            </div>

            {/* Call to action button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="nomu-pill w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Client Sign In to Access Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="nomu-pill w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#FAF4ED] hover:bg-white text-[#0E0E10] border border-black/[0.06] text-xs sm:text-sm font-bold transition-all cursor-pointer"
              >
                1-Click Demo Profiles Available ✦
              </button>
            </div>
          </section>

          {/* Editorial Secondary Banner (Nomu Screenshot 3) */}
          <section className="text-center space-y-6 py-8 border-t border-black/[0.06]">
            <h3 className="text-3xl sm:text-5xl font-black text-[#0E0E10] tracking-tight leading-tight">
              <span className="relative inline-block px-3 py-0.5">
                <span className="relative z-10">Grow your margins,</span>
                <span className="absolute inset-0 -skew-y-1 border-2 border-[#FF7448] rounded-full scale-105 pointer-events-none opacity-85" />
              </span>
              {" "}not your spreadsheets<span className="text-[#FF7448]">.</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#71717A] max-w-xl mx-auto leading-relaxed">
              The first AI decision platform that replaces manual formula crunching, disparate BI dashboards, and slide drafting with explainable, 4-tier analytics.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="nomu-pill px-8 py-3.5 rounded-full bg-[#FF7448] hover:bg-[#F26235] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                Launch Decision Suite <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Auth Modal */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
            onLogin={handleLogin}
          />
        </div>
      </Layout>
    );
  }

  // 4. AUTHENTICATED CLIENT WORKSPACE (Only shown when user is logged in)
  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      currentStep={rawData ? 'staging' : 'connect'}
      onOpenHistory={() => setIsHistoryOpen(true)}
      historyCount={userLogs.length}
      onOpenAuth={() => setIsAuthModalOpen(true)}
    >
      <div className="w-full space-y-10 animate-nomu-fade">
        {!rawData ? (
          <div className="space-y-8">
            {/* Authenticated Workspace Header */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-black/[0.06] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#FF7448] uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Authorized Client Workspace
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0E0E10] tracking-tight">
                  Welcome back, {currentUser.name}
                </h2>
                <p className="text-xs text-[#71717A] mt-0.5">
                  Connected as <span className="font-semibold text-[#0E0E10]">{currentUser.company}</span> ({currentUser.role})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsHistoryOpen(true)}
                  className="nomu-pill px-5 py-2.5 rounded-full bg-[#FAF4ED] hover:bg-white text-xs font-bold text-[#0E0E10] border border-black/[0.04] flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Clock className="w-3.5 h-3.5 text-[#FF7448]" />
                  <span>View Past Analyses</span>
                  {userLogs.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#FF7448] text-white text-[9px] font-bold flex items-center justify-center">
                      {userLogs.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Ingestion Hub Centerpiece */}
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-xl sm:text-2xl font-black text-[#0E0E10] tracking-tight">
                  Connect or Pick a Dataset
                </h3>
                <p className="text-xs text-[#71717A]">
                  Select your ingestion source to begin the automated cleaning and narrative pipeline.
                </p>
              </div>

              <DataSourceHub onDataLoaded={handleDataLoaded} onError={setError} />

              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs justify-center max-w-md mx-auto">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          <section className="space-y-8">
            {/* Staging Floating Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[28px] border border-black/[0.06] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-3">
                <button 
                  onClick={reset} 
                  className="w-9 h-9 rounded-full bg-[#FAF4ED] hover:bg-black hover:text-white text-[#71717A] flex items-center justify-center transition-colors cursor-pointer"
                  title="Discard dataset"
                >
                  <X className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-base font-bold text-[#0E0E10]">Data Curation &amp; Staging</h2>
                  <p className="text-xs text-[#71717A]">
                    Source: <span className="font-semibold text-[#0E0E10]">{dataSourceName}</span> &bull; {rawData.length.toLocaleString()} records ingested
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!cleanedData ? (
                  <button 
                    onClick={handleCleaning}
                    className="nomu-pill px-5 py-2.5 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    Clean &amp; Impute <Wand2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button 
                    onClick={downloadCSV}
                    className="nomu-pill px-5 py-2.5 rounded-full bg-white hover:bg-[#FAF4ED] text-[#0E0E10] border border-black/[0.08] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    Download Clean CSV <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  onClick={runAnalysis}
                  disabled={qualityReport?.status === 'red'}
                  className={`nomu-pill px-6 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
                    qualityReport?.status === 'red' 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-[#FF7448] hover:bg-[#F26235] text-white hover:shadow-md'
                  }`}
                >
                  Generate Insights <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Quality Score Pill Grid */}
            {qualityReport && (
              <div className="bg-white rounded-[32px] border border-black/[0.06] p-6 sm:p-8 space-y-5 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0E0E10] uppercase tracking-wider">
                    Automated Ingestion Audit
                  </span>
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#FAF4ED] text-[#0E0E10] border border-black/[0.06]">
                    Quality Score: {qualityReport.score}/100 &bull; {qualityReport.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {qualityReport.checks.map((check, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.03] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0E0E10]">{check.name}</span>
                        {check.status === 'pass' ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                        )}
                      </div>
                      <p className="text-xs text-[#71717A] font-normal">{check.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cleaning Transformation Audit */}
            {cleaningReport && (
              <div className="bg-white rounded-[32px] border border-black/[0.06] p-6 sm:p-8 space-y-4 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)] animate-nomu-fade">
                <div className="flex items-center gap-2 text-[#FF7448] font-bold text-xs uppercase tracking-wider">
                  <Wand2 className="w-3.5 h-3.5" /> Normalization &amp; Imputation Log
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cleaningReport.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 rounded-2xl bg-[#FAF4ED] text-xs text-[#0E0E10] font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Data Schema Preview Table */}
            <div className="bg-white rounded-[32px] border border-black/[0.06] p-6 sm:p-8 space-y-4 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#0E0E10] uppercase tracking-wider">
                  <Table className="w-4 h-4 text-[#71717A]" /> Schema Preview
                </div>
                <span className="text-xs text-[#71717A]">
                  Top 5 of {rawData.length.toLocaleString()} rows
                </span>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-black/[0.06]">
                <table className="w-full text-left text-xs text-[#0E0E10]">
                  <thead className="bg-[#FAF4ED] text-[#71717A] font-bold uppercase text-[10px] tracking-wider border-b border-black/[0.06]">
                    <tr>
                      {Object.keys(rawData[0] || {}).slice(0, 7).map((col, i) => (
                        <th key={i} className="px-4 py-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04]">
                    {rawData.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-[#FAF4ED]/50 transition-colors">
                        {Object.values(row).slice(0, 7).map((val: any, cIdx) => (
                          <td key={cIdx} className="px-4 py-3 font-mono text-[11px] text-[#0E0E10] truncate max-w-[150px]">
                            {val !== null && val !== undefined ? String(val) : '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* Global History Modal */}
        <AnalysisHistoryModal
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          logs={userLogs}
          onSelectLog={handleSelectLog}
          onDeleteLog={handleDeleteLog}
          onClearAll={handleClearAllLogs}
          userName={currentUser?.name || 'Guest User'}
        />
      </div>
    </Layout>
  );
};

export default App;
