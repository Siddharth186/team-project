import React, { useState } from 'react';
import {
  X,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileText,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  ExternalLink
} from 'lucide-react';
import { nexusData } from '../../data/demoData';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectEvidence?: (item?: any) => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  onInspectEvidence
}) => {
  const [selectedEventIndex, setSelectedEventIndex] = useState<number>(3); // Default to the conflicting milestone

  if (!isOpen) return null;

  const timelineEvents = [
    {
      period: "JAN 2026",
      date: "12 Jan 2026",
      title: "Initial Budget Proposal",
      value: "₹10,00,000",
      status: "baseline",
      statusLabel: "BASELINE",
      color: "#79DF9B",
      source: "Project_Proposal_Draft.pdf",
      page: 1,
      quote: "Initial capital expenditure estimate approved for Project Alpha: ₹10,00,000 under MSME Scheme Tier-1.",
      notes: "Project initiated with standard subsidized loan ceiling."
    },
    {
      period: "MAR 2026",
      date: "18 Mar 2026",
      title: "First Budget Revision",
      value: "₹12,00,000",
      delta: "+₹2,00,000 (+20%)",
      status: "revised",
      statusLabel: "APPROVED REVISION",
      color: "#79DF9B",
      source: "Board_Meeting_Minutes.pdf",
      page: 4,
      quote: "Board resolved to increase budget to ₹12,00,000 to cover automated robotic inspection equipment.",
      notes: "Internal quorum passed unanimous escalation."
    },
    {
      period: "JUN 2026",
      date: "04 Jun 2026",
      title: "Second Budget Revision",
      value: "₹15,00,000",
      delta: "+₹3,00,000 (+25%)",
      status: "warning",
      statusLabel: "AT CEILING CAP",
      color: "#FFBD59",
      source: "Grant_Ceiling_Cap.pdf",
      page: 2,
      quote: "Revised grant eligibility capped strictly at ₹15,00,000. Maximum subvention threshold reached.",
      notes: "Reached the statutory maximum subsidy limit under Ministry guidelines."
    },
    {
      period: "OCT 2026",
      date: "08 Oct 2026",
      title: "Commercial Loan Application",
      value: "₹18,40,000",
      delta: "+₹3,40,000 (CEILING BREACH)",
      status: "critical",
      statusLabel: "CONTRADICTION / BREACH",
      color: "#FF7777",
      source: "Commercial_Loan_Application.pdf",
      page: 2,
      quote: "Requested credit facility amount: ₹18,40,000 with 36-month repayment tenure.",
      notes: "Exceeds approved ₹15.0L grant cap by ₹3.4L without supplementary equity underwriting!"
    }
  ];

  const activeEvent = timelineEvents[selectedEventIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel-nexus rounded-3xl border border-[#C9FF3D]/30 p-6 sm:p-7 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#292D2B]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[#F5F7F5] font-mono">
                  Chronological Audit Trajectory
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF7777]/15 text-[#FF7777] border border-[#FF7777]/30">
                  Ceiling Breach Detected
                </span>
              </div>
              <p className="text-xs text-[#8F9691] font-sans">
                Temporal fact evolution across revisions from JAN 2026 to OCT 2026
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

        {/* Interactive Stepper / Horizontal Timeline Track */}
        <div className="p-4 rounded-2xl bg-[#111312] border border-[#292D2B]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F9691] block mb-3">
            Timeline Milestones (Click node to inspect)
          </span>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative">
            {timelineEvents.map((ev, idx) => {
              const isSelected = selectedEventIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedEventIndex(idx)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-[#1D211F] border-[#C9FF3D] shadow-[0_0_15px_rgba(201,255,61,0.2)]'
                      : 'bg-[#171A18]/80 hover:bg-[#171A18] border-[#292D2B] hover:border-[#8F9691]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-[#8F9691] group-hover:text-[#F5F7F5]">
                      {ev.period}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: ev.color }}
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-bold font-mono text-[#F5F7F5] block">
                      {ev.value}
                    </span>
                    <span className="text-[10px] text-[#8F9691] truncate block">
                      {ev.title}
                    </span>
                  </div>

                  <span
                    className={`mt-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-center block ${
                      ev.status === 'critical'
                        ? 'bg-[#FF7777]/20 text-[#FF7777]'
                        : ev.status === 'warning'
                        ? 'bg-[#FFBD59]/20 text-[#FFBD59]'
                        : 'bg-[#79DF9B]/20 text-[#79DF9B]'
                    }`}
                  >
                    {ev.statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestone Detail Card */}
        <div className="p-5 rounded-2xl bg-[#171A18] border border-[#292D2B] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#292D2B]">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-[#F5F7F5] font-mono">
                  {activeEvent.title} — {activeEvent.date}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                  style={{
                    backgroundColor: `${activeEvent.color}20`,
                    color: activeEvent.color,
                    border: `1px solid ${activeEvent.color}40`
                  }}
                >
                  {activeEvent.statusLabel}
                </span>
              </div>
              <p className="text-xs text-[#8F9691] mt-0.5 font-sans">
                {activeEvent.notes}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-lg font-mono font-extrabold text-[#F5F7F5]">
                {activeEvent.value}
              </span>
              {activeEvent.delta && (
                <span className="text-[10px] font-mono block text-[#FF7777] font-bold">
                  {activeEvent.delta}
                </span>
              )}
            </div>
          </div>

          {/* Verbatim Source Evidence */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#8F9691]">
              <div className="flex items-center space-x-1.5 text-[#C9FF3D]">
                <FileText className="w-3.5 h-3.5" />
                <span className="font-semibold">{activeEvent.source} (Page {activeEvent.page})</span>
              </div>
              <span>Deterministic Document Citation</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0D0F0E] border border-[#292D2B] text-xs text-[#F5F7F5]/90 italic leading-relaxed">
              <span className="text-[10px] font-mono not-italic text-[#FFBD59] block mb-1 uppercase tracking-wider">
                Verbatim Primary Source Extract:
              </span>
              "{activeEvent.quote}"
            </div>
          </div>

          {/* If Critical, Show Conflict Explanation and Action Button */}
          {activeEvent.status === 'critical' && (
            <div className="p-4 rounded-xl bg-[#FF7777]/10 border border-[#FF7777]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start space-x-2.5 text-xs text-[#FF7777]">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono font-bold block">Temporal Variance Alert</span>
                  <span className="font-sans text-[#F5F7F5]/90 text-[11px]">
                    The ₹18.4L loan application breaches the sanctioned ₹15.0L scheme subsidy ceiling by ₹3,40,000 without corresponding co-promoter collateral.
                  </span>
                </div>
              </div>

              {onInspectEvidence && (
                <button
                  onClick={() => {
                    onClose();
                    onInspectEvidence(nexusData.recentIntelligence[0]);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#C9FF3D] hover:bg-[#bbf030] text-[#0D0F0E] font-bold text-xs font-mono uppercase tracking-wider whitespace-nowrap shadow-[0_0_12px_rgba(201,255,61,0.3)]"
                >
                  Inspect in Evidence Drawer
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#292D2B] flex items-center justify-between text-xs font-mono">
          <span className="text-[#8F9691] text-[11px]">
            4 chronological revisions reconciled by Member 2 Temporal Analyzer
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#1D211F] hover:bg-[#292D2B] text-[#F5F7F5] border border-[#292D2B] transition-colors"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
