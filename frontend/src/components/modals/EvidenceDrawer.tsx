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
  HelpCircle,
  Clock
} from 'lucide-react';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceData?: any;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  evidenceData
}) => {
  if (!isOpen) return null;

  // Default to Income Mismatch if no custom data passed
  const data = evidenceData?.evidence || {
    docA: { name: "Applicant_Form.pdf", page: 2, text: "Stated executive salary: ₹42,000 / month declared under personal income schedule.", val: "₹42,000" },
    docB: { name: "Bank_Statement.pdf", page: 4, text: "Average recurring salary credit tagged: ₹31,500 / month across 6 consecutive months.", val: "₹31,500" },
    variance: "₹10,500 / month (33.3% variance)",
    reason: "Declared salary on loan schedule exceeds verified bank deposit history."
  };

  const title = evidenceData?.title || "Income mismatch detected";
  const confidence = evidenceData?.confidence || 94;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel-nexus rounded-3xl border border-[#C9FF3D]/30 p-6 sm:p-7 shadow-2xl shadow-[#C9FF3D]/5 space-y-6">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-5 border-b border-[#292D2B]">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-3">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#FF7777]/15 text-[#FF7777] border border-[#FF7777]/30">
                CRITICAL CONTRADICTION
              </span>
              <span className="flex items-center space-x-1 text-xs text-[#C9FF3D] font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Confidence: {confidence}%</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7F5] font-sans tracking-wide">
              {title}
            </h2>
            <p className="text-xs text-[#8F9691]">
              Primary Source Dossier: <span className="text-[#C9FF3D] font-mono">Applicant Form vs Bank Statement</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8F9691] hover:text-[#F5F7F5] hover:bg-[#1D211F] border border-[#292D2B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core Question: "Why did NEXUS say this?" */}
        <div className="p-4 rounded-2xl bg-[#C9FF3D]/5 border border-[#C9FF3D]/25 space-y-2">
          <div className="flex items-center space-x-2 text-[#C9FF3D] font-mono text-xs uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span className="font-semibold">Why did NEXUS flag this? (Deterministic Grounding)</span>
          </div>
          <p className="text-sm text-[#F5F7F5] leading-relaxed font-sans">
            {data.reason}
          </p>

          {/* Variance Badge */}
          <div className="mt-3 pt-3 border-t border-[#292D2B] flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="bg-[#111312] px-3 py-1.5 rounded-lg border border-[#292D2B]">
              <span className="text-[#8F9691]">Declared: </span>
              <span className="text-[#FF7777] font-bold">{data.docA.val}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-[#8F9691]" />
            <div className="bg-[#111312] px-3 py-1.5 rounded-lg border border-[#292D2B]">
              <span className="text-[#8F9691]">Bank Verified: </span>
              <span className="text-[#79DF9B] font-bold">{data.docB.val}</span>
            </div>
            <div className="bg-[#FF7777]/15 px-3 py-1.5 rounded-lg border border-[#FF7777]/30 text-[#FF7777] font-bold">
              Delta: {data.variance}
            </div>
          </div>
        </div>

        {/* Side-by-Side Document Evidence Cards */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase font-mono tracking-wider text-[#8F9691] flex items-center space-x-2">
            <FileText className="w-4 h-4 text-[#C9FF3D]" />
            <span>Traceable Source Verification (Document → Page → Verbatim Quote)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Document A Card */}
            <div className="p-4 rounded-2xl bg-[#171A18] border border-[#292D2B] hover:border-[#C9FF3D]/30 transition-all space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono px-2 py-0.5 rounded bg-[#1D211F] text-[#8F9691] border border-[#292D2B]">
                  Source 1: Primary Application
                </span>
                <span className="text-[#C9FF3D] font-mono text-[11px]">Declared Val: {data.docA.val}</span>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <FileText className="w-4 h-4 text-[#C9FF3D] flex-shrink-0" />
                <span className="font-bold text-[#F5F7F5] truncate">{data.docA.name}</span>
                <span className="text-[10px] font-mono text-[#8F9691]">Page {data.docA.page}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0F0E] border border-[#292D2B] text-xs text-[#F5F7F5]/90 italic leading-relaxed">
                <span className="text-[10px] font-mono not-italic text-[#FFBD59] block mb-1 uppercase tracking-wider">
                  Verbatim Excerpt:
                </span>
                "{data.docA.text}"
              </div>
            </div>

            {/* Document B Card */}
            <div className="p-4 rounded-2xl bg-[#171A18] border border-[#292D2B] hover:border-[#C9FF3D]/30 transition-all space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono px-2 py-0.5 rounded bg-[#1D211F] text-[#8F9691] border border-[#292D2B]">
                  Source 2: Banking Verification
                </span>
                <span className="text-[#79DF9B] font-mono text-[11px]">Bank Val: {data.docB.val}</span>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <FileText className="w-4 h-4 text-[#79DF9B] flex-shrink-0" />
                <span className="font-bold text-[#F5F7F5] truncate">{data.docB.name}</span>
                <span className="text-[10px] font-mono text-[#8F9691]">Page {data.docB.page}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D0F0E] border border-[#292D2B] text-xs text-[#F5F7F5]/90 italic leading-relaxed">
                <span className="text-[10px] font-mono not-italic text-[#FFBD59] block mb-1 uppercase tracking-wider">
                  Verbatim Excerpt:
                </span>
                "{data.docB.text}"
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Human Action */}
        <div className="p-4 rounded-2xl bg-[#111312] border border-[#292D2B] flex items-start space-x-3 text-xs">
          <AlertTriangle className="w-5 h-5 text-[#FFBD59] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-mono uppercase tracking-wider text-[#FFBD59] font-bold">
              Recommended Underwriter Action
            </h4>
            <p className="text-[#8F9691] leading-relaxed font-sans">
              Request 6-month Form 16 / Form 26AS tax credit ledger to verify whether the ₹10,500 difference comprises deferred bonus incentives or unfiled statutory deductions before loan approval.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#292D2B] flex items-center justify-between">
          <span className="text-[11px] text-[#8F9691] font-mono">
            Verified by NEXUS Deterministic Intelligence Engine
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#C9FF3D] hover:bg-[#bbf030] text-[#0D0F0E] font-bold text-xs tracking-wider uppercase font-mono transition-all shadow-[0_0_15px_rgba(201,255,61,0.25)]"
          >
            Close Investigation
          </button>
        </div>
      </div>
    </div>
  );
};
