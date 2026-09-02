import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { DataRow } from '../types';
import { 
  Upload, FileSpreadsheet, Globe, Database, Sparkles, 
  ArrowRight, CheckCircle2, AlertCircle, Loader2, ArrowUpRight,
  FileCode, ClipboardPaste, Code2, Layers, Key
} from 'lucide-react';

interface DataSourceHubProps {
  onDataLoaded: (data: DataRow[], sourceName: string) => void;
  onError: (error: string) => void;
}

/**
 * Universal JSON Parser: handles arrays of objects or nested root wrappers like { data: [...] }
 */
export const parseJSONData = (rawTextOrObj: string | any): DataRow[] => {
  let parsed = typeof rawTextOrObj === 'string' ? JSON.parse(rawTextOrObj) : rawTextOrObj;

  // If root is an object with an array property like { data: [...] }, { items: [...] }, { results: [...] }
  if (!Array.isArray(parsed) && parsed && typeof parsed === 'object') {
    const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
    if (arrayKey && Array.isArray(parsed[arrayKey])) {
      parsed = parsed[arrayKey];
    } else {
      parsed = [parsed];
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("JSON must contain an array of data records.");
  }

  // Shallow flatten 1-level nested objects (e.g. { user: { name: "Alice" } } -> { user_name: "Alice" })
  return parsed.map((item: any) => {
    if (typeof item !== 'object' || item === null) {
      return { value: item };
    }
    const flat: any = {};
    for (const key of Object.keys(item)) {
      const val = item[key];
      if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
        for (const subKey of Object.keys(val)) {
          flat[`${key}_${subKey}`] = val[subKey];
        }
      } else {
        flat[key] = val;
      }
    }
    return flat;
  });
};

/**
 * Robust CSV / TSV / Delimited Text Parser
 */
