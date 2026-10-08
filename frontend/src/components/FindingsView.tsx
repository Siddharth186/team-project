import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  HelpCircle,
  FileQuestion,
  CheckCircle2
} from 'lucide-react';
import { Finding, MissingInformation } from '../types/nexus';

interface FindingsViewProps {
  findings: Finding[];
  missingInfo: MissingInformation[];
  onOpenFinding: (finding: Finding) => void;
}

export const FindingsView: React.FC<FindingsViewProps> = ({
  findings,
  missingInfo,
  onOpenFinding
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredFindings = findings.filter((f) => {
    const matchesSeverity = severityFilter === 'ALL' || f.severity === severityFilter;
    const matchesSearch =
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Filters */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white font-mono flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <span>Cross-Document Validation & Discrepancies</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Deterministic contradictions identified by Member 2 engine. Click any finding to inspect page-level evidence.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search entity, value or finding..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
            />
          </div>
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center space-x-2 text-xs font-mono pt-2 border-t border-white/5">
          <span className="text-slate-500 text-[11px] mr-1">Severity:</span>
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1 rounded-md transition-all ${
                severityFilter === sev
                  ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40 font-semibold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Findings Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredFindings.map((finding) => (
          <div
            key={finding.id}
            onClick={() => onOpenFinding(finding)}
            className="p-5 rounded-2xl glass-panel hover:glass-panel-glow border border-white/10 hover:border-lime-400/40 transition-all duration-300 cursor-pointer flex flex-col justify-between group space-y-4"
          >
            <div>
              {/* Badge & Confidence */}
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                  finding.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  finding.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {finding.severity}
                </span>

                <span className="flex items-center space-x-1 text-xs font-mono text-lime-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{(finding.confidence * 100).toFixed(0)}% Conf</span>
                </span>
              </div>

              {/* Title & Entity */}
              <h3 className="text-base font-bold text-white group-hover:text-lime-300 transition-colors">
                {finding.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Entity: <strong className="text-slate-200">{finding.entityName}</strong>
              </p>

              {/* Exact Delta Visualizer */}
              {finding.discrepancyDelta && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Approved/Sanctioned:</span>
                    <span className="text-emerald-400 font-bold">{finding.discrepancyDelta.expectedOrPrevious}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Reported/Requested:</span>
                    <span className="text-rose-400 font-bold">{finding.discrepancyDelta.reportedOrNew}</span>
                  </div>
                  <div className="pt-1 border-t border-white/10 flex justify-between font-bold text-amber-300">
                    <span>Difference:</span>
                    <span className="bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                      {finding.discrepancyDelta.difference}
                    </span>
                  </div>
                </div>
              )}

              <p className="mt-3 text-xs text-slate-300 leading-relaxed font-sans line-clamp-2">
                {finding.summary}
              </p>
            </div>

            {/* Card Footer Button */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">
                {finding.conflictingFacts.length} conflicting sources
              </span>
              <span className="text-xs font-mono text-lime-400 group-hover:underline flex items-center space-x-1">
                <span>View Evidence</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Missing Regulatory Information Section */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
          <FileQuestion className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            Mandatory Regulatory Information Missing from Submitted Dossier ({missingInfo.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {missingInfo.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-900/70 border border-amber-500/20 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-mono">{item.requiredAttribute}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                  item.impactLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {item.impactLevel}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans">{item.reason}</p>
              <div className="pt-2 border-t border-white/5 text-[11px] text-amber-300/90 font-mono">
                <strong>Remedy:</strong> {item.suggestedRemedy}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
