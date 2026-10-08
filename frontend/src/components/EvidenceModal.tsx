import React from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { Finding, Fact } from '../types/nexus';

interface EvidenceModalProps {
  finding: Finding | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ finding, onClose }) => {
  if (!finding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-lime-400/30 p-6 shadow-2xl shadow-lime-950/40">
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-white/10">
          <div className="space-y-1">
            <div className="flex items-center space-x-3">
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-semibold uppercase tracking-wider ${
                finding.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' :
                finding.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                'bg-blue-500/20 text-blue-400 border border-blue-500/40'
              }`}>
                {finding.severity} SEVERITY
              </span>
              <span className="text-xs font-mono text-slate-400">ID: {finding.id}</span>
              <span className="flex items-center space-x-1 text-xs text-lime-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confidence: {(finding.confidence * 100).toFixed(0)}%</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">{finding.title}</h2>
            <p className="text-xs text-slate-400">Target Entity: <span className="text-lime-300 font-medium">{finding.entityName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Question: "Why did NEXUS say this?" */}
        <div className="my-5 p-4 rounded-xl bg-lime-400/5 border border-lime-400/20 space-y-2">
          <div className="flex items-center space-x-2 text-lime-400 font-mono text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span className="font-semibold">Why did NEXUS say this? (Deterministic Grounding)</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-sans">
            {finding.reasoning}
          </p>
          {finding.discrepancyDelta && (
            <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-slate-400">Baseline/Sanctioned: </span>
                <span className="text-emerald-400 font-bold">{finding.discrepancyDelta.expectedOrPrevious}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500" />
              <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-slate-400">Reported/Claimed: </span>
                <span className="text-rose-400 font-bold">{finding.discrepancyDelta.reportedOrNew}</span>
              </div>
              <div className="bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-300 font-bold">
                Variance: {finding.discrepancyDelta.difference}
              </div>
            </div>
          )}
        </div>

        {/* Cross-Document Evidence Comparison */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 flex items-center space-x-2">
            <FileText className="w-4 h-4 text-lime-400" />
            <span>Traceable Source Verification (Document → Page → Exact Snippet)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {finding.conflictingFacts.map((fact: Fact, idx: number) => (
              <div
                key={fact.id || idx}
                className="p-4 rounded-xl bg-slate-900/80 border border-white/10 hover:border-lime-400/30 transition-all space-y-3"
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                    Fact #{idx + 1}: {fact.attribute}
                  </span>
                  <span className="text-lime-400 font-mono text-[11px]">
                    Conf: {(fact.confidence * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Value Box */}
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Normalized Value</span>
                    <span className="text-base font-bold text-white font-mono">{fact.value}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono">
                    {fact.extractedBy}
                  </span>
                </div>

                {/* Document & Page Origin */}
                <div className="text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-lime-400 flex-shrink-0" />
                    <span className="font-semibold truncate">{fact.source.documentName}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                    <span>Page: <strong className="text-white">{fact.source.pageNumber}</strong></span>
                    <span>Doc ID: {fact.source.documentId}</span>
                  </div>
                </div>

                {/* Highlighted Exact Source Snippet */}
                <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-xs text-amber-100/90 leading-relaxed italic relative">
                  <span className="text-[10px] font-mono not-italic text-amber-400 block mb-1 uppercase tracking-wider">
                    Source Text Snippet:
                  </span>
                  "{fact.source.snippet}"
                </div>

                {/* Context */}
                <p className="text-[11px] text-slate-400">
                  <strong className="text-slate-300">Section/Context:</strong> {fact.context}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Action */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900/60 border border-white/10 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              Recommended Human Underwriter Action
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {finding.recommendation}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Verified by NEXUS Deterministic Intelligence Engine
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-lime-400 text-black font-semibold text-xs tracking-wider uppercase hover:bg-lime-300 transition-colors shadow-lg shadow-lime-400/20"
          >
            Close Evidence Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
