import React, { useState } from 'react';
import {
  X,
  Share2,
  Landmark,
  Coins,
  FileText,
  Shield,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { nexusData } from '../../data/demoData';

interface KnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectEvidence: () => void;
}

export const KnowledgeGraphModal: React.FC<KnowledgeGraphModalProps> = ({
  isOpen,
  onClose,
  onInspectEvidence
}) => {
  const [selectedNode, setSelectedNode] = useState<string>('applicant');

  if (!isOpen) return null;

  const nodeDetails: Record<string, any> = {
    applicant: {
      title: "Applicant (Arjun Mehta)",
      type: "PERSON / MANAGING DIRECTOR",
      sources: ["Applicant_Form.pdf", "Bank_Statement.pdf"],
      facts: ["Income claimed: ₹42,000 / mo", "Verified Bank Inflow: ₹31,500 / mo"],
      conflict: "Income mismatch detected (33.3% variance)",
      confidence: 94
    },
    bank_acc: {
      title: "Commercial Current Account",
      type: "FINANCIAL_ACCOUNT",
      sources: ["Bank_Statement.pdf"],
      facts: ["Average balance: ₹4,12,000", "Monthly salary credit: ₹31,500"],
      confidence: 99
    },
    income: {
      title: "Declared Income Schedule",
      type: "FACT / VALUE",
      sources: ["Applicant_Form.pdf (Page 2)"],
      facts: ["Stated monthly draw: ₹42,000"],
      conflict: "Contradicts verified banking statements",
      confidence: 94
    },
    application: {
      title: "Commercial Loan Application Form",
      type: "DOCUMENT",
      sources: ["Applicant_Form.pdf"],
      facts: ["Facility: ₹18.4L", "Tenure: 36 months"],
      confidence: 98
    },
    policy: {
      title: "Lending Prudential Policy",
      type: "RULE / GUIDELINE",
      sources: ["Policy_Guidelines.pdf"],
      facts: ["Requires 20% promoter equity & verified tax returns"],
      confidence: 97
    },
    bank_income: {
      title: "Bank Statement Verified Credit",
      type: "CONTRADICTION NODE",
      sources: ["Bank_Statement.pdf (Page 4)"],
      facts: ["Recurring monthly credit: ₹31,500"],
      conflict: "Unreconciled deficit of ₹10,500 / mo",
      confidence: 96
    }
  };

  const activeDetail = nodeDetails[selectedNode] || nodeDetails.applicant;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] glass-panel-nexus rounded-3xl border border-[#C9FF3D]/30 p-6 flex flex-col justify-between shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#292D2B]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F7F5] font-mono">
                Knowledge Constellation Graph
              </h3>
              <p className="text-xs text-[#8F9691]">
                Interactive multi-entity network mapping facts, documents, and detected contradictions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8F9691] hover:text-[#F5F7F5] hover:bg-[#1D211F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Grid: Interactive Canvas + Node Inspector */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0">
          {/* Interactive Graph Canvas (8 cols) */}
          <div className="md:col-span-8 bg-[#0D0F0E] rounded-2xl border border-[#292D2B] relative overflow-hidden flex items-center justify-center select-none">
            {/* SVG Background Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 400">
              {/* Lines from center (300, 200) */}
              <line x1="300" y1="200" x2="160" y2="100" stroke="#C9FF3D" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 4" />
              <line x1="300" y1="200" x2="160" y2="300" stroke="#C9FF3D" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 4" />
              <line x1="300" y1="200" x2="440" y2="100" stroke="#C9FF3D" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 4" />
              <line x1="300" y1="200" x2="440" y2="300" stroke="#C9FF3D" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 4" />

              {/* Red Contradiction line between income nodes */}
              <line
                x1="160"
                y1="300"
                x2="160"
                y2="200"
                stroke="#FF7777"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
              <text x="145" y="245" fill="#FF7777" fontSize="10" fontFamily="monospace" textAnchor="end">
                CONTRADICTS (₹10.5K)
              </text>
            </svg>

            {/* Central Node: Applicant */}
            <div
              onClick={() => setSelectedNode('applicant')}
              className={`absolute z-20 px-5 py-2.5 rounded-full border-2 transition-all cursor-pointer font-mono text-xs font-bold flex items-center space-x-2 ${
                selectedNode === 'applicant'
                  ? 'bg-[#111312] border-[#C9FF3D] text-[#C9FF3D] shadow-[0_0_25px_rgba(201,255,61,0.5)] scale-110'
                  : 'bg-[#171A18] border-[#C9FF3D]/50 text-[#F5F7F5]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#C9FF3D] animate-ping" />
              <span>Applicant</span>
            </div>

            {/* Node 1: Bank Account (Top Left) */}
            <div
              onClick={() => setSelectedNode('bank_acc')}
              className={`absolute left-16 top-16 z-10 p-3 rounded-2xl border text-xs font-mono transition-all cursor-pointer flex items-center space-x-2 ${
                selectedNode === 'bank_acc'
                  ? 'bg-[#1D211F] border-[#C9FF3D] text-[#C9FF3D] shadow-lg scale-105'
                  : 'bg-[#171A18] border-[#292D2B] text-[#F5F7F5]'
              }`}
            >
              <Landmark className="w-4 h-4 text-[#C9FF3D]" />
              <span>Bank Account</span>
            </div>

            {/* Node 2: Income ₹42,000 (Bottom Left) */}
            <div
              onClick={() => setSelectedNode('income')}
              className={`absolute left-16 bottom-16 z-10 p-3 rounded-2xl border text-xs font-mono transition-all cursor-pointer flex items-center space-x-2 ${
                selectedNode === 'income'
                  ? 'bg-[#1D211F] border-[#C9FF3D] text-[#C9FF3D] shadow-lg scale-105'
                  : 'bg-[#171A18] border-[#292D2B] text-[#F5F7F5]'
              }`}
            >
              <Coins className="w-4 h-4 text-[#C9FF3D]" />
              <div>
                <span className="block leading-none">Income</span>
                <span className="text-[#C9FF3D] font-bold text-[11px]">₹42,000 / mo</span>
              </div>
            </div>

            {/* Node 3: Contradiction Node (Mid Left) */}
            <div
              onClick={() => setSelectedNode('bank_income')}
              className={`absolute left-16 top-1/2 -translate-y-1/2 z-10 p-3 rounded-2xl border text-xs font-mono transition-all cursor-pointer flex items-center space-x-2 ${
                selectedNode === 'bank_income'
                  ? 'bg-[#FF7777]/20 border-[#FF7777] text-[#FF7777] shadow-[0_0_20px_rgba(255,119,119,0.4)] scale-105'
                  : 'bg-[#171A18] border-[#FF7777]/60 text-[#FF7777]'
              }`}
            >
              <AlertTriangle className="w-4 h-4 text-[#FF7777] animate-pulse" />
              <div>
                <span className="block leading-none">Bank Verified</span>
                <span className="font-bold text-[11px]">₹31,500 / mo</span>
              </div>
            </div>

            {/* Node 4: Application (Top Right) */}
            <div
              onClick={() => setSelectedNode('application')}
              className={`absolute right-16 top-16 z-10 p-3 rounded-2xl border text-xs font-mono transition-all cursor-pointer flex items-center space-x-2 ${
                selectedNode === 'application'
                  ? 'bg-[#1D211F] border-[#38BDF8] text-[#38BDF8] shadow-lg scale-105'
                  : 'bg-[#171A18] border-[#292D2B] text-[#F5F7F5]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#38BDF8]" />
              <span>Application</span>
            </div>

            {/* Node 5: Policy (Bottom Right) */}
            <div
              onClick={() => setSelectedNode('policy')}
              className={`absolute right-16 bottom-16 z-10 p-3 rounded-2xl border text-xs font-mono transition-all cursor-pointer flex items-center space-x-2 ${
                selectedNode === 'policy'
                  ? 'bg-[#1D211F] border-[#79DF9B] text-[#79DF9B] shadow-lg scale-105'
                  : 'bg-[#171A18] border-[#292D2B] text-[#F5F7F5]'
              }`}
            >
              <Shield className="w-4 h-4 text-[#79DF9B]" />
              <span>Policy Rules</span>
            </div>
          </div>

          {/* Node Inspector Sidebar (4 cols) */}
          <div className="md:col-span-4 glass-panel-nexus rounded-2xl p-5 border border-[#292D2B] flex flex-col justify-between text-xs space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8F9691] block">Node Inspector</span>
                <h4 className="text-base font-bold text-[#F5F7F5] font-mono mt-0.5">{activeDetail.title}</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1D211F] text-[#C9FF3D] font-mono inline-block mt-1">
                  {activeDetail.type}
                </span>
              </div>

              {/* Source Documents */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#8F9691] block">Associated Sources</span>
                {activeDetail.sources.map((s: string, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-[#111312] border border-[#292D2B] font-mono text-[11px] text-[#F5F7F5]">
                    • {s}
                  </div>
                ))}
              </div>

              {/* Verified Facts */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#8F9691] block">Extracted Facts</span>
                {activeDetail.facts.map((f: string, i: number) => (
                  <div key={i} className="p-2 rounded-lg bg-[#171A18] border border-[#292D2B] text-slate-300 text-[11px]">
                    {f}
                  </div>
                ))}
              </div>

              {/* Conflict Highlight */}
              {activeDetail.conflict && (
                <div className="p-3 rounded-xl bg-[#FF7777]/10 border border-[#FF7777]/30 text-[#FF7777] text-xs space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold font-mono">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Contradiction Flag</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{activeDetail.conflict}</p>
                </div>
              )}
            </div>

            {/* Inspect Evidence Button */}
            {activeDetail.conflict && (
              <button
                onClick={() => {
                  onClose();
                  onInspectEvidence();
                }}
                className="w-full py-2.5 rounded-xl bg-[#C9FF3D] hover:bg-[#bbf030] text-[#0D0F0E] font-bold text-xs tracking-wider uppercase font-mono shadow-[0_0_15px_rgba(201,255,61,0.25)]"
              >
                Inspect Source Evidence
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
