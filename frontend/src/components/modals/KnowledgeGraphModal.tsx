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
  Maximize2,
  User,
  Building2,
  Boxes,
  ExternalLink,
  Users,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { DocumentItem } from '../../types/nexus';

interface KnowledgeGraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInspectEvidence?: () => void;
  documents?: DocumentItem[];
  onOpenReport?: (type: 'ALL' | 'DOCUMENT' | 'BATCH', id: string, name: string) => void;
}

export const KnowledgeGraphModal: React.FC<KnowledgeGraphModalProps> = ({
  isOpen,
  onClose,
  onInspectEvidence,
  documents = [],
  onOpenReport
}) => {
  const [selectedEntityId, setSelectedEntityId] = useState<string>('arjun_mehta');
  const [zoom, setZoom] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'ACCOUNT_HUB'>('GRAPH');

  if (!isOpen) return null;

  // Rich Entity Accounts & Shared Intersection Map
  const entityAccounts: Record<string, any> = {
    arjun_mehta: {
      id: 'arjun_mehta',
      name: "Arjun Mehta",
      role: "Managing Director & Principal Applicant",
      category: "PERSON",
      avatar: "AM",
      avatarColor: "bg-[#C9FF3D] text-[#0D0F0E]",
      linkedBatches: [
        { batchId: "batch-kyc-1", batchName: "Batch 1: KYC & Identity Verification", filesCount: 3 },
        { batchId: "batch-fin-2", batchName: "Batch 2: Financial Audit & Application", filesCount: 4 }
      ],
      linkedFiles: [
        { name: "Applicant_Form.pdf", page: 2, snippet: "Executive salary: ₹42,000 / mo claimed" },
        { name: "Director_Aadhaar_PAN_KYC_Verification.pdf", page: 1, snippet: "UIDAI / PAN verified" },
        { name: "Board_Resolution_Authorizing_Borrowing.pdf", page: 1, snippet: "Authorized signatory for ₹18.4L facility" }
      ],
      sharedConnections: [
        {
          withEntity: "Dr. Rajesh Varma",
          relationship: "Co-Director & Joint Guarantor",
          sharedFact: "Shares 50/50 corporate equity in Solaria Energy and co-signed Board Resolution dated Oct 8."
        },
        {
          withEntity: "Solaria Energy LLP",
          relationship: "Managing Director & Controlling Shareholder",
          sharedFact: "Holds 62.5% voting rights and executive drawing rights."
        },
        {
          withEntity: "HDFC Commercial Bank",
          relationship: "Current Account Signatory",
          sharedFact: "Operating signatory for verified commercial bank account #9821."
        },
        {
          withEntity: "Cyber Towers Suite 402",
          relationship: "Shared Registered Corporate Address",
          sharedFact: "Common business address cited across tax returns, GST filings, and electricity NOCs."
        }
      ],
      keyFacts: [
        "Declared Monthly Draw: ₹42,000 / mo",
        "Verified Bank Inflow: ₹31,500 / mo (33.3% variance)",
        "PAN Identifier: ABCPM8921K (Verified)",
        "Authorized Loan Exposure: ₹18,40,000"
      ],
      varianceFlag: "Income mismatch of ₹10,500/mo between declared application and verified bank ledger."
    },
    rajesh_varma: {
      id: 'rajesh_varma',
      name: "Dr. Rajesh Varma",
      role: "Co-Promoter & Loan Guarantor",
      category: "PERSON",
      avatar: "RV",
      avatarColor: "bg-[#38BDF8] text-[#0D0F0E]",
      linkedBatches: [
        { batchId: "batch-kyc-1", batchName: "Batch 1: KYC & Identity Verification", filesCount: 2 },
        { batchId: "batch-legal-3", batchName: "Batch 3: Legal Instruments & Resolutions", filesCount: 2 }
      ],
      linkedFiles: [
        { name: "Board_Resolution_Authorizing_Borrowing.pdf", page: 2, snippet: "Co-promoter approval & quorum confirmation" },
        { name: "Guarantor_Deed_Affidavit.pdf", page: 1, snippet: "Personal guarantee pledged for credit line" }
      ],
      sharedConnections: [
        {
          withEntity: "Arjun Mehta",
          relationship: "Co-Director & Business Partner",
          sharedFact: "Co-signatory on corporate borrowing resolution and co-founder of Solaria Energy."
        },
        {
          withEntity: "Solaria Energy LLP",
          relationship: "Founding Partner & Guarantor",
          sharedFact: "Guaranteed ₹18.4L commercial credit line with personal unencumbered assets."
        }
      ],
      keyFacts: [
        "Guarantor Net Worth: ₹82,00,000",
        "Pledged Guarantee: ₹18,40,000",
        "Directorship Tenure: 4 Years 8 Months",
        "Regulatory KYC Status: Verified Clear"
      ],
      varianceFlag: null
    },
    solaria_energy: {
      id: 'solaria_energy',
      name: "Solaria Energy LLP",
      role: "Principal Borrowing Commercial Entity",
      category: "ORGANIZATION",
      avatar: "SE",
      avatarColor: "bg-[#79DF9B] text-[#0D0F0E]",
      linkedBatches: [
        { batchId: "batch-fin-2", batchName: "Batch 2: Financial Audit & Application", filesCount: 5 },
        { batchId: "batch-tax-4", batchName: "Batch 4: GST & Ministry Filings", filesCount: 3 }
      ],
      linkedFiles: [
        { name: "Financial_Audit_2025.pdf", page: 1, snippet: "Annual turnover: ₹14.2 Cr reported" },
        { name: "GST_Return_Annual.pdf", page: 3, snippet: "GST turnover: ₹13.9 Cr (2.1% variance)" },
        { name: "Electricity_Tariff_Subsidy_NOC.pdf", page: 1, snippet: "Renewable energy tariff subsidy clearance" }
      ],
      sharedConnections: [
        {
          withEntity: "Arjun Mehta",
          relationship: "Managing Director",
          sharedFact: "Operated by Arjun Mehta as designated partner."
        },
        {
          withEntity: "Dr. Rajesh Varma",
          relationship: "Guarantor",
          sharedFact: "Secured by Dr. Rajesh Varma under corporate credit terms."
        },
        {
          withEntity: "HDFC Commercial Bank",
          relationship: "Lending Facility Provider",
          sharedFact: "Maintains primary liquidity escrow and active overdraft line."
        }
      ],
      keyFacts: [
        "Annual Gross Turnover: ₹14.2 Cr",
        "GST Compliance Rate: 98.4%",
        "Active Subsidy Ceiling: ₹15.0L (Ministry Sanction)",
        "Facility Requested: ₹18.4L"
      ],
      varianceFlag: "Loan application exceeds Ministry grant ceiling cap of ₹15.0L by ₹3.4L."
    }
  };

  const activeEntity = entityAccounts[selectedEntityId] || entityAccounts.arjun_mehta;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] glass-panel-nexus rounded-3xl border border-[#C9FF3D]/30 p-5 sm:p-7 flex flex-col justify-between shadow-2xl space-y-4 overflow-hidden">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292D2B] flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-[#F5F7F5] font-mono">
                  Multi-Entity Knowledge Graph & Account Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#C9FF3D]/15 text-[#C9FF3D] border border-[#C9FF3D]/30 text-[10px] font-mono font-bold">
                  Batch & Entity Connected
                </span>
              </div>
              <p className="text-[11px] text-[#8F9691] font-sans">
                Explore cross-file links, shared connections, and individual entity profiles
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#171A18] rounded-xl p-1 border border-[#292D2B]">
              <button
                type="button"
                onClick={() => setActiveTab('GRAPH')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1 ${
                  activeTab === 'GRAPH'
                    ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold shadow-sm'
                    : 'text-[#8F9691] hover:text-white'
                }`}
              >
                <Share2 className="w-3 h-3" />
                <span>Network Graph</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ACCOUNT_HUB')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1 ${
                  activeTab === 'ACCOUNT_HUB'
                    ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold shadow-sm'
                    : 'text-[#8F9691] hover:text-white'
                }`}
              >
                <Users className="w-3 h-3" />
                <span>Entity Accounts & Links</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#8F9691] hover:text-[#F5F7F5] hover:bg-[#1D211F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Entity Account Selector Bar */}
        <div className="py-2 border-b border-[#292D2B] flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-[#111312]/70 px-3 rounded-2xl flex-shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-[#8F9691] text-[11px] uppercase">Select Entity Account:</span>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(entityAccounts).map((entity: any) => (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => setSelectedEntityId(entity.id)}
                  className={`px-3 py-1 rounded-xl text-xs font-mono transition-all flex items-center space-x-2 cursor-pointer ${
                    selectedEntityId === entity.id
                      ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold shadow-[0_0_12px_rgba(201,255,61,0.3)]'
                      : 'bg-[#171A18] text-[#8F9691] hover:text-white border border-[#292D2B]'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-md text-[9px] flex items-center justify-center font-bold ${
                    selectedEntityId === entity.id ? 'bg-[#0D0F0E] text-[#C9FF3D]' : entity.avatarColor
                  }`}>
                    {entity.avatar}
                  </span>
                  <span>{entity.name}</span>
                </button>
              ))}
            </div>
          </div>

          <span className="text-[10px] text-[#8F9691]">
            {activeEntity.sharedConnections.length} shared connection(s) mapped
          </span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 min-h-0 overflow-y-auto">
          {activeTab === 'GRAPH' ? (
            /* Graph Canvas + Entity Profile Panel */
            <>
              {/* Interactive Graph Canvas (7 cols) */}
              <div className="md:col-span-7 bg-[#0D0F0E] rounded-2xl border border-[#292D2B] relative overflow-hidden flex items-center justify-center select-none min-h-[350px]">
                {/* Zoom Controls */}
                <div className="absolute top-3 right-3 z-30 flex items-center space-x-1.5 p-1 rounded-xl bg-[#171A18]/90 border border-[#292D2B] backdrop-blur-md shadow-lg">
                  <button
                    type="button"
                    onClick={() => setZoom(z => Math.max(0.65, Number((z - 0.15).toFixed(2))))}
                    className="p-1.5 rounded-lg text-[#8F9691] hover:text-[#F5F7F5] transition-colors"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-[#C9FF3D] px-1">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom(z => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
                    className="p-1.5 rounded-lg text-[#8F9691] hover:text-[#F5F7F5] transition-colors"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* SVG Visual Network */}
                <div
                  className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
                >
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 350">
                    <line x1="250" y1="175" x2="120" y2="90" stroke="#C9FF3D" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 4" />
                    <line x1="250" y1="175" x2="120" y2="260" stroke="#C9FF3D" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 4" />
                    <line x1="250" y1="175" x2="380" y2="90" stroke="#38BDF8" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 4" />
                    <line x1="250" y1="175" x2="380" y2="260" stroke="#79DF9B" strokeWidth="1.5" opacity="0.6" strokeDasharray="4 4" />
                    
                    {/* Shared link bridge */}
                    <line x1="120" y1="90" x2="380" y2="90" stroke="#FFBD59" strokeWidth="1.5" opacity="0.7" strokeDasharray="2 2" />
                    <text x="250" y="80" fill="#FFBD59" fontSize="9" fontFamily="monospace" textAnchor="middle">
                      SHARED DIRECTORSHIP & EQUITY
                    </text>
                  </svg>

                  {/* Central Active Node */}
                  <div
                    className="absolute z-20 px-4 py-2 rounded-2xl bg-[#111312] border-2 border-[#C9FF3D] text-[#C9FF3D] shadow-[0_0_25px_rgba(201,255,61,0.4)] font-mono text-xs font-bold flex items-center space-x-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#C9FF3D] animate-ping" />
                    <span>{activeEntity.name}</span>
                  </div>

                  {/* Node: Rajesh Varma (Top Right) */}
                  <div
                    onClick={() => setSelectedEntityId('rajesh_varma')}
                    className="absolute right-8 top-10 z-10 p-2.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] border border-[#38BDF8]/60 text-xs font-mono text-white cursor-pointer transition-all hover:scale-105"
                  >
                    <div className="flex items-center space-x-1.5">
                      <User className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Dr. Rajesh Varma</span>
                    </div>
                  </div>

                  {/* Node: Solaria Energy (Bottom Right) */}
                  <div
                    onClick={() => setSelectedEntityId('solaria_energy')}
                    className="absolute right-8 bottom-10 z-10 p-2.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] border border-[#79DF9B]/60 text-xs font-mono text-white cursor-pointer transition-all hover:scale-105"
                  >
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#79DF9B]" />
                      <span>Solaria Energy LLP</span>
                    </div>
                  </div>

                  {/* Node: Bank Account (Top Left) */}
                  <div className="absolute left-8 top-10 z-10 p-2.5 rounded-xl bg-[#171A18] border border-[#292D2B] text-xs font-mono text-white">
                    <div className="flex items-center space-x-1.5">
                      <Landmark className="w-3.5 h-3.5 text-[#C9FF3D]" />
                      <span>Account #9821</span>
                    </div>
                  </div>

                  {/* Node: Address & Identity (Bottom Left) */}
                  <div className="absolute left-8 bottom-10 z-10 p-2.5 rounded-xl bg-[#171A18] border border-[#292D2B] text-xs font-mono text-white">
                    <div className="flex items-center space-x-1.5">
                      <Shield className="w-3.5 h-3.5 text-[#C9FF3D]" />
                      <span>Cyber Towers Suite 402</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Entity Account & Shared Links Panel (5 cols) */}
              <div className="md:col-span-5 space-y-3 font-mono text-xs overflow-y-auto pr-1">
                {/* Entity Profile Header */}
                <div className="p-4 rounded-2xl bg-[#141715] border border-[#292D2B] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${activeEntity.avatarColor}`}>
                        {activeEntity.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{activeEntity.name}</h4>
                        <span className="text-[10px] text-[#8F9691]">{activeEntity.role}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-[#C9FF3D]/10 text-[#C9FF3D] border border-[#C9FF3D]/20 font-bold">
                      {activeEntity.category}
                    </span>
                  </div>

                  {/* Variance notice if any */}
                  {activeEntity.varianceFlag && (
                    <div className="p-2.5 rounded-xl bg-[#FF7777]/10 border border-[#FF7777]/30 text-[10px] text-[#FF7777] flex items-start space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      <span>{activeEntity.varianceFlag}</span>
                    </div>
                  )}
                </div>

                {/* What This Entity Has in Common with Others */}
                <div className="p-3.5 rounded-2xl bg-[#141715] border border-[#292D2B] space-y-2.5">
                  <div className="flex items-center space-x-1.5 text-[#C9FF3D] font-bold text-[11px] uppercase tracking-wider">
                    <Users className="w-3.5 h-3.5" />
                    <span>Shared Links & What They Have in Common</span>
                  </div>

                  <div className="space-y-2 text-[10px]">
                    {activeEntity.sharedConnections.map((conn: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-1">
                        <div className="flex items-center justify-between text-white font-semibold">
                          <span className="text-[#C9FF3D]">With: {conn.withEntity}</span>
                          <span className="text-slate-400 text-[9px]">[{conn.relationship}]</span>
                        </div>
                        <p className="text-slate-300 font-sans leading-relaxed">{conn.sharedFact}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specific Upload Batches & Linked Files */}
                <div className="p-3.5 rounded-2xl bg-[#141715] border border-[#292D2B] space-y-2">
                  <div className="flex items-center space-x-1.5 text-[#38BDF8] font-bold text-[11px] uppercase tracking-wider">
                    <Boxes className="w-3.5 h-3.5" />
                    <span>Linked Upload Batches & Files</span>
                  </div>

                  <div className="space-y-1.5">
                    {activeEntity.linkedFiles.map((file: any, i: number) => (
                      <div key={i} className="p-2 rounded-xl bg-[#0D0F0E] border border-[#292D2B] flex items-center justify-between text-[10px]">
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-[#C9FF3D] flex-shrink-0" />
                          <span className="text-white truncate">{file.name}</span>
                          <span className="text-slate-500">P.{file.page}</span>
                        </div>

                        {onOpenReport && (
                          <button
                            type="button"
                            onClick={() => onOpenReport('DOCUMENT', file.name, file.name)}
                            className="px-2 py-0.5 rounded-lg bg-[#171A18] hover:bg-[#C9FF3D] hover:text-[#0D0F0E] text-[#C9FF3D] border border-[#C9FF3D]/30 transition-colors flex items-center space-x-1 cursor-pointer flex-shrink-0"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Report</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Full Multi-Entity Account Comparison Hub */
            <div className="md:col-span-12 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.values(entityAccounts).map((entity: any) => (
                  <div
                    key={entity.id}
                    className={`p-4 rounded-2xl bg-[#141715] border transition-all space-y-3 font-mono text-xs ${
                      selectedEntityId === entity.id
                        ? 'border-[#C9FF3D] shadow-[0_0_15px_rgba(201,255,61,0.15)]'
                        : 'border-[#292D2B] hover:border-[#8F9691]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${entity.avatarColor}`}>
                          {entity.avatar}
                        </div>
                        <div>
                          <h4 className="font-bold text-white">{entity.name}</h4>
                          <span className="text-[10px] text-[#8F9691]">{entity.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shared connections count */}
                    <div className="p-2.5 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-1 text-[10px]">
                      <span className="text-[#C9FF3D] font-bold block">Shared Connections ({entity.sharedConnections.length}):</span>
                      {entity.sharedConnections.map((c: any, idx: number) => (
                        <div key={idx} className="text-slate-300 flex items-start space-x-1">
                          <span className="text-[#C9FF3D]">•</span>
                          <span><strong>{c.withEntity}:</strong> {c.relationship}</span>
                        </div>
                      ))}
                    </div>

                    {/* Key facts */}
                    <div className="space-y-1 text-[10px]">
                      <span className="text-slate-400 block uppercase">Verified Parameters:</span>
                      {entity.keyFacts.map((fact: string, idx: number) => (
                        <div key={idx} className="text-slate-200 truncate">
                          • {fact}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEntityId(entity.id);
                        setActiveTab('GRAPH');
                      }}
                      className="w-full py-1.5 rounded-xl bg-[#1D211F] hover:bg-[#C9FF3D] hover:text-[#0D0F0E] text-[#C9FF3D] font-mono text-xs font-bold border border-[#292D2B] transition-all cursor-pointer text-center"
                    >
                      Inspect in Network Graph →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-[#292D2B] flex items-center justify-between flex-shrink-0 text-xs font-mono">
          <span className="text-[10px] text-[#8F9691]">
            NEXUS Constellation Engine • Cross-Document Entity Resolution
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] text-[#8F9691] hover:text-white border border-[#292D2B] transition-colors cursor-pointer"
          >
            Close Graph
          </button>
        </div>
      </div>
    </div>
  );
};
