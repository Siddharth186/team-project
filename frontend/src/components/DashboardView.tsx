import React from 'react';
import {
  FileText,
  Share2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { SystemMetrics, Finding, DocumentItem, TemporalNode } from '../types/nexus';

interface DashboardViewProps {
  metrics: SystemMetrics | null;
  findings: Finding[];
  documents: DocumentItem[];
  timeline: TemporalNode[];
  onOpenFinding: (finding: Finding) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  findings,
  documents,
  timeline,
  onOpenFinding,
  onNavigate
}) => {
  const topCriticalFinding = findings.find(f => f.severity === 'CRITICAL') || findings[0];

  const kpis = [
    {
      label: 'Verified Documents',
      value: metrics?.totalDocuments ?? 5,
      subtext: 'Across 39 pages',
      icon: FileText,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      bg: 'bg-cyan-500/10'
    },
    {
      label: 'Extracted Facts',
      value: metrics?.totalFacts ?? 38,
      subtext: 'Normalized data points',
      icon: Activity,
      color: 'text-lime-400',
      border: 'border-lime-500/20',
      bg: 'bg-lime-500/10'
    },
    {
      label: 'Mapped Relationships',
      value: metrics?.totalRelationships ?? 14,
      subtext: 'Entity network links',
      icon: Share2,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/10'
    },
    {
      label: 'Contradictions Detected',
      value: metrics?.totalConflicts ?? 3,
      subtext: `${metrics?.criticalConflicts ?? 1} critical variance`,
      icon: AlertTriangle,
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'bg-rose-500/10'
    },
    {
      label: 'Missing Regulatory Info',
      value: metrics?.missingDataCount ?? 2,
      subtext: 'Required under policy',
      icon: HelpCircle,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/10'
    },
    {
      label: 'Average Confidence',
      value: `${((metrics?.averageConfidence ?? 0.942) * 100).toFixed(1)}%`,
      subtext: 'Deterministic score',
      icon: ShieldCheck,
      color: 'text-lime-400',
      border: 'border-lime-500/30',
      bg: 'bg-lime-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl glass-panel border ${kpi.border} transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-white font-mono tracking-tight">{kpi.value}</span>
                <p className="text-[10px] text-slate-400 font-sans mt-0.5">{kpi.subtext}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Row: Spotlight Finding + Live Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Major Findings Spotlight */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Spotlight */}
          {topCriticalFinding && (
            <div className="p-6 rounded-2xl glass-panel-glow border border-lime-400/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase">
                      CRITICAL CONTRADICTION SPOTLIGHT
                    </span>
                    <span className="text-xs text-lime-400 font-mono">
                      {(topCriticalFinding.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-wide mt-2">{topCriticalFinding.title}</h2>
                  <p className="text-xs text-slate-400">Target: <strong className="text-slate-200">{topCriticalFinding.entityName}</strong></p>
                </div>

                <button
                  onClick={() => onOpenFinding(topCriticalFinding)}
                  className="px-3.5 py-1.5 rounded-lg bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs tracking-wider uppercase font-mono flex items-center space-x-1.5 transition-all shadow-md shadow-lime-400/20"
                >
                  <span>Inspect Evidence</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Delta Box */}
              {topCriticalFinding.discrepancyDelta && (
                <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Approved Ceiling</span>
                    <span className="text-emerald-400 font-bold">{topCriticalFinding.discrepancyDelta.expectedOrPrevious}</span>
                  </div>
                  <span className="text-slate-600 font-bold text-sm">vs</span>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Requested Amount</span>
                    <span className="text-rose-400 font-bold">{topCriticalFinding.discrepancyDelta.reportedOrNew}</span>
                  </div>
                  <div className="px-3 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-rose-300 font-bold">
                    Discrepancy: {topCriticalFinding.discrepancyDelta.difference}
                  </div>
                </div>
              )}

              <p className="mt-3 text-xs text-slate-300 leading-relaxed font-sans">
                {topCriticalFinding.summary}
              </p>
            </div>
          )}

          {/* Quick Findings List */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-wide font-mono uppercase">
                  Active Intelligence Findings ({findings.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('findings')}
                className="text-xs text-lime-400 hover:underline flex items-center space-x-1 font-mono"
              >
                <span>View All Findings</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {findings.map((f) => (
                <div
                  key={f.id}
                  onClick={() => onOpenFinding(f)}
                  className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 hover:border-lime-400/30 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        f.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400' :
                        f.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {f.severity}
                      </span>
                      <h4 className="text-xs font-semibold text-white group-hover:text-lime-300 transition-colors">
                        {f.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{f.summary}</p>
                  </div>
                  <div className="flex items-center space-x-3 text-right">
                    <span className="text-xs font-mono text-lime-400 hidden sm:inline">
                      {(f.confidence * 100).toFixed(0)}%
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-lime-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live Intelligence Stream & Core Status */}
        <div className="space-y-6">
          {/* Core Decision Verdict */}
          <div className="p-5 rounded-2xl glass-panel border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                RECOMMENDED DECISION STATUS
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                REVIEW REQUIRED
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Autonomous STP approval suspended due to ₹3.4L grant ceiling conflict and unverified ₹55K director salary variance. Human underwriting review mandatory.
            </p>
            <button
              onClick={() => onNavigate('report')}
              className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs flex items-center justify-center space-x-2 border border-white/10 transition-colors"
            >
              <span>Inspect Full Case Report</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Temporal Quick Glance */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-white">Temporal Turnover Trend</h4>
              </div>
              <button
                onClick={() => onNavigate('timeline')}
                className="text-xs text-cyan-400 hover:underline font-mono"
              >
                Expand
              </button>
            </div>

            <div className="space-y-2">
              {timeline.map((node, i) => (
                <div key={node.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-900/60 border border-white/5 font-mono">
                  <span className="text-slate-400">{node.periodOrDate}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-bold">{node.value}</span>
                    {node.deltaPercent && (
                      <span className="text-emerald-400 text-[10px]">+{node.deltaPercent}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Ingested Documents */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-lime-400" />
                <h4 className="text-xs font-mono font-bold uppercase text-white">Ingested Dossier ({documents.length})</h4>
              </div>
              <button
                onClick={() => onNavigate('documents')}
                className="text-xs text-lime-400 hover:underline font-mono"
              >
                Upload / Manage
              </button>
            </div>

            <div className="space-y-2">
              {documents.slice(0, 3).map((doc) => (
                <div key={doc.id} className="p-2.5 rounded-lg bg-slate-900/50 border border-white/5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate pr-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-slate-200 truncate font-mono text-[11px]">{doc.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
