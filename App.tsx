import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AuthScreen } from './components/AuthScreen';
import { DataSourceHub } from './components/DataSourceHub';
import { DataRow, AnalysisSummary, DataQualityReport, UserProfile } from './types';
import { assessDataQuality, analyzeDataset, cleanDataset } from './services/geminiService';
import { 
  FileText, CheckCircle, AlertTriangle, XCircle, Loader2, 
  Sparkles, AlertCircle, Wand2, Download, Table, Database, RefreshCw 
} from 'lucide-react';

export const App: React.FC = () => {
  // Authentication State with localStorage persistence
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

  // 2. Loading Screen
  if (isLoading) {
    return (
      <Layout user={currentUser} onLogout={handleLogout}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping opacity-25"></div>
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin relative z-10" />
          </div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{loadingStep}</h2>
            <p className="text-slate-400 text-xs font-light max-w-sm mx-auto">
              Connecting to Render gateway and compiling 4-tier descriptive, diagnostic, predictive, and prescriptive narrative intelligence.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // 3. Analysis Dashboard View
  if (analysis) {
    return (
      <Layout user={currentUser} onLogout={handleLogout}>
        <Dashboard analysis={analysis} onReset={reset} data={cleanedData || rawData || []} />
      </Layout>
    );
  }

  // 4. Data Ingestion & Staging View
  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto space-y-10">
        {!rawData ? (
          <section className="text-center space-y-10 py-6 animate-in slide-in-from-bottom-8 duration-700">
            {/* Header Hero */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-bold tracking-wider text-indigo-700 uppercase">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Enterprise Narrative Intelligence
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Automated Analytics Pipeline <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-600">
                  Explainable Business Narratives
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-light max-w-2xl mx-auto leading-relaxed px-4">
                Connect your business datasets via local files, live Google Sheets, remote endpoints, or cloud database queries to generate automated executive intelligence reports.
              </p>
            </div>

            {/* Multi-Source Ingestion Hub */}
            <DataSourceHub onDataLoaded={handleDataLoaded} onError={setError} />

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-600 text-xs justify-center mx-4">
                <XCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-10 animate-in fade-in duration-500 px-2 sm:px-4">
            {/* Staging Command Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white sticky top-20 z-40 py-5 px-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4">
                <button onClick={reset} className="p-2 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" title="Cancel and load another dataset">
                  <XCircle className="w-5 h-5 text-slate-400 hover:text-slate-800" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Data Staging &amp; Quality Audit</h2>
                  <p className="text-xs text-slate-400">
                    Source: <span className="font-semibold text-indigo-600">{dataSourceName || 'Active Stream'}</span> &bull; {rawData.length.toLocaleString()} rows detected
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {!cleanedData ? (
                  <button 
                    onClick={handleCleaning}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-md shadow-indigo-100 w-full sm:w-auto justify-center cursor-pointer"
                  >
                    Clean Dataset <Wand2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button 
                    onClick={downloadCSV}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-md shadow-emerald-100 w-full sm:w-auto justify-center cursor-pointer"
                  >
                    Download Clean CSV <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  onClick={runAnalysis}
                  disabled={qualityReport?.status === 'red'}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 w-full sm:w-auto justify-center cursor-pointer ${
                    qualityReport?.status === 'red' 
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  Generate Insights <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Quality Report Audit */}
            {qualityReport && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Automated Ingestion Quality Score
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    qualityReport.status === 'green' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    qualityReport.status === 'yellow' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    Score: {qualityReport.score}/100 &bull; {qualityReport.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {qualityReport.checks.map((check, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{check.name}</span>
                        {check.status === 'pass' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> :
                         check.status === 'warning' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                         <XCircle className="w-4 h-4 text-rose-500" />}
                      </div>
                      <p className="text-xs text-slate-500 font-light">{check.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cleaning Transformation Audit */}
            {cleaningReport && (
              <div className="bg-white border border-indigo-100 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm animate-in slide-in-from-top-4 duration-500">
                <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-[10px]">
                  <Wand2 className="w-3.5 h-3.5" /> Pipeline Imputation &amp; Normalization Report
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cleaningReport.map((line, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs text-indigo-950 font-medium">
                      <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Preview of Ingested Records */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Table className="w-4 h-4 text-slate-400" /> Dataset Feature Schema
                </div>
                <span className="text-xs text-slate-400 font-medium">
                  Showing top 5 of {rawData.length.toLocaleString()} rows
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      {Object.keys(rawData[0] || {}).slice(0, 7).map((col, i) => (
                        <th key={i} className="px-4 py-3">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rawData.slice(0, 5).map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                        {Object.values(row).slice(0, 7).map((val: any, cIdx) => (
                          <td key={cIdx} className="px-4 py-2.5 font-mono text-[11px] text-slate-600 truncate max-w-[150px]">
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
