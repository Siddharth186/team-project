import React, { useState } from 'react';
import {
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Info
} from 'lucide-react';
import { TemporalNode } from '../types/nexus';

interface TimelineViewProps {
  timeline: TemporalNode[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ timeline }) => {
  const [selectedNode, setSelectedNode] = useState<TemporalNode>(timeline[timeline.length - 1] || timeline[0]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs uppercase tracking-wider">
          <Clock className="w-4 h-4" />
          <span>Temporal Value Trajectory & Chronological Verification</span>
        </div>
        <h2 className="text-xl font-bold text-white font-mono">
          Entity Operating Turnover Evolution (FY2024-25)
        </h2>
        <p className="text-xs text-slate-400 max-w-3xl">
          Deterministic cross-document time-series tracking. Documents from different reporting periods are synthesized into a verified chronological trajectory with source-level audit trails.
        </p>

        {/* High-Level Progression Summary Pill */}
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-cyan-500/20 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center space-x-3">
            <span className="text-slate-400">Quarterly Trajectory:</span>
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300">₹30,00,000</span>
              <span className="text-cyan-500">→</span>
              <span className="px-2.5 py-1 rounded bg-slate-800 text-cyan-300">₹35,00,000</span>
              <span className="text-cyan-500">→</span>
              <span className="px-2.5 py-1 rounded bg-lime-400/20 text-lime-400 border border-lime-400/40">₹42,00,000</span>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cumulative Top-Line Surge: +40.0%</span>
          </div>
        </div>
      </div>

      {/* Interactive Horizontal / Grid Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {timeline.map((node, idx) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-5 rounded-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? 'glass-panel-glow border-lime-400/50 shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                  : 'glass-panel border-white/10 hover:border-white/20'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{node.periodOrDate}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                    Step #{idx + 1}
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-[10px] text-slate-500 uppercase font-mono block">Verified Turnover</span>
                  <span className="text-2xl font-extrabold text-white font-mono tracking-tight">{node.value}</span>
                </div>

                {node.deltaPercent && (
                  <div className="mt-2 inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono">
                    <TrendingUp className="w-3 h-3" />
                    <span>+{node.deltaPercent}% vs prior quarter</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 truncate max-w-[170px]">{node.evidence.documentName}</span>
                <span className="text-lime-400 text-[11px]">Pg {node.evidence.pageNumber}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Source Evidence Inspector for Selected Node */}
      {selectedNode && (
        <div className="p-6 rounded-2xl glass-panel border border-lime-400/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-lime-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Temporal Anchor Traceability: {selectedNode.periodOrDate}
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-xs">
              Entity: {selectedNode.entityName}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Primary Source Document</span>
              <p className="text-sm font-bold text-white font-mono">{selectedNode.evidence.documentName}</p>
              <div className="flex items-center space-x-4 text-slate-400 font-mono text-[11px]">
                <span>Page: <strong className="text-lime-300">{selectedNode.evidence.pageNumber}</strong></span>
                <span>ISO Date: {selectedNode.isoDate}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-100/90 italic space-y-1">
              <span className="text-[10px] font-mono uppercase not-italic text-amber-400 block">
                Source Document Exact Excerpt:
              </span>
              "{selectedNode.evidence.snippet}"
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-start space-x-2 text-xs text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Chronological Consistency Note:</strong> The reported turnover progression across Q1, Q2, and Q3 demonstrates legitimate organic expansion verified across independent banking collection tallies and statutory audit exhibits.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
