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
  ExternalLink,
  Boxes,
  User,
  Building2,
  Users
} from 'lucide-react';
import { DocumentItem } from '../../types/nexus';

interface TimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectEvidence?: (item?: any) => void;
  documents?: DocumentItem[];
  onOpenReport?: (type: 'ALL' | 'DOCUMENT' | 'BATCH', id: string, name: string) => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({
  isOpen,
  onClose,
  onInspectEvidence,
  documents = [],
  onOpenReport
}) => {
  const [selectedEventIndex, setSelectedEventIndex] = useState<number>(3); // Default to the conflicting milestone
  const [selectedFilterBatch, setSelectedFilterBatch] = useState<string>('all');

  if (!isOpen) return null;

  const timelineEvents = [
    {
      period: "JAN 2026",
      date: "12 Jan 2026",
      title: "Initial Budget Proposal Submission",
      value: "₹10,00,000",
      status: "baseline",
      statusLabel: "BASELINE FILING",
      color: "#79DF9B",
      batchId: "batch-1",
      batchName: "Batch 1: Initial Ingestion & Proposal",
      entityAccount: "Arjun Mehta (Managing Director)",
      entityAvatar: "AM",
      sharedEntities: ["Solaria Energy LLP"],
      source: "Project_Proposal_Draft.pdf",
      page: 1,
      quote: "Initial capital expenditure estimate approved for Project Alpha: ₹10,00,000 under MSME Scheme Tier-1.",
      notes: "Project initiated with standard subsidized loan ceiling. Filed by Arjun Mehta."
    },
    {
      period: "MAR 2026",
      date: "18 Mar 2026",
      title: "First Budget Escalation & Board Quorum",
      value: "₹12,00,000",
      delta: "+₹2,00,000 (+20%)",
      status: "revised",
      statusLabel: "APPROVED REVISION",
      color: "#79DF9B",
      batchId: "batch-2",
      batchName: "Batch 2: Board Minutes & Resolutions",
      entityAccount: "Dr. Rajesh Varma & Arjun Mehta",
      entityAvatar: "JOINT",
      sharedEntities: ["Arjun Mehta", "Dr. Rajesh Varma", "Solaria Energy LLP"],
      source: "Board_Meeting_Minutes.pdf",
      page: 4,
      quote: "Board resolved to increase budget to ₹12,00,000 to cover automated robotic inspection equipment.",
      notes: "Internal quorum passed unanimous escalation co-signed by both promoters."
    },
    {
      period: "JUN 2026",
      date: "04 Jun 2026",
      title: "Statutory Subsidy Ceiling Sanction",
      value: "₹15,00,000",
      delta: "+₹3,00,000 (+25%)",
      status: "warning",
      statusLabel: "STATUTORY CEILING CAP",
      color: "#FFBD59",
      batchId: "batch-3",
      batchName: "Batch 3: Ministry & Subvention NOCs",
      entityAccount: "Ministry of Renewable Energy (Sanction Authority)",
      entityAvatar: "MNRE",
      sharedEntities: ["Solaria Energy LLP", "HDFC Commercial Bank"],
      source: "Grant_Ceiling_Cap.pdf",
      page: 2,
      quote: "Revised grant eligibility capped strictly at ₹15,00,000. Maximum subvention threshold reached.",
      notes: "Reached the statutory maximum subsidy limit under Ministry guidelines."
    },
    {
      period: "OCT 2026",
      date: "08 Oct 2026",
      title: "Commercial Credit Application Submission",
      value: "₹18,40,000",
      delta: "+₹3,40,000 (CEILING BREACH)",
      status: "critical",
      statusLabel: "CONTRADICTION / BREACH",
      color: "#FF7777",
      batchId: "batch-4",
      batchName: "Batch 4: Commercial Loan Filings",
      entityAccount: "Arjun Mehta & Solaria Energy",
      entityAvatar: "AM",
      sharedEntities: ["Arjun Mehta", "Dr. Rajesh Varma (Guarantor)", "HDFC Commercial Bank"],
      source: "Commercial_Loan_Application.pdf",
      page: 2,
      quote: "Requested credit facility amount: ₹18,40,000 with 36-month repayment tenure.",
      notes: "Exceeds approved ₹15.0L grant cap by ₹3.4L without supplementary equity underwriting!"
    }
  ];

  const filteredEvents = selectedFilterBatch === 'all'
    ? timelineEvents
    : timelineEvents.filter(e => e.batchId === selectedFilterBatch);

  const activeEvent = timelineEvents[selectedEventIndex] || timelineEvents[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto glass-panel-nexus rounded-3xl border border-[#C9FF3D]/30 p-5 sm:p-7 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#292D2B]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-[#F5F7F5] font-mono">
                  Batch & Entity-Connected Audit Trajectory
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF7777]/15 text-[#FF7777] border border-[#FF7777]/30">
                  Ceiling Breach Detected
                </span>
              </div>
              <p className="text-[11px] text-[#8F9691] font-sans">
                Chronological sequence mapped across upload batches and shared entity accounts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8F9691] hover:text-[#F5F7F5] hover:bg-[#1D211F] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batch Filter Bar */}
        <div className="py-2 px-3 bg-[#111312]/70 rounded-2xl border border-[#292D2B] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="text-[#8F9691] text-[11px] uppercase">Filter by Batch:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedFilterBatch('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  selectedFilterBatch === 'all'
                    ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold'
                    : 'bg-[#171A18] text-[#8F9691] hover:text-white border border-[#292D2B]'
                }`}
              >
                All Batches
              </button>
              {timelineEvents.map((ev) => (
                <button
                  key={ev.batchId}
                  type="button"
                  onClick={() => setSelectedFilterBatch(ev.batchId)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedFilterBatch === ev.batchId
                      ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold'
                      : 'bg-[#171A18] text-[#8F9691] hover:text-white border border-[#292D2B]'
                  }`}
                >
                  {ev.batchName.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          <span className="text-[10px] text-[#8F9691]">
            {filteredEvents.length} chronological milestones
          </span>
        </div>

        {/* Interactive Stepper Track */}
        <div className="p-4 rounded-2xl bg-[#111312] border border-[#292D2B]">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F9691] block mb-3">
            Chronological Sequence (Tap milestone to inspect details)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 relative">
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
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-[#111312] text-[#8F9691] font-bold">
                        {ev.period}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                        style={{ color: ev.color, backgroundColor: `${ev.color}15` }}
                      >
                        {ev.statusLabel.split(' ')[0]}
                      </span>
                    </div>

                    <h4 className="font-mono text-xs font-bold text-[#F5F7F5] group-hover:text-[#C9FF3D] transition-colors line-clamp-2">
                      {ev.title}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#292D2B] flex items-center justify-between">
                    <span className="font-mono text-xs font-extrabold" style={{ color: ev.color }}>
                      {ev.value}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {ev.batchName.split(':')[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Milestone Inspector Card */}
        {activeEvent && (
          <div className="p-5 rounded-2xl bg-[#141715] border border-[#292D2B] space-y-4 font-mono text-xs">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292D2B]">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-[#C9FF3D]/15 text-[#C9FF3D] text-[10px] font-bold">
                    {activeEvent.batchName}
                  </span>
                  <span className="text-[#8F9691] text-[10px] flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{activeEvent.date}</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  {activeEvent.title}
                </h3>
              </div>

              <div className="flex items-center space-x-3 flex-shrink-0">
                <div className="text-right">
                  <span className="text-[9px] text-[#8F9691] block uppercase">Milestone Value</span>
                  <span className="text-base font-extrabold" style={{ color: activeEvent.color }}>
                    {activeEvent.value}
                  </span>
                </div>
                {activeEvent.delta && (
                  <span className="px-2 py-1 rounded-lg bg-[#FF7777]/20 text-[#FF7777] border border-[#FF7777]/40 text-[10px] font-bold">
                    {activeEvent.delta}
                  </span>
                )}
              </div>
            </div>

            {/* Entity Account & Shared Connections Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Entity in Charge */}
              <div className="p-3 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-1">
                <span className="text-[9px] uppercase text-[#8F9691] block">Primary Entity Account</span>
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <User className="w-3.5 h-3.5 text-[#C9FF3D]" />
                  <span>{activeEvent.entityAccount}</span>
                </div>
              </div>

              {/* Shared Intersecting Entities */}
              <div className="p-3 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-1">
                <span className="text-[9px] uppercase text-[#8F9691] block">Shared Intersecting Parties</span>
                <div className="flex flex-wrap gap-1">
                  {activeEvent.sharedEntities.map((ent: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-[#1D211F] text-[#38BDF8] text-[10px]">
                      {ent}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Grounded Source Excerpt */}
            <div className="p-3.5 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-2 text-white font-semibold">
                  <FileText className="w-3.5 h-3.5 text-[#C9FF3D]" />
                  <span>{activeEvent.source}</span>
                  <span className="text-slate-500">Page {activeEvent.page}</span>
                </div>

                {onOpenReport && (
                  <button
                    type="button"
                    onClick={() => onOpenReport('DOCUMENT', activeEvent.source, activeEvent.source)}
                    className="px-2.5 py-1 rounded-lg bg-[#171A18] hover:bg-[#C9FF3D] hover:text-[#0D0F0E] text-[#C9FF3D] border border-[#C9FF3D]/30 transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View File Report</span>
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-300 italic font-sans bg-[#141715] p-2.5 rounded-lg border border-[#292D2B]">
                "{activeEvent.quote}"
              </p>
              <p className="text-[11px] text-slate-400 font-sans">
                <strong>Analysis Note:</strong> {activeEvent.notes}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2.5 border-t border-[#292D2B] flex items-center justify-between flex-shrink-0 text-xs font-mono">
          <span className="text-[10px] text-[#8F9691]">
            NEXUS Temporal Trajectory Engine • Grounded Multi-Year Timeline
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] text-[#8F9691] hover:text-white border border-[#292D2B] transition-colors cursor-pointer"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
