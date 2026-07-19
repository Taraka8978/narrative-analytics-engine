
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, AreaChart, Area, PieChart, Pie, Legend, Label, LabelList
} from 'recharts';
import { AnalysisSummary, DataRow } from '../types';
import { 
  TrendingUp, Activity, BarChart2, Lightbulb, 
  ShieldCheck, AlertCircle, ArrowUpRight, ArrowDownRight,
  Layout as LayoutIcon, Maximize2, Filter, Share2, Download
} from 'lucide-react';

interface DashboardProps {
  analysis: AnalysisSummary;
  onReset: () => void;
  data: DataRow[];
}

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f43f5e', '#eab308', '#8b5cf6'];

export const Dashboard: React.FC<DashboardProps> = ({ analysis, onReset, data }) => {
  const [activePlan, setActivePlan] = React.useState<{ action: string; plan?: string[] } | null>(null);
  const [selectedElement, setSelectedElement] = React.useState<{
    chartName: string;
    label: string;
    value: number;
    percent?: number;
  } | null>(null);
  const [checkedSteps, setCheckedSteps] = React.useState<Record<string, Record<number, boolean>>>({});

  const getPlanSteps = (action: string, backendPlan?: string[]) => {
    if (backendPlan && backendPlan.length > 0) return backendPlan;
    const actionLower = action.toLowerCase();
    const metricLabel = analysis.metadata?.metric_name ?? "Value";
    const dimLabel = analysis.metadata?.dimension_name ?? "Category";
    const secDimLabel = analysis.metadata?.sec_dimension_name ?? "Categories";

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
    } else if (actionLower.includes("allocation") || actionLower.includes("operations") || actionLower.includes("optimize")) {
      return [
        `Review budget spend on the top-performing ${dimLabel} category.`,
        "Optimize regional logistics routes to cut overhead.",
        "Launch focused promotional campaigns targeting core users.",
        "Draft monthly sales velocity targets."
      ];
    } else {
      return [
        `Audit data quality metrics for ${metricLabel} monthly.`,
        `Design surveys targeting top ${dimLabel} respondents.`,
        `Optimize pricing thresholds for high performing ${secDimLabel} variables.`,
        "Establish continuous automated monitoring dashboards."
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
    <div className="flex items-start gap-4 mb-8">
      <div className="p-3 bg-slate-900 rounded-xl">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-slate-900 leading-none mb-1">{title}</h3>
        <p className="text-slate-500 text-sm font-medium">{subtitle}</p>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-lg">
          <p className="text-xs font-bold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-semibold" style={{ color: entry.color }}>
              {entry.name}: <span className="font-black">{typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}</span>
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
        y={y - 10} 
        fill="#0f172a" 
        textAnchor="middle" 
        className="text-xs font-bold"
      >
        {typeof value === 'number' ? value.toFixed(1) : value}
      </text>
    );
  };

  const renderPieLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}`;
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 bg-slate-50 -mx-6 px-6 py-12">
      {/* BI Command Center Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <LayoutIcon className="w-5 h-5 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Executive BI Canvas</h2>
        </div>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Filter className="w-4 h-4" /></button>
          <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><Share2 className="w-4 h-4" /></button>
          <button 
            onClick={downloadCleanedCSV}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs font-bold transition-all"
            title="Export the cleaned dataset used for these insights"
          >
            <Download className="w-4 h-4" /> EXPORT CLEAN DATA
          </button>
          <button onClick={onReset} className="ml-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all">NEW ANALYSIS</button>
        </div>
      </div>

      {/* Metric Tiles Tier (Power BI Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analysis.descriptive.kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{kpi.label}</p>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-black text-slate-900">{kpi.value}</span>
                {kpi.change && (
                  <div className={`flex items-center text-xs font-bold mt-2 ${kpi.trend === 'up' ? 'text-emerald-600' : kpi.trend === 'down' ? 'text-rose-600' : 'text-slate-400'}`}>
                    {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {kpi.change}
                  </div>
                )}
              </div>
              <div className="w-16 h-8 opacity-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.biOverview.trend.slice(-5)}>
                    <Area type="monotone" dataKey="value" stroke={kpi.trend === 'up' ? '#10b981' : '#f43f5e'} fill={kpi.trend === 'up' ? '#10b981' : '#f43f5e'} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Visual Canvas Tier */}
      {selectedElement && (
        <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-lg animate-in slide-in-from-top-4 duration-500 max-w-5xl mx-auto flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <BarChart2 className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Chart Element Details</p>
              <h4 className="text-lg font-black text-slate-800">
                Category: <span className="text-indigo-600 font-extrabold">"{selectedElement.label}"</span> <span className="font-normal text-slate-400 text-sm">({selectedElement.chartName})</span>
              </h4>
              <p className="text-sm text-slate-500 font-light mt-1">
                Value: <span className="font-bold text-slate-700">{selectedElement.value.toLocaleString()}</span> 
                {selectedElement.percent !== undefined && (
                  <span> ({selectedElement.percent.toFixed(1)}% of chart total)</span>
                )}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedElement(null)}
            className="px-4 py-2 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-wider border border-slate-100"
          >
            Clear Selection
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dynamic Metric Labels */}
        {(() => {
          const isTabular = analysis.metadata?.dataset_type === 'structured_tabular';
          const metricLabel = analysis.metadata?.metric_name ?? "Value";
          const dimLabel = analysis.metadata?.dimension_name ?? "Category";
          const secDimLabel = analysis.metadata?.sec_dimension_name ?? "Categories";

          return (
            <>
              <div className="lg:col-span-8 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative group">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                      {isTabular ? `${metricLabel} Trend by ${dimLabel}` : "Performance Momentum"}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Click a point on the chart to inspect attributes</p>
                  </div>
                  <Maximize2 className="w-4 h-4 text-slate-300 animate-pulse" />
                </div>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart 
                      data={analysis.biOverview.trend}
                      onClick={(state) => {
                        if (state && state.activePayload && state.activePayload.length) {
                          const p = state.activePayload[0].payload;
                          handleChartClick(isTabular ? `${metricLabel} Trend by ${dimLabel}` : "Performance Momentum", p.name, p.value, analysis.biOverview.trend);
                        }
                      }}
                    >
                      <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} 
                        label={{ value: isTabular ? dimLabel : 'Time Period', position: 'insideBottom', offset: -5, style: { fill: '#64748b', fontSize: 10, fontWeight: 700 } }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}}
                        label={{ value: metricLabel, angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10, fontWeight: 700 } }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#4f46e5" 
                        fillOpacity={1} 
                        fill="url(#colorTrend)" 
                        strokeWidth={3}
                        className="cursor-pointer"
                      >
                        <LabelList dataKey="value" position="top" style={{ fill: '#4f46e5', fontSize: 11, fontWeight: 700 }} formatter={(value: number) => value.toFixed(0)} />
                      </Area>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Metric Axis: {metricLabel} vs {dimLabel}</span>
                  <span>Summed over all periods</span>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                      {isTabular ? `${metricLabel} Share by ${dimLabel}` : "Category Split"}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Click a slice to inspect details</p>
                  </div>
                </div>
                <div className="flex-1 h-[250px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analysis.biOverview.composition}
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                        label={(entry) => `${entry.name}`}
                        labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                        className="cursor-pointer"
                        onClick={(data) => {
                          if (data) {
                            const p = data.payload || data;
                            handleChartClick(isTabular ? `${metricLabel} Share by ${dimLabel}` : "Category Split", p.name || p.label, p.value, analysis.biOverview.composition);
                          }
                        }}
                      >
                        {analysis.biOverview.composition.map((entry, index) => {
                          const isSelected = selectedElement && selectedElement.chartName.includes("Share") && selectedElement.label === entry.label;
                          const isAnySelected = selectedElement && selectedElement.chartName.includes("Share");
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]} 
                              style={{
                                opacity: isAnySelected ? (isSelected ? 1.0 : 0.35) : 1.0,
                                transition: 'opacity 300ms ease'
                              }}
                            />
                          );
                        })}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Composition: {metricLabel} split</span>
                  <span>Percentage share representation</span>
                </div>
              </div>

              <div className="lg:col-span-12 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
                      {isTabular ? `${metricLabel} by ${secDimLabel}` : "Comparative Distribution"}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Click any bar to inspect details</p>
                  </div>
                </div>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.biOverview.distribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}}
                        label={{ value: isTabular ? secDimLabel : 'Categories', position: 'insideBottom', offset: -5, style: { fill: '#64748b', fontSize: 10, fontWeight: 700 } }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}}
                        label={{ value: metricLabel, angle: -90, position: 'insideLeft', style: { fill: '#64748b', fontSize: 10, fontWeight: 700 } }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                      <Bar 
                        dataKey="value" 
                        radius={[8, 8, 0, 0]} 
                        barSize={32}
                        className="cursor-pointer"
                        onClick={(data) => {
                          if (data) {
                            handleChartClick(isTabular ? `${metricLabel} by ${secDimLabel}` : "Comparative Distribution", data.category || data.name, data.value, analysis.biOverview.distribution);
                          }
                        }}
                      >
                        {analysis.biOverview.distribution.map((entry, index) => {
                          const isSelected = selectedElement && selectedElement.chartName.includes("by") && selectedElement.label === entry.category;
                          const isAnySelected = selectedElement && selectedElement.chartName.includes("by");
                          return (
                            <Cell 
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]} 
                              style={{
                                opacity: isAnySelected ? (isSelected ? 1.0 : 0.35) : 1.0,
                                transition: 'opacity 300ms ease'
                              }}
                            />
                          );
                        })}
                        <LabelList dataKey="value" position="top" content={renderCustomLabel} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Metrics: {metricLabel} vs {secDimLabel}</span>
                  <span>Primary categories comparison</span>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Narrative Section */}
      <div className="space-y-12 mt-16 max-w-5xl mx-auto">
        <section className="bg-white rounded-[40px] p-12 border border-slate-200 shadow-lg">
          <SectionHeader 
            icon={BarChart2} 
            title="Descriptive Summary" 
            subtitle="Expert synthesis of observed patterns and performance metrics."
          />
          <div className="prose prose-slate prose-lg max-w-none">
            <p className="text-slate-600 leading-relaxed font-light">
              <span className="font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-6 inline-block">EXECUTIVE TRANSCRIPT</span><br/>
              {analysis.descriptive.narrative}
            </p>
          </div>
        </section>

        <section className="bg-white rounded-[40px] p-12 border border-slate-200 shadow-lg">
          <SectionHeader 
            icon={Activity} 
            title="Diagnostic Deep Dive" 
            subtitle="Identifying the 'Why' behind current data trajectories."
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="prose prose-slate prose-lg">
               <p className="text-slate-600 leading-relaxed font-light">
                <span className="font-bold text-slate-900 border-b-2 border-slate-900 pb-1 mb-6 inline-block">ROOT CAUSE LOG</span><br/>
                {analysis.diagnostic.narrative}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Statistical Correlations</h4>
              {analysis.diagnostic.correlations.map((corr, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{corr.factor}</p>
                    <p className="text-xs text-slate-500 font-medium">{corr.relationship}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-900 rounded-full transition-all duration-1000" 
                        style={{ width: `${corr.strength * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">{(corr.strength * 100).toFixed(0)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900 rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 -mr-32 -mt-32 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <SectionHeader 
              icon={TrendingUp} 
              title="Predictive Horizon" 
              subtitle="Statistical forecasting models applied to current momentum."
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-8 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.predictive.forecast}>
                    <defs>
                      <linearGradient id="colorWhite" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="period" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}}
                      label={{ value: 'Forecast Period', position: 'insideBottom', offset: -5, style: { fill: '#94a3b8', fontSize: 10, fontWeight: 700 } }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}}
                      label={{ value: 'Predicted Value', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 10, fontWeight: 700 } }}
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff'}} 
                      labelStyle={{color: '#94a3b8', fontWeight: 600, fontSize: 11, marginBottom: 4}}
                      itemStyle={{color: '#fff', fontWeight: 700, fontSize: 13}}
                      formatter={(value: number) => [value.toFixed(2), 'Predicted']}
                    />
                    <Area type="monotone" dataKey="predicted" stroke="#ffffff" fillOpacity={1} fill="url(#colorWhite)" strokeWidth={3}>
                      <LabelList dataKey="predicted" position="top" style={{ fill: '#ffffff', fontSize: 11, fontWeight: 700 }} formatter={(value: number) => value.toFixed(1)} />
                    </Area>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="lg:col-span-4 space-y-8">
                <div className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Confidence Interval</span>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-6xl font-black mb-2 tracking-tighter">{(analysis.predictive.confidence * 100).toFixed(0)}%</p>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Probability score calibrated via monte carlo simulation.</p>
                </div>
              </div>
            </div>
            <div className="mt-12 prose prose-invert prose-lg max-w-none">
              <p className="text-slate-300 leading-relaxed font-light">
                <span className="font-bold text-white uppercase tracking-widest text-xs border-b border-white/20 pb-1 mb-4 inline-block">FORECAST NARRATIVE</span><br/>
                {analysis.predictive.narrative}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[40px] p-12 border border-slate-200 shadow-lg">
          <SectionHeader 
            icon={Lightbulb} 
            title="Prescriptive Actions" 
            subtitle="Strategic roadmap generated from diagnostic and predictive findings."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {analysis.prescriptive.recommendations.map((rec, idx) => {
              const steps = getPlanSteps(rec.action, rec.plan);
              const recChecked = checkedSteps[rec.action] || {};
              const checkedCount = steps.filter((_, sIdx) => recChecked[sIdx]).length;
              const isCompleted = checkedCount === steps.length && steps.length > 0;

              return (
                <div key={idx} className={`flex flex-col p-8 bg-slate-50 border rounded-[32px] hover:border-slate-900 transition-all group ${
                  isCompleted ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-100'
                }`}>
                  <div className="mb-6 flex justify-between items-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
                      rec.priority === 'High' ? 'bg-rose-100 text-rose-700' : 
                      rec.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {rec.priority} PRIORITY
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Acknowledged
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-slate-900">{rec.action}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium flex-1">{rec.impact}</p>
                  <div className="mt-8 pt-8 border-t border-slate-200 flex items-center justify-between">
                    <button 
                      onClick={() => setActivePlan({ action: rec.action, plan: rec.plan })}
                      className={`text-[10px] font-black flex items-center gap-2 group-hover:gap-3 transition-all tracking-widest uppercase cursor-pointer ${
                        isCompleted ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isCompleted ? 'REVIEW PLAN' : 'VIEW PLAN'} <ArrowUpRight className="w-3 h-3" />
                    </button>
                    {checkedCount > 0 && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {isCompleted ? '✓ COMPLETED' : `${checkedCount}/${steps.length} STEPS`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 p-10 rounded-[32px] border border-slate-100">
            <div className="flex items-start gap-4 mb-8">
              <AlertCircle className="w-5 h-5 text-slate-400 mt-1" />
              <p className="text-xs text-slate-500 font-medium italic leading-relaxed">
                <span className="font-bold text-slate-900 uppercase tracking-widest text-[9px] not-italic mr-2 px-2 py-0.5 bg-slate-200 rounded">Liability Notice:</span>
                {analysis.prescriptive.disclaimer}
              </p>
            </div>
            <div className="prose prose-slate prose-lg max-w-none">
              <p className="text-slate-600 leading-relaxed font-light">
                <span className="font-bold text-slate-900 italic border-b border-slate-200 pb-1 mb-6 inline-block">DECISION SUPPORT TRANSCRIPT</span><br/>
                {analysis.prescriptive.narrative}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Interactive Modal Checklist Overlay */}
      {activePlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[32px] p-8 border border-slate-100 shadow-2xl relative animate-in zoom-in-95 duration-300 space-y-6">
            <button 
              onClick={() => setActivePlan(null)} 
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <span className="text-xl font-bold">✕</span>
            </button>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Tactical Roadmap</span>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">{activePlan.action}</h3>
            </div>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {(() => {
                let planItems = activePlan.plan;
                if (!planItems || planItems.length === 0) {
                  const actionLower = activePlan.action.toLowerCase();
                  const metricLabel = analysis.metadata?.metric_name ?? "Value";
                  const dimLabel = analysis.metadata?.dimension_name ?? "Category";
                  const secDimLabel = analysis.metadata?.sec_dimension_name ?? "Categories";

                  if (actionLower.includes("feedback") || actionLower.includes("messaging") || actionLower.includes("sentiment")) {
                    planItems = [
                      "Extract top negative keywords from the diagnostic run.",
                      "Create a dedicated customer care ticket queue for negative reviewers.",
                      "Reach out to dissatisfied users within 24 hours.",
                      "Audit product defects mentioned in comments weekly."
                    ];
                  } else if (actionLower.includes("correlat") || actionLower.includes("relationships") || actionLower.includes("feature")) {
                    planItems = [
                      `Review Pearson correlation coefficients monthly for ${metricLabel}.`,
                      `Bundle product categories that show positive covariance with ${metricLabel}.`,
                      `Adjust seasonal pricing structures based on correlation weights.`,
                      `Train local regression models to predict changes in ${metricLabel}.`
                    ];
                  } else if (actionLower.includes("monitor") || actionLower.includes("alert") || actionLower.includes("dashboard")) {
                    planItems = [
                      `Hook up automated database sync triggers for ${metricLabel} updates.`,
                      "Establish owner metrics checklists for weekly review.",
                      "Configure email notifications for key volume shifts.",
                      "Execute monthly retraining script for predictive models."
                    ];
                  } else if (actionLower.includes("allocation") || actionLower.includes("operations") || actionLower.includes("optimize")) {
                    planItems = [
                      `Review budget spend on the top-performing ${dimLabel} category.`,
                      "Optimize regional logistics routes to cut overhead.",
                      "Launch focused promotional campaigns targeting core users.",
                      "Draft monthly sales velocity targets."
                    ];
                  } else {
                    planItems = [
                      `Audit data quality metrics for ${metricLabel} monthly.`,
                      `Design surveys targeting top ${dimLabel} respondents.`,
                      `Optimize pricing thresholds for high performing ${secDimLabel} variables.`,
                      "Establish continuous automated monitoring dashboards."
                    ];
                  }
                }

                return (
                  <div className="space-y-3">
                    {planItems.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <input 
                          type="checkbox" 
                          id={`step-${idx}`} 
                          checked={!!(checkedSteps[activePlan.action] && checkedSteps[activePlan.action][idx])}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            setCheckedSteps(prev => ({
                              ...prev,
                              [activePlan.action]: {
                                ...(prev[activePlan.action] || {}),
                                [idx]: isChecked
                              }
                            }));
                          }}
                          className="w-4 h-4 mt-0.5 accent-indigo-600 cursor-pointer rounded"
                        />
                        <label 
                          htmlFor={`step-${idx}`} 
                          className="text-sm font-semibold text-slate-600 select-none cursor-pointer"
                        >
                          {step}
                        </label>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            <div className="pt-2">
              <button 
                onClick={handleAcknowledge} 
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all text-sm tracking-wide cursor-pointer"
              >
                ACKNOWLEDGE PLAN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
