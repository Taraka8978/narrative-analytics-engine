import React, { useState } from 'react';
import { AnalysisLogEntry } from '../types';
import { 
  Clock, FileText, ArrowRight, Trash2, X, Search, 
  Sparkles, CheckCircle2, AlertCircle, Database, ChevronRight 
} from 'lucide-react';

interface AnalysisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AnalysisLogEntry[];
  onSelectLog: (log: AnalysisLogEntry) => void;
  onDeleteLog: (id: string) => void;
  onClearAll: () => void;
  userName: string;
}

export const AnalysisHistoryModal: React.FC<AnalysisHistoryModalProps> = ({
  isOpen,
  onClose,
  logs,
  onSelectLog,
  onDeleteLog,
  onClearAll,
  userName
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.datasetName.toLowerCase().includes(q) ||
      (log.metricName && log.metricName.toLowerCase().includes(q)) ||
      log.summaryPreview.toLowerCase().includes(q)
    );
  });

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-nomu-fade">
      <div className="bg-white w-full max-w-2xl rounded-[36px] border border-black/[0.08] shadow-[0_24px_60px_-15px_rgba(0,0,0,0.2)] p-6 sm:p-8 flex flex-col max-h-[85vh] relative">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-black/[0.06]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#FF7448] uppercase tracking-wider mb-1">
              <Clock className="w-3 h-3" /> Audit Trail &amp; Analysis History
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-[#0E0E10] tracking-tight">
              Reports Logged for {userName}
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5">
              Review, restore, or export past 4-tier decision intelligence runs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FAF4ED] hover:bg-black hover:text-white text-[#0E0E10] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="py-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by name or metric..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF4ED] rounded-full pl-9 pr-4 py-2 text-xs text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#0E0E10]"
            />
          </div>

          {logs.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all analysis history for your profile?')) {
                  onClearAll();
                }
              }}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" /> Clear All History
            </button>
          )}
        </div>

        {/* Log Entries List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF4ED] flex items-center justify-center mx-auto text-[#71717A]">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#0E0E10]">No reports logged yet</p>
                <p className="text-xs text-[#71717A] max-w-xs mx-auto mt-1">
                  Upload a dataset and click "Generate Insights" to automatically record your first executive analysis run.
                </p>
              </div>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="nomu-card p-5 rounded-[24px] bg-[#FAF4ED] hover:bg-white border border-black/[0.04] hover:border-black/[0.1] transition-all space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0E0E10] group-hover:text-[#FF7448] transition-colors">
                        {log.datasetName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-black/[0.06] text-[#71717A]">
                        {log.rowCount.toLocaleString()} rows
                      </span>
                    </div>
                    <p className="text-[10px] text-[#71717A] mt-0.5">
                      {formatDate(log.timestamp)} &bull; Metric: <strong>{log.metricName || 'Value'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectLog(log)}
                      className="nomu-pill px-3.5 py-1.5 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                    >
                      Restore <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      className="w-7 h-7 rounded-full bg-white hover:bg-rose-50 text-[#71717A] hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer border border-black/[0.04]"
                      title="Delete log entry"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">
                  {log.summaryPreview}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-black/[0.04] text-[10px] text-[#71717A]">
                  <span>Ingestion Score: <strong>{log.qualityScore}/100</strong></span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 4-Tier Pipeline Verified
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between text-xs text-[#71717A]">
          <span>Saved locally for your profile</span>
          <span className="font-bold text-[#0E0E10]">{logs.length} total logged sessions</span>
        </div>
      </div>
    </div>
  );
};
