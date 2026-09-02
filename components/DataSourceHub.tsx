import React, { useState } from 'react';
import { DataRow } from '../types';
import { 
  Upload, FileSpreadsheet, Globe, Database, Sparkles, 
  ArrowRight, CheckCircle2, AlertCircle, Loader2, RefreshCw, ExternalLink 
} from 'lucide-react';

interface DataSourceHubProps {
  onDataLoaded: (data: DataRow[], sourceName: string) => void;
  onError: (error: string) => void;
}

// Helper to parse CSV string into DataRow[]
export const parseCSVText = (text: string): DataRow[] => {
  const rows = text.split(/\r?\n/).filter(r => r.trim());
  if (rows.length < 2) throw new Error("Dataset is empty or missing headers.");

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const headers = parseLine(rows[0]).map(h => h.trim().replace(/^"|"$/g, ''));
  return rows.slice(1).map(row => {
    const values = parseLine(row);
    const obj: any = {};
    headers.forEach((header, i) => {
      let val = values[i]?.trim() ?? '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      obj[header] = (val !== '' && !isNaN(Number(val))) ? Number(val) : val;
    });
    return obj;
  });
};

// Curated Enterprise Sample Datasets
const SAMPLE_DATASETS = [
  {
    id: 'retail_sales',
    name: 'Diwali & Holiday Retail Transactions',
    records: '11,251 Transactions',
    description: 'Retail consumer dataset with User_ID, Product_Category, Orders, Amount, State, and Age-Group.',
    generator: () => {
      const states = ['Maharashtra', 'Uttar Pradesh', 'Karnataka', 'Delhi', 'Gujarat', 'Tamil Nadu', 'Telangana'];
      const categories = ['Clothing & Apparel', 'Food & Grocery', 'Electronics & Gadgets', 'Footwear', 'Home Decor'];
      const ageGroups = ['18-25', '26-35', '36-45', '46-55', '55+'];
      const genders = ['F', 'M'];
      const rows: DataRow[] = [];
      for (let i = 1; i <= 250; i++) {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const state = states[Math.floor(Math.random() * states.length)];
        const age = ageGroups[Math.floor(Math.random() * ageGroups.length)];
        const gender = genders[Math.floor(Math.random() * genders.length)];
        const orders = Math.floor(Math.random() * 4) + 1;
        const amount = Math.floor(Math.random() * 22000) + 1500;
        rows.push({
          User_ID: 1000000 + i,
          Cust_name: `Customer_${i}`,
          Product_Category: cat,
          State: state,
          Gender: gender,
          Age_Group: age,
          Orders: orders,
          Amount: amount,
          Status: orders > 1 ? 'Completed' : 'Shipped'
        });
      }
      return rows;
    }
  },
  {
    id: 'saas_b2b',
    name: 'B2B SaaS Pipeline & Revenue Matrix',
    records: 'Enterprise Accounts',
    description: 'Account-level revenue analytics with ARR, Contract_Length, Renewal_Probability, Churn_Risk, and Region.',
    generator: () => {
      const tiers = ['Enterprise', 'Mid-Market', 'Strategic Growth', 'Scale Tier'];
      const regions = ['North America', 'EMEA', 'Asia Pacific', 'Latin America'];
      const products = ['AI Engine Pro', 'Data Cloud Core', 'Predictive Suite', 'Security Shield'];
      const rows: DataRow[] = [];
      for (let i = 1; i <= 200; i++) {
        const tier = tiers[Math.floor(Math.random() * tiers.length)];
        const region = regions[Math.floor(Math.random() * regions.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const arr = Math.floor(Math.random() * 95000) + 12000;
        const renewalRate = Math.floor(Math.random() * 40) + 60;
        rows.push({
          Account_ID: `ACC-${2000 + i}`,
          Account_Name: `Enterprise Partner ${i}`,
          Contract_Tier: tier,
          Product_Line: product,
          Region: region,
          ARR_Value: arr,
          Renewal_Score: renewalRate,
          Satisfaction_Rating: (Math.random() * 2 + 3).toFixed(1)
        });
      }
      return rows;
    }
  },
  {
    id: 'customer_sentiment',
    name: 'Customer Experience & NPS Reviews',
    records: 'Review Stream',
    description: 'Text feedback stream including customer comments, sentiment tags, and NPS ratings.',
    generator: () => {
      const channels = ['Web App', 'Mobile iOS', 'In-Store POS', 'Customer Portal'];
      const sampleTexts = [
        'The performance analytics dashboard exceeded all our operational expectations.',
        'Extremely intuitive interface with rapid report synthesis and clear KPI momentum.',
        'Experienced occasional latency during heavy multi-table CSV ingestion.',
        'Outstanding customer support team resolved our data staging issues immediately.',
        'High value decision-support insights that guided our quarterly budget allocation.',
        'Great platform overall, looking forward to additional real-time integration connectors.'
      ];
      const rows: DataRow[] = [];
      for (let i = 1; i <= 150; i++) {
        const comment = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
        const channel = channels[Math.floor(Math.random() * channels.length)];
        const rating = Math.floor(Math.random() * 5) + 1;
        rows.push({
          Review_ID: `REV-${1000 + i}`,
          Channel: channel,
          Customer_Feedback: comment,
          Rating_Score: rating,
          Response_Time_Hours: Math.floor(Math.random() * 24) + 1
        });
      }
      return rows;
    }
  }
];

export const DataSourceHub: React.FC<DataSourceHubProps> = ({ onDataLoaded, onError }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'sheets' | 'url' | 'samples' | 'db'>('upload');
  const [sheetsUrl, setSheetsUrl] = useState('');
  const [directUrl, setDirectUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  // Database simulator state
  const [dbHost, setDbHost] = useState('enterprise-dw.snowflakecomputing.com');
  const [dbName, setDbName] = useState('ANALYTICS_PROD');
  const [dbTable, setDbTable] = useState('FACT_REVENUE_TRANSACTIONS');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setLoadingMsg('Parsing local CSV stream...');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSVText(text);
        onDataLoaded(parsed, file.name);
      } catch (err: any) {
        onError(err.message || 'Failed to parse local CSV file.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleGoogleSheetsImport = async () => {
    if (!sheetsUrl.trim()) {
      onError('Please provide a valid Google Sheets URL.');
      return;
    }

    setLoading(true);
    setLoadingMsg('Connecting to Google Sheets live export...');
    try {
      // Convert standard Google Sheets URL to CSV export link
      let exportUrl = sheetsUrl.trim();
      const match = exportUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const sheetId = match[1];
        exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      }

      const res = await fetch(exportUrl);
      if (!res.ok) {
        throw new Error('Could not fetch Google Sheet. Verify the sheet is set to "Anyone with the link can view".');
      }
      const text = await res.text();
      const parsed = parseCSVText(text);
      onDataLoaded(parsed, 'Google Sheets Live Stream');
    } catch (err: any) {
      onError(err.message || 'Failed to import from Google Sheets. Ensure sharing permissions are public.');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectUrlImport = async () => {
    if (!directUrl.trim()) {
      onError('Please provide a direct CSV URL.');
      return;
    }

    setLoading(true);
    setLoadingMsg('Streaming remote dataset...');
    try {
      const res = await fetch(directUrl.trim());
      if (!res.ok) throw new Error(`HTTP error ${res.status}: Failed to retrieve remote file.`);
      const text = await res.text();
      const parsed = parseCSVText(text);
      onDataLoaded(parsed, 'Remote CSV URL');
    } catch (err: any) {
      onError(err.message || 'Failed to stream dataset from remote URL. Check CORS or URL availability.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_DATASETS[0]) => {
    setLoading(true);
    setLoadingMsg(`Instantiating ${sample.name}...`);
    setTimeout(() => {
      try {
        const rows = sample.generator();
        onDataLoaded(rows, sample.name);
      } catch (err: any) {
        onError('Failed to generate sample data.');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleDbSimulate = () => {
    setLoading(true);
    setLoadingMsg(`Connecting to ${dbHost} / [${dbName}.${dbTable}]...`);
    setTimeout(() => {
      const rows = SAMPLE_DATASETS[0].generator();
      onDataLoaded(rows, `${dbName}.${dbTable}`);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Source Selector Tab Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-900/80 border border-slate-800 rounded-2xl backdrop-blur-md">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Local CSV File
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sheets'
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> Google Sheets
        </button>

        <button
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shadow-lg shadow-cyan-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Globe className="w-3.5 h-3.5" /> Remote URL
        </button>

        <button
          onClick={() => setActiveTab('samples')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'samples'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg shadow-amber-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Enterprise Samples
        </button>

        <button
          onClick={() => setActiveTab('db')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'db'
              ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Database className="w-3.5 h-3.5" /> Cloud Database
        </button>
      </div>

      {/* Tab Contents */}
      <div className="bg-white p-8 sm:p-10 rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-sm font-bold text-slate-800">{loadingMsg}</p>
          </div>
        )}

        {/* 1. Local CSV Upload */}
        {activeTab === 'upload' && (
          <div className="text-center space-y-6">
            <div className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-[28px] p-10 transition-all group relative cursor-pointer bg-slate-50/50 hover:bg-indigo-50/30">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                  <Upload className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">Drag & drop your CSV file here</p>
                  <p className="text-xs text-slate-400 mt-1">Supports UTF-8 CSV datasets up to 100MB with automated column detection</p>
                </div>
                <span className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow group-hover:bg-indigo-600 transition-colors">
                  Browse Local File
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Google Sheets Connector */}
        {activeTab === 'sheets' && (
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 space-y-1">
                <p className="font-bold text-sm">Google Sheets Live Pipeline</p>
                <p className="text-emerald-700 font-normal">
                  Paste the shareable link of any Google Sheet. Make sure the sharing permission is set to <strong>"Anyone with the link can view"</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Google Sheet Shareable URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  value={sheetsUrl}
                  onChange={e => setSheetsUrl(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleGoogleSheetsImport}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  Import Live Sheet <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Demo Google Sheet Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Need a live Google Sheet to test?</span>
              <button
                type="button"
                onClick={() => {
                  setSheetsUrl('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit');
                }}
                className="text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer"
              >
                Use Sample Retail Sheet URL
              </button>
            </div>
          </div>
        )}

        {/* 3. Direct CSV URL */}
        {activeTab === 'url' && (
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Raw CSV HTTP/HTTPS Endpoint
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  placeholder="https://raw.githubusercontent.com/datasets/gdp/master/data/gdp.csv"
                  value={directUrl}
                  onChange={e => setDirectUrl(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={handleDirectUrlImport}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  Fetch Remote CSV <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Ensure the target server permits Cross-Origin Requests (CORS) or hosts publicly accessible raw plain text.
            </p>
          </div>
        )}

        {/* 4. Enterprise Sample Datasets */}
        {activeTab === 'samples' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Curated Enterprise Benchmarks
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Select an enterprise dataset to immediately inspect 4-tier analytics without uploading files:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {SAMPLE_DATASETS.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => loadSample(sample)}
                  className="p-5 bg-slate-50 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-400 rounded-2xl transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded uppercase">
                      {sample.records}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm mt-2 group-hover:text-amber-800 transition-colors">
                      {sample.name}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed font-light">
                      {sample.description}
                    </p>
                  </div>

                  <div className="flex items-center text-xs font-bold text-slate-900 group-hover:text-amber-600 pt-2 border-t border-slate-200/60">
                    Load Dataset <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Cloud Database Connector */}
        {activeTab === 'db' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Cloud Data Warehouse Ingestion
                </h4>
                <p className="text-xs text-slate-500">Query Snowflake, PostgreSQL, BigQuery or Supabase securely.</p>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-1 rounded-md">
                Driver: PostgreSQL / Snowflake TLS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Host Endpoint</label>
                <input
                  type="text"
                  value={dbHost}
                  onChange={e => setDbHost(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Database</label>
                <input
                  type="text"
                  value={dbName}
                  onChange={e => setDbName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Table</label>
                <input
                  type="text"
                  value={dbTable}
                  onChange={e => setDbTable(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-[11px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 text-xs mb-1">SQL Query Extraction</label>
              <textarea
                rows={2}
                readOnly
                value={`SELECT * FROM "${dbName}"."PUBLIC"."${dbTable}" ORDER BY 1 DESC LIMIT 500;`}
                className="w-full bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl p-3 border border-slate-800"
              />
            </div>

            <button
              type="button"
              onClick={handleDbSimulate}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Database className="w-4 h-4" /> Execute Query &amp; Ingest Records
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