export const parseDelimitedText = (text: string): DataRow[] => {
  const trimmed = text.trim();
  // If it's JSON text, delegate to JSON parser
  if (trimmed.startsWith('[') || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    return parseJSONData(trimmed);
  }

  const rows = trimmed.split(/\r?\n/).filter(r => r.trim());
  if (rows.length < 2) throw new Error("Dataset is empty or missing headers.");

  // Detect delimiter (Tab \t vs Comma , vs Semicolon ;)
  const firstLine = rows[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  const parseLine = (line: string): string[] => {
    if (delimiter === '\t') return line.split('\t');
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
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

export const parseCSVText = parseDelimitedText;

/**
 * Excel (.xlsx, .xls) Parser using SheetJS
 */
export const parseExcelFile = async (file: File): Promise<DataRow[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("Excel spreadsheet contains no readable sheets.");
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json<DataRow>(sheet, { defval: '' });
  if (jsonData.length === 0) throw new Error("Excel sheet contains no data rows.");
  return jsonData;
};

const SAMPLE_DATASETS = [
  {
    id: 'retail_sales',
    name: 'Diwali & Holiday Retail Transactions',
    badge: '11,251 Rows',
    format: 'CSV / Tabular',
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
    format: 'JSON / Schema',
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
    id: 'healthcare_telemetry',
    name: 'Healthcare & Clinical Service Quality',
    badge: '180 Records',
    format: 'Excel / Tabular',
    description: 'Clinical operational telemetry with Department, Patient_Wait_Minutes, Satisfaction_Score, and Cost.',
    generator: () => {
      const departments = ['Emergency Care', 'Cardiology', 'Pediatrics', 'Radiology', 'General Surgery'];
      const insurances = ['Blue Cross', 'Medicare', 'Aetna', 'UnitedHealthcare', 'Private Cash'];
      const rows: DataRow[] = [];
      for (let i = 1; i <= 180; i++) {
        const dept = departments[Math.floor(Math.random() * departments.length)];
        const ins = insurances[Math.floor(Math.random() * insurances.length)];
        const wait = Math.floor(Math.random() * 65) + 10;
        const cost = Math.floor(Math.random() * 4500) + 350;
        const sat = (Math.random() * 2.5 + 2.5).toFixed(1);
        rows.push({
          Patient_ID: `PT-${5000 + i}`,
          Department: dept,
          Insurance_Provider: ins,
          Wait_Time_Mins: wait,
          Procedure_Cost: cost,
          Satisfaction_Rating: Number(sat)
        });
      }
      return rows;
    }
  },
  {
    id: 'customer_sentiment',
    name: 'Customer Experience & NPS Reviews',
    badge: '150 Reviews',
    format: 'Unstructured Text',
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
  const [activeTab, setActiveTab] = useState<'upload' | 'api' | 'paste' | 'samples' | 'db'>('upload');
  
  // API / URL state
  const [endpointUrl, setEndpointUrl] = useState('');
  const [apiAuthToken, setApiAuthToken] = useState('');
  
  // Raw Paste state
  const [pastedData, setPastedData] = useState('');

  // Database Simulator State
  const [dbType, setDbType] = useState<'snowflake' | 'postgres' | 'bigquery'>('snowflake');
  const [dbHost, setDbHost] = useState('enterprise-dw.snowflakecomputing.com');
  const [dbName, setDbName] = useState('ANALYTICS_PROD');
  const [dbTable, setDbTable] = useState('FACT_REVENUE_TRANSACTIONS');

  // Loading state
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  // Handle Multi-Format File Upload (.csv, .xlsx, .xls, .json, .tsv, .txt)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    setLoading(true);

    try {
      if (ext === 'xlsx' || ext === 'xls') {
        setLoadingMsg(`Parsing Excel workbook (${file.name})...`);
        const rows = await parseExcelFile(file);
        onDataLoaded(rows, file.name);
      } else if (ext === 'json') {
        setLoadingMsg(`Parsing JSON records (${file.name})...`);
        const text = await file.text();
        const rows = parseJSONData(text);
        onDataLoaded(rows, file.name);
      } else {
        // CSV, TSV, TXT
        setLoadingMsg(`Parsing delimited dataset (${file.name})...`);
        const text = await file.text();
        const rows = parseDelimitedText(text);
        onDataLoaded(rows, file.name);
      }
    } catch (err: any) {
      onError(err.message || 'Failed to parse file. Please verify schema.');
    } finally {
      setLoading(false);
    }
  };

  // Handle URL / Google Sheets / REST API Fetch
  const handleEndpointFetch = async () => {
    const url = endpointUrl.trim();
    if (!url) {
      onError('Please provide a valid URL or API endpoint.');
      return;
    }

    setLoading(true);
    setLoadingMsg('Connecting to remote stream...');

    try {
      let targetUrl = url;
      // If it's a Google Sheets link
      const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (sheetMatch && sheetMatch[1]) {
        targetUrl = `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=csv`;
      }

      const headers: Record<string, string> = {};
      if (apiAuthToken.trim()) {
        headers['Authorization'] = `Bearer ${apiAuthToken.trim()}`;
      }

      const res = await fetch(targetUrl, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to retrieve data from remote endpoint.`);

      const contentType = res.headers.get('content-type') || '';
      const text = await res.text();

      let parsed: DataRow[];
      if (contentType.includes('application/json') || targetUrl.endsWith('.json')) {
        parsed = parseJSONData(text);
      } else {
        parsed = parseDelimitedText(text);
      }

      const sourceLabel = sheetMatch ? 'Google Sheets Live Sync' : 'REST API Stream';
      onDataLoaded(parsed, sourceLabel);
    } catch (err: any) {
      onError(err.message || 'Failed to fetch remote data. Check CORS policy and URL permissions.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Direct Paste (Ctrl+V from Excel, Google Sheets, or JSON)
  const handleDirectPaste = () => {
    if (!pastedData.trim()) {
      onError('Please paste text or table rows first.');
      return;
    }

    setLoading(true);
    setLoadingMsg('Parsing clipboard data...');
    try {
      const rows = parseDelimitedText(pastedData);
      onDataLoaded(rows, 'Clipboard Ingestion');
    } catch (err: any) {
      onError(err.message || 'Failed to parse clipboard data. Verify format is TSV, CSV, or JSON.');
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
        onError('Failed to generate sample dataset.');
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleDbSimulate = () => {
    setLoading(true);
    setLoadingMsg(`Executing query on ${dbType.toUpperCase()} (${dbName}.${dbTable})...`);
    setTimeout(() => {
      const rows = SAMPLE_DATASETS[0].generator();
      onDataLoaded(rows, `${dbType.toUpperCase()}: ${dbName}.${dbTable}`);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-[36px] border border-black/[0.06] shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-6 sm:p-10 space-y-8 animate-nomu-fade">
      {/* Tab Selector Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-[#FAF4ED] rounded-full max-w-2xl mx-auto border border-black/[0.04]">
        <button
          onClick={() => setActiveTab('upload')}
          className={`nomu-pill px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'upload' 
              ? 'bg-[#0E0E10] text-white shadow-xs' 
              : 'text-[#71717A] hover:text-[#0E0E10]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File</span>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`nomu-pill px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'api' 
              ? 'bg-[#0E0E10] text-white shadow-xs' 
              : 'text-[#71717A] hover:text-[#0E0E10]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Google Sheets &amp; API</span>
        </button>

        <button
          onClick={() => setActiveTab('paste')}
          className={`nomu-pill px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'paste' 
              ? 'bg-[#0E0E10] text-white shadow-xs' 
              : 'text-[#71717A] hover:text-[#0E0E10]'
          }`}
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          <span>Direct Paste</span>
        </button>

        <button
          onClick={() => setActiveTab('db')}
          className={`nomu-pill px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'db' 
              ? 'bg-[#0E0E10] text-white shadow-xs' 
              : 'text-[#71717A] hover:text-[#0E0E10]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>SQL &amp; Database</span>
        </button>

        <button
          onClick={() => setActiveTab('samples')}
          className={`nomu-pill px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'samples' 
              ? 'bg-[#0E0E10] text-white shadow-xs' 
              : 'text-[#71717A] hover:text-[#0E0E10]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#FF7448]" />
          <span>Curated Samples</span>
        </button>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#FF7448] animate-spin" />
          <p className="text-xs font-bold text-[#0E0E10]">{loadingMsg}</p>
        </div>
      )}

      {/* TAB 1: Universal File Upload (CSV, Excel .xlsx/.xls, JSON, TSV) */}
      {!loading && activeTab === 'upload' && (
        <div className="space-y-6 animate-nomu-fade">
          <div className="text-center space-y-1">
            <h4 className="text-lg font-black text-[#0E0E10] tracking-tight">
              Universal Spreadsheet &amp; File Ingestion
            </h4>
            <p className="text-xs text-[#71717A]">
              Drop files from your local system. Automatically parses tables, types, and nested fields.
            </p>
          </div>

          <label className="border-2 border-dashed border-black/10 hover:border-[#FF7448] rounded-[32px] p-8 sm:p-12 flex flex-col items-center justify-center gap-4 bg-[#FAF4ED]/50 hover:bg-[#FFF0EB]/30 transition-all cursor-pointer group">
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls, .json, .tsv, .txt" 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <div className="w-16 h-16 rounded-full bg-white group-hover:bg-[#FF7448] group-hover:text-white text-[#FF7448] flex items-center justify-center shadow-sm transition-all">
              <Upload className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-bold text-[#0E0E10] group-hover:text-[#FF7448] transition-colors">
                Click to browse or drop files here
              </p>
              <p className="text-[11px] text-[#71717A]">
                Supports files up to 50MB with instant heuristic parsing
              </p>
            </div>

            {/* Supported format badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-[#0E0E10] border border-black/[0.06] shadow-2xs">
                📊 CSV (.csv)
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                📗 Excel (.xlsx / .xls)
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-amber-800 border border-amber-200 shadow-2xs">
                ⚡ JSON (.json)
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-white text-indigo-800 border border-indigo-200 shadow-2xs">
                📑 TSV / Delimited (.tsv, .txt)
              </span>
            </div>
          </label>
        </div>
      )}

      {/* TAB 2: Google Sheets & REST API URL */}
      {!loading && activeTab === 'api' && (
        <div className="space-y-6 max-w-2xl mx-auto animate-nomu-fade">
          <div className="text-center space-y-1">
            <h4 className="text-lg font-black text-[#0E0E10] tracking-tight">
              Live Google Sheets &amp; REST API Endpoints
            </h4>
            <p className="text-xs text-[#71717A]">
              Connect live spreadsheets or authenticated cloud webhook endpoints.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#0E0E10] uppercase tracking-wider mb-1.5">
                Endpoint or Public Google Sheet URL
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/spreadsheets/d/... or https://api.mycorp.com/v1/orders"
                value={endpointUrl}
                onChange={e => setEndpointUrl(e.target.value)}
                className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-3 text-xs text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#71717A] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Key className="w-3 h-3 text-[#FF7448]" /> Optional Authorization Bearer Token (for private APIs)
              </label>
              <input
                type="password"
                placeholder="Bearer eyJhbGciOi..."
                value={apiAuthToken}
                onChange={e => setApiAuthToken(e.target.value)}
                className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl px-4 py-3 text-xs text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all font-mono"
              />
            </div>

            <button
              onClick={handleEndpointFetch}
              className="nomu-pill w-full py-3.5 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Connect &amp; Stream Dataset</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: Direct Clipboard Paste (Excel / Sheets / JSON) */}
      {!loading && activeTab === 'paste' && (
        <div className="space-y-6 max-w-2xl mx-auto animate-nomu-fade">
          <div className="text-center space-y-1">
            <h4 className="text-lg font-black text-[#0E0E10] tracking-tight">
              Direct Copy &amp; Paste
            </h4>
            <p className="text-xs text-[#71717A]">
              Copy cells from Excel or Google Sheets (Ctrl+C), or paste raw JSON, and drop it here (Ctrl+V).
            </p>
          </div>

          <div className="space-y-3">
            <textarea
              rows={8}
              placeholder={`Paste tabular rows from Excel (tab-separated), CSV, or JSON array:\n\nDate\tProduct\tSales\tProfit\n2024-01-01\tWidget A\t1250\t450\n2024-01-02\tWidget B\t2100\t890`}
              value={pastedData}
              onChange={e => setPastedData(e.target.value)}
              className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-2xl p-4 text-xs font-mono text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:border-[#0E0E10] focus:bg-white transition-all"
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setPastedData(`[\n  {"category": "Apparel", "units": 140, "revenue": 14500},\n  {"category": "Electronics", "units": 85, "revenue": 28900},\n  {"category": "Home Goods", "units": 62, "revenue": 9400}\n]`);
                }}
                className="text-[11px] font-bold text-[#FF7448] hover:underline cursor-pointer"
              >
                Insert Sample JSON Template
              </button>

              <button
                onClick={handleDirectPaste}
                className="nomu-pill px-6 py-2.5 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <span>Parse &amp; Ingest Clipboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SQL & Enterprise Database */}
      {!loading && activeTab === 'db' && (
        <div className="space-y-6 max-w-2xl mx-auto animate-nomu-fade">
          <div className="text-center space-y-1">
            <h4 className="text-lg font-black text-[#0E0E10] tracking-tight">
              Enterprise Data Warehouse &amp; SQL Query
            </h4>
            <p className="text-xs text-[#71717A]">
              Execute direct analytical queries against your cloud warehouse.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(['snowflake', 'postgres', 'bigquery'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setDbType(type)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                    dbType === type 
                      ? 'bg-[#0E0E10] text-white border-black shadow-xs' 
                      : 'bg-[#FAF4ED] text-[#71717A] border-black/[0.04] hover:text-black'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-wider mb-1">Database / Schema</label>
                <input
                  type="text"
                  value={dbName}
                  onChange={e => setDbName(e.target.value)}
                  className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#71717A] uppercase tracking-wider mb-1">Target Table</label>
                <input
                  type="text"
                  value={dbTable}
                  onChange={e => setDbTable(e.target.value)}
                  className="w-full bg-[#FAF4ED] border border-black/[0.06] rounded-xl px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.04] font-mono text-[11px] text-[#0E0E10] space-y-1">
              <p className="text-[#71717A] text-[10px] uppercase font-bold">SQL Query Preview:</p>
              <p className="text-[#FF7448]">SELECT * FROM {dbName}.{dbTable}</p>
              <p className="text-[#71717A]">WHERE transaction_date &gt;= CURRENT_DATE - 90 LIMIT 5000;</p>
            </div>

            <button
              onClick={handleDbSimulate}
              className="nomu-pill w-full py-3.5 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Execute SQL Query &amp; Ingest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Curated Corporate Samples */}
      {!loading && activeTab === 'samples' && (
        <div className="space-y-6 animate-nomu-fade">
          <div className="text-center space-y-1">
            <h4 className="text-lg font-black text-[#0E0E10] tracking-tight">
              One-Click Enterprise Benchmarks
            </h4>
            <p className="text-xs text-[#71717A]">
              Test the engine immediately with pre-loaded, multi-industry corporate datasets.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SAMPLE_DATASETS.map((sample) => (
              <div
                key={sample.id}
                onClick={() => loadSample(sample)}
                className="nomu-card p-6 rounded-[28px] border border-black/[0.06] bg-[#FAF4ED]/60 hover:bg-white hover:border-[#FF7448]/30 transition-all cursor-pointer flex flex-col justify-between space-y-4 group shadow-xs hover:shadow-md"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-bold bg-white text-[#0E0E10] border border-black/[0.06]">
                      {sample.badge}
                    </span>
                    <span className="text-[10px] font-bold text-[#FF7448] uppercase tracking-wider">
                      {sample.format}
                    </span>
                  </div>
                  <h5 className="text-base font-bold text-[#0E0E10] group-hover:text-[#FF7448] transition-colors">
                    {sample.name}
                  </h5>
                  <p className="text-xs text-[#71717A] leading-relaxed">
                    {sample.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/[0.04] flex items-center justify-between text-xs font-bold text-[#0E0E10] group-hover:text-[#FF7448]">
                  <span>Load Benchmark</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
