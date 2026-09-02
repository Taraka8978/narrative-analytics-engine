import React, { useState } from 'react';
import { DataRow } from '../types';
import { 
  Upload, FileSpreadsheet, Globe, Database, Sparkles, 
  ArrowRight, CheckCircle2, AlertCircle, Loader2, ArrowUpRight 
} from 'lucide-react';

interface DataSourceHubProps {
  onDataLoaded: (data: DataRow[], sourceName: string) => void;
  onError: (error: string) => void;
}

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

const SAMPLE_DATASETS = [
  {
    id: 'retail_sales',
    name: 'Diwali & Holiday Retail Transactions',
    badge: '11,251 Rows',
    description: 'Transaction ledger with User_ID, Product_Category, Orders, Amount, State, and Age demographics.',
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
    name: 'B2B SaaS Revenue & Pipeline Matrix',
    badge: '200 Accounts',
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
    badge: '150 Reviews',
    description: 'Customer voice feedback stream with review comments, sentiment scores, and response latencies.',
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

  const [dbHost, setDbHost] = useState('enterprise-dw.snowflakecomputing.com');
  const [dbName, setDbName] = useState('ANALYTICS_PROD');
  const [dbTable, setDbTable] = useState('FACT_REVENUE_TRANSACTIONS');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setLoadingMsg('Ingesting local CSV stream...');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = parseCSVText(text);
        onDataLoaded(parsed, file.name);
      } catch (err: any) {
        onError(err.message || 'Failed to parse CSV file.');
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
      let exportUrl = sheetsUrl.trim();
      const match = exportUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) {
        const sheetId = match[1];
        exportUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      }

      const res = await fetch(exportUrl);
      if (!res.ok) throw new Error('Could not fetch Google Sheet. Check sharing permissions.');
      const text = await res.text();
      const parsed = parseCSVText(text);
      onDataLoaded(parsed, 'Google Sheets Live Stream');
    } catch (err: any) {
      onError(err.message || 'Failed to import from Google Sheets. Ensure sheet is public.');
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
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to retrieve remote file.`);
      const text = await res.text();
      const parsed = parseCSVText(text);
      onDataLoaded(parsed, 'Remote CSV URL');
    } catch (err: any) {
      onError(err.message || 'Failed to stream dataset. Check CORS availability.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_DATASETS[0]) => {
    setLoading(true);
    setLoadingMsg(`Loading ${sample.name}...`);
    setTimeout(() => {
      try {
        const rows = sample.generator();
        onDataLoaded(rows, sample.name);
      } catch (err: any) {
        onError('Failed to generate sample data.');
      } finally {
        setLoading(false);
      }
    }, 350);
  };

  const handleDbSimulate = () => {
    setLoading(true);
    setLoadingMsg(`Querying ${dbName}.${dbTable}...`);
    setTimeout(() => {
      const rows = SAMPLE_DATASETS[0].generator();
      onDataLoaded(rows, `${dbName}.${dbTable}`);
      setLoading(false);
    }, 700);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Pill Segmented Tab Bar (Nomu-style) */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-[#FAF4ED] rounded-full border border-black/[0.04]">
        <button
          onClick={() => setActiveTab('upload')}
          className={`nomu-pill px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-[#0E0E10] text-white shadow-sm'
              : 'text-[#71717A] hover:text-[#0E0E10]'
          }`}
        >
          Local CSV
        </button>

        <button
          onClick={() => setActiveTab('sheets')}
          className={`nomu-pill px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer ${
            activeTab === 'sheets'
              ? 'bg-[#0E0E10] text-white shadow-sm'
              : 'text-[#71717A] hover:text-[#0E0E10]'
          }`}
        >
          Google Sheets
        </button>

        <button
          onClick={() => setActiveTab('url')}
          className={`nomu-pill px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer ${
            activeTab === 'url'
              ? 'bg-[#0E0E10] text-white shadow-sm'
              : 'text-[#71717A] hover:text-[#0E0E10]'
          }`}
        >
          Remote URL
        </button>

        <button
          onClick={() => setActiveTab('samples')}
          className={`nomu-pill px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer ${
            activeTab === 'samples'
              ? 'bg-[#0E0E10] text-white shadow-sm'
              : 'text-[#71717A] hover:text-[#0E0E10]'
          }`}
        >
          Curated Samples
        </button>

        <button
          onClick={() => setActiveTab('db')}
          className={`nomu-pill px-5 py-2.5 rounded-full text-xs font-bold cursor-pointer ${
            activeTab === 'db'
              ? 'bg-[#0E0E10] text-white shadow-sm'
              : 'text-[#71717A] hover:text-[#0E0E10]'
          }`}
        >
          Cloud Database
        </button>
      </div>

      {/* Main Content Box */}
      <div className="bg-white p-8 sm:p-12 rounded-[36px] border border-black/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#FF7448] animate-spin" />
            <p className="text-sm font-bold text-[#0E0E10]">{loadingMsg}</p>
          </div>
        )}

        {/* 1. Local File Drag & Drop */}
        {activeTab === 'upload' && (
          <div className="text-center">
            <div className="border-2 border-dashed border-black/[0.08] hover:border-[#FF7448] bg-[#FFFDFB] hover:bg-[#FFF8F5] rounded-[28px] p-12 transition-all relative cursor-pointer group">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#FAF4ED] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#FF7448] transition-all">
                  <Upload className="w-6 h-6 text-[#0E0E10] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#0E0E10]">Drop your dataset here</p>
                  <p className="text-xs text-[#71717A] mt-1">Accepts CSV files up to 100MB &bull; Automatic schema mapping</p>
                </div>
                <span className="nomu-pill mt-2 px-6 py-2.5 rounded-full bg-[#0E0E10] text-white text-xs font-bold group-hover:bg-[#FF7448] transition-colors">
                  Choose from computer
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. Google Sheets */}
        {activeTab === 'sheets' && (
          <div className="space-y-6">
            <div className="p-4 bg-[#FAF4ED] rounded-2xl border border-black/[0.04] text-xs text-[#71717A] space-y-1">
              <p className="font-bold text-[#0E0E10]">Google Sheets Live Sync</p>
              <p>Paste the shareable link of any Google Sheet set to <em>"Anyone with the link can view"</em>.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0E0E10] uppercase tracking-wider">
                Google Sheets Link
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  value={sheetsUrl}
                  onChange={e => setSheetsUrl(e.target.value)}
                  className="flex-1 bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-3 text-sm text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={handleGoogleSheetsImport}
                  className="nomu-pill px-6 py-3 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  Import Sheet <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#71717A]">
              <span>Need a sample sheet to test?</span>
              <button
                type="button"
                onClick={() => setSheetsUrl('https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit')}
                className="text-[#FF7448] font-bold hover:underline cursor-pointer"
              >
                Use Sample Retail Sheet
              </button>
            </div>
          </div>
        )}

        {/* 3. Remote URL */}
        {activeTab === 'url' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#0E0E10] uppercase tracking-wider">
                Direct CSV Endpoint
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  placeholder="https://raw.githubusercontent.com/datasets/gdp/master/data/gdp.csv"
                  value={directUrl}
                  onChange={e => setDirectUrl(e.target.value)}
                  className="flex-1 bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-3 text-sm text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={handleDirectUrlImport}
                  className="nomu-pill px-6 py-3 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                >
                  Stream File <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-[#71717A]">Supports any public raw text endpoint or webhook output.</p>
          </div>
        )}

        {/* 4. Curated Samples */}
        {activeTab === 'samples' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SAMPLE_DATASETS.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => loadSample(sample)}
                  className="nomu-card p-5 rounded-2xl bg-[#FAF4ED] hover:bg-white border border-black/[0.04] hover:border-black/[0.1] transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                >
                  <div>
                    <span className="text-[10px] font-bold text-[#0E0E10] bg-white px-2.5 py-1 rounded-full border border-black/[0.06]">
                      {sample.badge}
                    </span>
                    <h5 className="font-bold text-[#0E0E10] text-sm mt-2.5 group-hover:text-[#FF7448] transition-colors leading-snug">
                      {sample.name}
                    </h5>
                    <p className="text-xs text-[#71717A] mt-1 font-normal leading-relaxed line-clamp-2">
                      {sample.description}
                    </p>
                  </div>

                  <div className="flex items-center text-xs font-bold text-[#0E0E10] group-hover:text-[#FF7448] pt-2 border-t border-black/[0.04]">
                    Load Dataset <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Cloud Database */}
        {activeTab === 'db' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block font-bold text-[#0E0E10] mb-1">Host Endpoint</label>
                <input
                  type="text"
                  value={dbHost}
                  onChange={e => setDbHost(e.target.value)}
                  className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-xl px-3 py-2 text-[#0E0E10] text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-[#0E0E10] mb-1">Database</label>
                <input
                  type="text"
                  value={dbName}
                  onChange={e => setDbName(e.target.value)}
                  className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-xl px-3 py-2 text-[#0E0E10] text-xs font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-[#0E0E10] mb-1">Target Table</label>
                <input
                  type="text"
                  value={dbTable}
                  onChange={e => setDbTable(e.target.value)}
                  className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-xl px-3 py-2 text-[#0E0E10] text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0E0E10] text-xs mb-1">Extraction SQL</label>
              <textarea
                rows={2}
                readOnly
                value={`SELECT * FROM "${dbName}"."PUBLIC"."${dbTable}" LIMIT 500;`}
                className="w-full bg-[#0E0E10] text-emerald-400 font-mono text-xs rounded-2xl p-3"
              />
            </div>

            <button
              type="button"
              onClick={handleDbSimulate}
              className="nomu-pill w-full py-3 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" /> Run Query &amp; Ingest Records
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
