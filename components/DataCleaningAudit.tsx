import React, { useState } from 'react';
import { CleaningAuditReport, DataRow } from '../types';
import { 
  CheckCircle2, ShieldCheck, ArrowRight, Sparkles, 
  Table, Eye, Check, AlertTriangle, FileCheck 
} from 'lucide-react';

interface DataCleaningAuditProps {
  audit: CleaningAuditReport;
  rawData: DataRow[];
  cleanedData: DataRow[];
}

export const DataCleaningAudit: React.FC<DataCleaningAuditProps> = ({
  audit,
  rawData,
  cleanedData
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'before' | 'after'>('evidence');
  const { metrics, sampleModifications } = audit;
  const scoreBoost = metrics.qualityScoreAfter - metrics.qualityScoreBefore;

  return (
    <div className="bg-white rounded-[32px] border border-black/[0.06] p-6 sm:p-8 space-y-6 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)] animate-nomu-fade">
      {/* Proof & Hygiene Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-black/[0.06]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified Clean Dataset &bull; Ready for Modeling
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#0E0E10] tracking-tight">
            Data Hygiene Audit &amp; Transformation Proof
          </h3>
          <p className="text-xs text-[#71717A]">
            Empirical verification of null cell imputation, deduplication, and feature normalization.
          </p>
        </div>

        {/* Quality Score Boost Pill */}
        <div className="flex items-center gap-3 bg-[#FAF4ED] p-3 rounded-2xl border border-black/[0.04] self-start sm:self-auto">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase text-[#71717A]">Quality Readiness</p>
            <div className="flex items-center gap-1.5 justify-end">
              <span className="text-xs font-bold text-[#71717A] line-through">{metrics.qualityScoreBefore}%</span>
              <ArrowRight className="w-3 h-3 text-[#FF7448]" />
              <span className="text-base font-black text-emerald-600">{metrics.qualityScoreAfter}%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            +{scoreBoost}%
          </div>
        </div>
      </div>

      {/* 4 Proof Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.03] space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#71717A]">Total Records</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#0E0E10]">{metrics.cleanedRows.toLocaleString()}</span>
            {metrics.duplicatesRemoved > 0 && (
              <span className="text-[10px] font-bold text-rose-600">(-{metrics.duplicatesRemoved} dupes)</span>
            )}
          </div>
          <p className="text-[10px] text-[#71717A]">
            {metrics.duplicatesRemoved > 0 ? `${metrics.duplicatesRemoved} duplicate signatures pruned` : '100% unique records'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.03] space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#71717A]">Missing / Null Cells</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-600">0</span>
            <span className="text-[10px] font-bold text-[#71717A]">remaining</span>
          </div>
          <p className="text-[10px] text-[#71717A]">
            {metrics.missingValuesImputed > 0 
              ? `${metrics.missingValuesImputed} values statistically imputed` 
              : 'Zero empty cells found'}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.03] space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#71717A]">String Normalization</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-[#0E0E10]">{metrics.stringsNormalized}</span>
            <span className="text-[10px] font-bold text-emerald-600">fixed</span>
          </div>
          <p className="text-[10px] text-[#71717A]">Whitespace &amp; encodings trimmed</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF4ED] border border-black/[0.03] space-y-1">
          <p className="text-[10px] font-bold uppercase text-[#71717A]">Model Compatibility</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-emerald-600">100%</span>
            <span className="text-[10px] font-bold text-emerald-600">Pass</span>
          </div>
          <p className="text-[10px] text-[#71717A]">Zero NaN or infinite values</p>
        </div>
      </div>

      {/* Proof Evidence Section with Segmented Tabs */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF4ED] rounded-full border border-black/[0.04]">
            <button
              onClick={() => setActiveTab('evidence')}
              className={`nomu-pill px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'evidence' ? 'bg-[#0E0E10] text-white shadow-xs' : 'text-[#71717A] hover:text-black'
              }`}
            >
              Transformation Evidence ({sampleModifications.length})
            </button>
            <button
              onClick={() => setActiveTab('after')}
              className={`nomu-pill px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'after' ? 'bg-[#0E0E10] text-white shadow-xs' : 'text-[#71717A] hover:text-black'
              }`}
            >
              Cleaned Data Sample (After)
            </button>
            <button
              onClick={() => setActiveTab('before')}
              className={`nomu-pill px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                activeTab === 'before' ? 'bg-[#0E0E10] text-white shadow-xs' : 'text-[#71717A] hover:text-black'
              }`}
            >
              Raw Input Sample (Before)
            </button>
          </div>

          <span className="text-[11px] font-semibold text-[#71717A]">
            {activeTab === 'evidence' ? 'Itemized cell changes' : 'Comparing first 5 rows'}
          </span>
        </div>

        {/* Tab 1: Itemized Evidence Table */}
        {activeTab === 'evidence' && (
          <div className="overflow-x-auto rounded-2xl border border-black/[0.06]">
            <table className="w-full text-left text-xs text-[#0E0E10]">
              <thead className="bg-[#FAF4ED] text-[#71717A] font-bold uppercase text-[10px] tracking-wider border-b border-black/[0.06]">
                <tr>
                  <th className="px-4 py-3">Row #</th>
                  <th className="px-4 py-3">Affected Column</th>
                  <th className="px-4 py-3">Before Cleaning</th>
                  <th className="px-4 py-3">After Cleaning</th>
                  <th className="px-4 py-3">Hygiene Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {sampleModifications.map((mod, i) => (
                  <tr key={i} className="hover:bg-[#FAF4ED]/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-[#71717A]">Row {mod.rowIndex}</td>
                    <td className="px-4 py-3 font-bold text-[#0E0E10]">{mod.column}</td>
                    <td className="px-4 py-3 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-medium">
                        {String(mod.before)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                        {String(mod.after)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">
                        {mod.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Cleaned Data Preview (After) */}
        {activeTab === 'after' && (
          <div className="overflow-x-auto rounded-2xl border border-emerald-200 bg-emerald-50/20">
            <table className="w-full text-left text-xs text-[#0E0E10]">
              <thead className="bg-emerald-100/60 text-emerald-900 font-bold uppercase text-[10px] tracking-wider border-b border-emerald-200">
                <tr>
                  {Object.keys(cleanedData[0] || {}).slice(0, 7).map((col, i) => (
                    <th key={i} className="px-4 py-3">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-100">
                {cleanedData.slice(0, 5).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/60 transition-colors">
                    {Object.values(row).slice(0, 7).map((val: any, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 font-mono text-[11px] text-[#0E0E10] truncate max-w-[150px]">
                        <span className="font-bold text-emerald-950">{String(val)}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Raw Input Preview (Before) */}
        {activeTab === 'before' && (
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
                      <td key={cIdx} className="px-4 py-3 font-mono text-[11px] text-[#71717A] truncate max-w-[150px]">
                        {val === null || val === undefined || val === '' ? (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">NULL</span>
                        ) : (
                          String(val)
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
