import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AuthScreen } from './components/AuthScreen';
import { DataSourceHub } from './components/DataSourceHub';
import { DataRow, AnalysisSummary, DataQualityReport, UserProfile } from './types';
import { assessDataQuality, analyzeDataset, cleanDataset } from './services/geminiService';
import { 
  CheckCircle2, AlertCircle, Wand2, Download, Table, 
  Sparkles, ArrowRight, X, Loader2, ArrowUpRight 
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

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('narrative_auth_user', JSON.stringify(user));
    } catch {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
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
    } catch (err: any) {
      setError(`Synthesis Error: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
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

  // 1. Guard: Check Authentication
  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} />;
  }

  // 2. Loading Screen (Nomu-style)
  if (isLoading) {
    return (
      <Layout user={currentUser} onLogout={handleLogout} currentStep="staging">
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

  // 3. Analysis Dashboard View
  if (analysis) {
    return (
      <Layout user={currentUser} onLogout={handleLogout} currentStep="dashboard">
        <Dashboard analysis={analysis} onReset={reset} data={cleanedData || rawData || []} />
      </Layout>
    );
  }

  // 4. Data Ingestion & Staging View
  return (
    <Layout user={currentUser} onLogout={handleLogout} currentStep={rawData ? 'staging' : 'connect'}>
      <div className="w-full space-y-10 animate-nomu-fade">
        {!rawData ? (
          <section className="text-center space-y-8 py-4">
            {/* Header Hero */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-black/[0.06] rounded-full text-xs font-bold text-[#0E0E10] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#FF7448]" />
                Automated Decision Suite
              </div>
              <h1 className="text-4xl sm:text-6xl font-black text-[#0E0E10] tracking-tight leading-[1.1]">
                Your data into decisions <br/>
                <span className="text-[#FF7448]">in 5 minutes.</span>
              </h1>
              <p className="text-sm sm:text-base text-[#71717A] max-w-xl mx-auto font-normal leading-relaxed">
                Connect your business files, Google Sheets, or cloud databases. 
                Our pipeline cleans the dataset and synthesizes executive narrative reports automatically.
              </p>
            </div>

            {/* Ingestion Hub */}
            <DataSourceHub onDataLoaded={handleDataLoaded} onError={setError} />

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs justify-center max-w-md mx-auto">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
          </section>
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
      </div>
    </Layout>
  );
};

export default App;
