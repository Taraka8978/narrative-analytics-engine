import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, PieChart, Pie, LabelList
} from 'recharts';
import { AnalysisSummary, DataRow } from '../types';
import { 
  TrendingUp, Activity, BarChart2, Lightbulb, 
  ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight,
  Layout as LayoutIcon, Maximize2, Download,
  FileText, SlidersHorizontal, Search, RotateCcw, Loader2, Check
} from 'lucide-react';
import { exportDashboardToPDF } from '../services/pdfExportService';

interface DashboardProps {
  analysis: AnalysisSummary;
  onReset: () => void;
  data: DataRow[];
}

// Nomu-inspired warm editorial palette
const COLORS = ['#FF7448', '#0E0E10', '#10B981', '#F59E0B', '#6366F1', '#EC4899'];

export const Dashboard: React.FC<DashboardProps> = ({ analysis, onReset, data }) => {
  const [activePlan, setActivePlan] = React.useState<{ action: string; plan?: string[] } | null>(null);
  const [selectedElement, setSelectedElement] = React.useState<{
    chartName: string;
    label: string;
    value: number;
    percent?: number;
  } | null>(null);
  const [checkedSteps, setCheckedSteps] = React.useState<Record<string, Record<number, boolean>>>({});
  const [selectedCategory, setSelectedCategory] = React.useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = React.useState<string>('');
  const [isExportingPDF, setIsExportingPDF] = React.useState<boolean>(false);

  const dimCol = analysis.metadata?.dimension_name;
  const metricCol = analysis.metadata?.metric_name;
  const secDimCol = analysis.metadata?.sec_dimension_name || dimCol;

  // Extract unique categories for slicer dropdown
  const availableCategories = React.useMemo(() => {
    if (!dimCol || !data || data.length === 0) return [];
    const set = new Set<string>();
    data.forEach(row => {
      if (row[dimCol] !== undefined && row[dimCol] !== null && String(row[dimCol]).trim()) {
        set.add(String(row[dimCol]).trim());
      }
    });
    return Array.from(set).slice(0, 30);
  }, [data, dimCol]);

  // Sliced subset
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.filter(row => {
      if (selectedCategory !== 'ALL' && dimCol && String(row[dimCol]).trim() !== selectedCategory) {
        return false;
      }
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const match = Object.values(row).some(val => String(val).toLowerCase().includes(kw));
        if (!match) return false;
      }
      return true;
    });
  }, [data, dimCol, selectedCategory, searchKeyword]);

  const isFiltered = (selectedCategory !== 'ALL' || searchKeyword.trim().length > 0) && data && data.length > 0;

  // Dynamic BI overview recalculation based on active slicers
  const activeOverview = React.useMemo(() => {
    if (!isFiltered || !metricCol || !dimCol) {
      return analysis.biOverview;
    }
    const compMap: Record<string, number> = {};
    const distMap: Record<string, number> = {};
    filteredData.forEach(row => {
      const mVal = Number(row[metricCol]) || 1;
      const dVal = String(row[dimCol] ?? 'Other');
      compMap[dVal] = (compMap[dVal] || 0) + mVal;
      if (secDimCol) {
        const sVal = String(row[secDimCol] ?? 'Other');
        distMap[sVal] = (distMap[sVal] || 0) + mVal;
      }
    });
    const sortedComp = Object.entries(compMap)
      .map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
    const sortedDist = Object.entries(distMap)
      .map(([category, value]) => ({ category, value: Math.round(value * 100) / 100 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    return {
      composition: sortedComp.length > 0 ? sortedComp : analysis.biOverview.composition,
      trend: analysis.biOverview.trend,
      distribution: sortedDist.length > 0 ? sortedDist : analysis.biOverview.distribution
    };
  }, [isFiltered, filteredData, metricCol, dimCol, secDimCol, analysis.biOverview]);

  // Dynamic KPIs reflecting the active slice
  const activeKPIs = React.useMemo(() => {
    if (!isFiltered || !metricCol) {
      return analysis.descriptive.kpis;
    }
    const totalMetric = filteredData.reduce((acc, r) => acc + (Number(r[metricCol]) || 0), 0);
    const avgMetric = filteredData.length > 0 ? totalMetric / filteredData.length : 0;
    return [
      {
        label: 'Filtered Records',
        value: `${filteredData.length.toLocaleString()}`,
        change: `${((filteredData.length / data.length) * 100).toFixed(1)}% of total`,
        trend: 'up' as const
      },
      {
        label: `Filtered Total ${metricCol}`,
        value: totalMetric > 1000 ? `$${totalMetric.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : totalMetric.toFixed(1),
        change: 'Active Subset',
        trend: 'up' as const
      },
      {
        label: `Filtered Avg ${metricCol}`,
        value: avgMetric.toFixed(1),
        change: 'Per Item',
        trend: 'up' as const
      },
      {
        label: 'Active Slicer',
        value: selectedCategory !== 'ALL' ? selectedCategory.slice(0, 14) : `"${searchKeyword.slice(0, 10)}"`,
        change: 'Live Filter',
        trend: 'up' as const
      }
    ];
  }, [isFiltered, filteredData, data, metricCol, selectedCategory, searchKeyword, analysis.descriptive.kpis]);

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportDashboardToPDF('executive-dashboard-canvas', {
        title: 'NARRATIVE ANALYTICS ENGINE — EXECUTIVE REPORT',
        company: 'Executive BI Platform'
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const getPlanSteps = (action: string, backendPlan?: string[]) => {
    if (backendPlan && backendPlan.length > 0) return backendPlan;
    const actionLower = action.toLowerCase();
    const metricLabel = analysis.metadata?.metric_name ?? "Value";
    const dimLabel = analysis.metadata?.dimension_name ?? "Category";

    if (actionLower.includes("feedback") || actionLower.includes("messaging") || actionLower.includes("sentiment")) {
      return [
        "Extract top negative keywords from the diagnostic run.",
        "Create a dedicated customer care ticket queue for negative reviewers.",
        "Reach out to dissatisfied users within 24 hours.",
        "Audit product defects mentioned in comments weekly."
      ];
    } else if (actionLower.includes("correlat") || actionLower.includes("relationships") || actionLower.includes("feature")) {
      return [
        `Review Pearson correlation coefficients monthly for ${metricLabel}.`,
        `Bundle product categories that show positive covariance with ${metricLabel}.`,
        `Adjust seasonal pricing structures based on correlation weights.`,
        `Train local regression models to predict changes in ${metricLabel}.`
      ];
    } else if (actionLower.includes("monitor") || actionLower.includes("alert") || actionLower.includes("dashboard")) {
      return [
        `Hook up automated database sync triggers for ${metricLabel} updates.`,
        "Establish owner metrics checklists for weekly review.",
        "Configure email notifications for key volume shifts.",
        "Execute monthly retraining script for predictive models."
      ];
    } else {
      return [
        `Review budget spend on the top-performing ${dimLabel} category.`,
        "Optimize regional logistics routes to cut overhead.",
        "Launch focused promotional campaigns targeting core users.",
        "Draft monthly sales velocity targets."
      ];
    }
  };

  const handleAcknowledge = () => {
    if (activePlan) {
      const steps = getPlanSteps(activePlan.action, activePlan.plan);
      const updatedChecked: Record<number, boolean> = {};
      steps.forEach((_, idx) => {
        updatedChecked[idx] = true;
      });
      setCheckedSteps(prev => ({
        ...prev,
        [activePlan.action]: updatedChecked
      }));
      setActivePlan(null);
    }
  };

  const handleChartClick = (chartName: string, label: string, value: number, dataArray: any[]) => {
    const total = dataArray.reduce((acc: number, item: any) => acc + (item.value || item.count || 0), 0);
    const percent = total > 0 ? (value / total) * 100 : 0;
    setSelectedElement({
      chartName,
      label,
      value,
      percent
    });
  };

  const downloadCleanedCSV = () => {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "narrative_cleaned_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-10 h-10 rounded-2xl bg-[#FAF4ED] flex items-center justify-center text-[#0E0E10]">
        <Icon className="w-5 h-5 text-[#FF7448]" />
      </div>
      <div>
        <h3 className="text-xl sm:text-2xl font-black text-[#0E0E10] tracking-tight">{title}</h3>
        <p className="text-[#71717A] text-xs font-normal mt-0.5">{subtitle}</p>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0E0E10] text-white p-3.5 rounded-2xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-[#FF7448]">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-medium">
              {entry.name}: <span className="font-bold text-white">{typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 8} 
        fill="#0E0E10" 
        textAnchor="middle" 
        className="text-[10px] font-bold"
      >
        {typeof value === 'number' ? value.toFixed(0) : value}
      </text>
    );
  };

  return (
    <div id="executive-dashboard-canvas" className="space-y-8 animate-nomu-fade bg-[#FFF9F6]">
      {/* BI Command Center Header (Nomu Floating Bar) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-[32px] border border-black/[0.06] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.06)]">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#FF7448] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF7448]" /> Executive Intelligence Canvas
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0E0E10] tracking-tight">
            narrative<span className="text-[#FF7448]">.</span> decision report
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="nomu-pill px-5 py-2.5 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Download Executive PDF"
          >
            {isExportingPDF ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-[#FF7448]" />}
            <span>{isExportingPDF ? 'Generating...' : 'Export PDF'}</span>
          </button>

          <button 
            onClick={downloadCleanedCSV}
            className="nomu-pill px-5 py-2.5 rounded-full bg-white hover:bg-[#FAF4ED] text-[#0E0E10] border border-black/[0.08] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> <span>Export CSV</span>
          </button>

          <button 
            onClick={onReset} 
            className="nomu-pill px-5 py-2.5 rounded-full bg-[#FAF4ED] hover:bg-[#0E0E10] hover:text-white text-[#0E0E10] text-xs font-bold transition-all cursor-pointer"
          >
            New Analysis
          </button>
        </div>
      </div>

      {/* Interactive Slicer Strip */}
      <div className="bg-white p-5 rounded-[28px] border border-black/[0.06] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0E0E10] uppercase tracking-wider">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF7448]" /> Slicers:
            </div>

            {/* Category Slicer */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-[#FAF4ED] rounded-full px-4 py-2 text-xs font-bold text-[#0E0E10] focus:outline-none focus:ring-1 focus:ring-[#0E0E10] cursor-pointer border-none"
                >
                  <option value="ALL">All {dimCol}s ({availableCategories.length})</option>
                  {availableCategories.map((cat, i) => (
                    <option key={i} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Keyword Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search values..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="bg-[#FAF4ED] rounded-full pl-9 pr-4 py-2 text-xs text-[#0E0E10] placeholder-[#A1A1AA] focus:outline-none focus:ring-1 focus:ring-[#0E0E10] w-44 sm:w-56"
              />
            </div>

            {/* Reset */}
            {isFiltered && (
              <button
                onClick={() => {
                  setSelectedCategory('ALL');
                  setSearchKeyword('');
                }}
                className="nomu-pill flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isFiltered ? (
              <span className="px-3.5 py-1.5 bg-[#FFF0EB] border border-[#FFD5C7] text-[#FF7448] font-bold rounded-full text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF7448] animate-ping" />
                Active Slice: {filteredData.length.toLocaleString()} of {data.length.toLocaleString()} ({((filteredData.length / data.length) * 100).toFixed(1)}%)
              </span>
            ) : (
              <span className="text-xs text-[#71717A]">
                Showing full volume ({data.length.toLocaleString()} rows)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Metric Tiles Tier (Nomu Tactile Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {activeKPIs.map((kpi, idx) => (
          <div key={idx} className="nomu-card bg-white p-6 rounded-[28px] border border-black/[0.06] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)] space-y-3">
            <p className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-black text-[#0E0E10] tracking-tight">{kpi.value}</span>
                {kpi.change && (
                  <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-2 ml-2 ${
                    kpi.trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {kpi.trend === 'up' && <ArrowUpRight className="w-3 h-3 mr-0.5" />}
                    {kpi.change}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inspector Details Card */}
      {selectedElement && (
        <div className="bg-white p-6 rounded-[28px] border border-black/[0.08] shadow-lg animate-nomu-fade flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#FF7448] uppercase tracking-wider">Inspect Element</span>
            <h4 className="text-base font-bold text-[#0E0E10]">
              Selected: <span className="text-[#FF7448]">"{selectedElement.label}"</span> ({selectedElement.chartName})
            </h4>
            <p className="text-xs text-[#71717A] mt-0.5">
              Value: <strong>{selectedElement.value.toLocaleString()}</strong> 
              {selectedElement.percent !== undefined && ` (${selectedElement.percent.toFixed(1)}% of chart total)`}
            </p>
          </div>
          <button 
            onClick={() => setSelectedElement(null)}
            className="nomu-pill px-4 py-2 rounded-full text-xs font-bold text-[#71717A] hover:text-black bg-[#FAF4ED] cursor-pointer"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {(() => {
          const isTabular = analysis.metadata?.dataset_type === 'structured_tabular';
          const metricLabel = analysis.metadata?.metric_name ?? "Value";
          const dimLabel = analysis.metadata?.dimension_name ?? "Category";
          const secDimLabel = analysis.metadata?.sec_dimension_name ?? "Categories";

          return (
            <>
              {/* Trend Chart */}
              <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-[32px] border border-black/[0.06] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-[#0E0E10] uppercase tracking-wider">
                      {isTabular ? `${metricLabel} Trend by ${dimLabel}` : "Performance Trajectory"}
                    </h4>
                    <p className="text-xs text-[#71717A]">Click points to inspect attributes</p>
                  </div>
                </div>

                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={activeOverview.trend}
                      onClick={(state) => {
                        if (state && state.activePayload && state.activePayload.length) {
                          const p = state.activePayload[0].payload;
                          handleChartClick(isTabular ? `${metricLabel} Trend by ${dimLabel}` : "Performance Trajectory", p.name, p.value, activeOverview.trend);
                        }
                      }}
                    >
                      <defs>
                        <linearGradient id="colorNomu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF7448" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#FFF9F6" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAF4ED" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#71717A', fontSize: 11, fontWeight: 600}} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#71717A', fontSize: 11, fontWeight: 600}}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#FF7448" 
                        fillOpacity={1} 
                        fill="url(#colorNomu)" 
                        strokeWidth={2.5}
                        className="cursor-pointer"
                      >
                        <LabelList dataKey="value" position="top" style={{ fill: '#0E0E10', fontSize: 10, fontWeight: 700 }} formatter={(value: number) => value.toFixed(0)} />
                      </Area>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Composition Pie */}
              <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-[32px] border border-black/[0.06] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#0E0E10] uppercase tracking-wider">
                    {isTabular ? `${metricLabel} Share` : "Category Split"}
                  </h4>
                  <p className="text-xs text-[#71717A]">Click slice to view percentage</p>
                </div>

                <div className="h-[240px] flex items-center justify-center my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activeOverview.composition}
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        className="cursor-pointer"
                        onClick={(data) => {
                          if (data) {
                            const p = data.payload || data;
                            handleChartClick(isTabular ? `${metricLabel} Share` : "Category Split", p.name || p.label, p.value, activeOverview.composition);
                          }
                        }}
                      >
                        {activeOverview.composition.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-wrap gap-2 text-[10px] font-bold text-[#71717A] pt-3 border-t border-black/[0.04]">
                  {activeOverview.composition.slice(0, 4).map((c, i) => (
                    <span key={i} className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      {c.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Distribution Bar */}
              <div className="lg:col-span-12 bg-white p-6 sm:p-8 rounded-[32px] border border-black/[0.06] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-sm font-bold text-[#0E0E10] uppercase tracking-wider">
                      {isTabular ? `${metricLabel} by ${secDimLabel}` : "Comparative Distribution"}
                    </h4>
                    <p className="text-xs text-[#71717A]">Primary cross-tabulation volume</p>
                  </div>
                </div>

                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activeOverview.distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAF4ED" />
                      <XAxis 
                        dataKey="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#71717A', fontSize: 11, fontWeight: 600}}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#71717A', fontSize: 11, fontWeight: 600}}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: '#FAF4ED'}} />
                      <Bar 
                        dataKey="value" 
                        fill="#0E0E10" 
                        radius={[8, 8, 0, 0]}
                        onClick={(data) => {
                          if (data) {
                            handleChartClick(isTabular ? `${metricLabel} by ${secDimLabel}` : "Comparative Distribution", data.category, data.value, activeOverview.distribution);
                          }
                        }}
                      >
                        {activeOverview.distribution.map((_, index) => (
                          <Cell key={`bar-${index}`} fill={index === 0 ? '#FF7448' : '#0E0E10'} />
                        ))}
                        <LabelList dataKey="value" position="top" content={renderCustomLabel} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* 4-Tier Editorial Narrative Cards */}
      <div className="space-y-8 mt-12">
        {/* Descriptive Summary */}
        <section className="bg-white rounded-[32px] p-8 sm:p-10 border border-black/[0.06] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)]">
          <SectionHeader 
            icon={BarChart2} 
            title="Descriptive Summary" 
            subtitle="Observed patterns, cumulative values, and concentration shares."
          />
          <p className="text-[#0E0E10] text-sm sm:text-base leading-relaxed font-normal">
            {analysis.descriptive.narrative}
          </p>
        </section>

        {/* Diagnostic Deep Dive */}
        <section className="bg-white rounded-[32px] p-8 sm:p-10 border border-black/[0.06] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)]">
          <SectionHeader 
            icon={Activity} 
            title="Diagnostic Deep Dive" 
            subtitle="Underlying correlations and root causes identified in records."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <p className="text-[#0E0E10] text-sm sm:text-base leading-relaxed font-normal">
              {analysis.diagnostic.narrative}
            </p>
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider">
                Statistical Correlations
              </h5>
              {analysis.diagnostic.correlations.map((corr, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#FAF4ED] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#0E0E10]">{corr.factor}</p>
                    <p className="text-[11px] text-[#71717A]">{corr.relationship}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-black/[0.08] rounded-full overflow-hidden">
                      <div className="h-full bg-[#FF7448] rounded-full" style={{ width: `${corr.strength * 100}%` }} />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0E0E10]">{(corr.strength * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Predictive Horizon (Nomu Dark Ink Card) */}
        <section className="bg-[#0E0E10] text-white rounded-[32px] p-8 sm:p-10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.2)] relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-[#FF7448]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Predictive Horizon</h3>
                <p className="text-white/60 text-xs font-normal mt-0.5">Statistical forecast of expected trajectory over upcoming cycles.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.predictive.forecast}>
                    <defs>
                      <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF7448" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0E0E10" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fill: '#A1A1AA', fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#A1A1AA', fontSize: 10}} />
                    <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
                    <Area type="monotone" dataKey="predicted" stroke="#FF7448" fillOpacity={1} fill="url(#colorPred)" strokeWidth={2.5}>
                      <LabelList dataKey="predicted" position="top" style={{ fill: '#fff', fontSize: 10, fontWeight: 700 }} formatter={(v: number) => v.toFixed(1)} />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="lg:col-span-4 p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Model Confidence</span>
                <p className="text-5xl font-black text-white">{(analysis.predictive.confidence * 100).toFixed(0)}%</p>
                <p className="text-xs text-white/50">{analysis.predictive.modelExplanation}</p>
              </div>
            </div>

            <p className="text-white/80 text-xs sm:text-sm leading-relaxed pt-4 border-t border-white/10">
              {analysis.predictive.narrative}
            </p>
          </div>
        </section>

        {/* Prescriptive Strategic Actions */}
        <section className="bg-white rounded-[32px] p-8 sm:p-10 border border-black/[0.06] shadow-[0_12px_30px_-10px_rgba(0,0,0,0.04)]">
          <SectionHeader 
            icon={Lightbulb} 
            title="Prescriptive Strategic Actions" 
            subtitle="Actionable roadmap distilled from diagnostic metrics."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {analysis.prescriptive.recommendations.map((rec, idx) => {
              const steps = getPlanSteps(rec.action, rec.plan);
              const recChecked = checkedSteps[rec.action] || {};
              const checkedCount = steps.filter((_, sIdx) => recChecked[sIdx]).length;
              const isCompleted = checkedCount === steps.length && steps.length > 0;

              return (
                <div 
                  key={idx} 
                  className={`p-6 rounded-[28px] border transition-all flex flex-col justify-between space-y-4 ${
                    isCompleted ? 'bg-emerald-50/40 border-emerald-300' : 'bg-[#FAF4ED] border-black/[0.04] hover:border-black/[0.12]'
                  }`}
                >
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white text-[#0E0E10] border border-black/[0.06]">
                      {rec.priority} Priority
                    </span>
                    <h5 className="text-base font-bold text-[#0E0E10] pt-1">{rec.action}</h5>
                    <p className="text-xs text-[#71717A] leading-relaxed">{rec.impact}</p>
                  </div>

                  <div className="pt-4 border-t border-black/[0.06] flex items-center justify-between">
                    <button
                      onClick={() => setActivePlan({ action: rec.action, plan: rec.plan })}
                      className="nomu-pill text-xs font-bold text-[#0E0E10] hover:text-[#FF7448] flex items-center gap-1 cursor-pointer"
                    >
                      {isCompleted ? 'Review Steps' : 'View Plan'} <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    {checkedCount > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {isCompleted ? '✓ Completed' : `${checkedCount}/${steps.length}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 rounded-2xl bg-[#FAF4ED] text-xs text-[#71717A] space-y-2">
            <p className="font-semibold text-[#0E0E10]">Strategic Synthesis:</p>
            <p className="leading-relaxed">{analysis.prescriptive.narrative}</p>
          </div>
        </section>
      </div>

      {/* Checklist Plan Modal (Nomu-style) */}
      {activePlan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-nomu-fade">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 border border-black/[0.08] shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[#FF7448] uppercase tracking-wider">Tactical Plan</span>
                <h4 className="text-lg font-bold text-[#0E0E10]">{activePlan.action}</h4>
              </div>
              <button
                onClick={() => setActivePlan(null)}
                className="w-8 h-8 rounded-full bg-[#FAF4ED] hover:bg-black hover:text-white text-[#0E0E10] flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {getPlanSteps(activePlan.action, activePlan.plan).map((step, sIdx) => {
                const isChecked = checkedSteps[activePlan.action]?.[sIdx] || false;
                return (
                  <div 
                    key={sIdx}
                    onClick={() => {
                      setCheckedSteps(prev => ({
                        ...prev,
                        [activePlan.action]: {
                          ...(prev[activePlan.action] || {}),
                          [sIdx]: !isChecked
                        }
                      }));
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked ? 'bg-emerald-50/60 border-emerald-200' : 'bg-[#FAF4ED] border-black/[0.04]'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                      isChecked ? 'bg-emerald-600 text-white' : 'border border-black/20 bg-white'
                    }`}>
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span className={`text-xs ${isChecked ? 'line-through text-[#71717A]' : 'text-[#0E0E10] font-medium'}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <button
              onClick={handleAcknowledge}
              className="nomu-pill w-full py-3.5 rounded-full bg-[#0E0E10] hover:bg-[#FF7448] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              Acknowledge &amp; Mark All Complete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
