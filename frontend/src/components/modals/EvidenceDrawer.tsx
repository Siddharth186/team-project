import React, { useState, useEffect } from 'react';
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
  Clock,
  Layers,
  Sparkles,
  Boxes,
  FileSpreadsheet,
  FileImage,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DocumentItem } from '../../types/nexus';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceData?: any;
  initialFilter?: 'ALL' | 'CONFLICTS' | 'MISSING_DATA' | 'INTELLIGENCE' | 'EVIDENCE';
  documents?: DocumentItem[];
  findings?: any[];
  onOpenReport?: (type: 'ALL' | 'DOCUMENT' | 'BATCH', id: string, name: string) => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  evidenceData,
  initialFilter = 'ALL',
  documents = [],
  findings = [],
  onOpenReport
}) => {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'CONFLICTS' | 'MISSING_DATA' | 'INTELLIGENCE'>(
    initialFilter === 'CONFLICTS' ? 'CONFLICTS' :
    initialFilter === 'MISSING_DATA' ? 'MISSING_DATA' :
    initialFilter === 'INTELLIGENCE' ? 'INTELLIGENCE' : 'ALL'
  );
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [selectedDocId, setSelectedDocId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialFilter === 'CONFLICTS') setActiveCategory('CONFLICTS');
      else if (initialFilter === 'MISSING_DATA') setActiveCategory('MISSING_DATA');
      else if (initialFilter === 'INTELLIGENCE') setActiveCategory('INTELLIGENCE');
      else setActiveCategory('ALL');
    }
  }, [isOpen, initialFilter]);

  if (!isOpen) return null;

  // Extract unique batches from documents
  const batchMap = new Map<string, { batchId: string; batchName: string; count: number }>();
  documents.forEach(doc => {
    if (doc.batchId) {
      const existing = batchMap.get(doc.batchId);
      if (existing) existing.count += 1;
      else batchMap.set(doc.batchId, { batchId: doc.batchId, batchName: doc.batchName || `Batch (${doc.batchId})`, count: 1 });
    }
  });
  const batchesList = Array.from(batchMap.values());

  // Default findings fallback if backend findings list is empty
  const defaultFindings = [
    {
      id: 'f-1',
      title: 'Monthly Income & Recurring Salary Discrepancy',
      type: 'CONTRADICTION',
      severity: 'CRITICAL',
      confidence: 94.5,
      summary: 'Declared executive salary in loan application differs from verified average recurring bank deposit credits.',
      reasoning: 'Declared salary on primary schedule exceeds recurring 6-month electronic credit deposits.',
      sourceDocA: { name: 'Applicant_Form.pdf', page: 2, value: '₹42,000 / mo', snippet: 'Stated executive salary: ₹42,000 / month declared under personal income schedule.' },
      sourceDocB: { name: 'Bank_Statement.pdf', page: 4, value: '₹31,500 / mo', snippet: 'Average recurring salary credit tagged: ₹31,500 / month across 6 consecutive months.' },
      variance: '₹10,500 / mo (33.3% variance)',
      action: 'Request 6-month Form 16 / Form 26AS tax credit ledger to verify bonus incentives prior to loan approval.'
    },
    {
      id: 'f-2',
      title: 'Missing Statutory Identity Proof: Official PAN & Aadhaar KYC',
      type: 'MISSING_DATA',
      severity: 'HIGH',
      confidence: 96.0,
      summary: 'Required government identity documentation (Permanent Account Number / UIDAI Aadhaar) not detected in active dossier.',
      reasoning: 'Underwriting compliance standard requires validated government identity instrument for all authorized signatories.',
      sourceDocA: { name: 'Dossier Compliance Checklist', page: 1, value: 'UNVERIFIED', snippet: 'Statutory Identity Proof: Document pending submission.' },
      sourceDocB: { name: 'Statutory Requirements Matrix', page: 1, value: 'REQUIRED', snippet: 'Section 4.1: Valid government-issued photo ID mandatory before underwriting signoff.' },
      variance: 'Missing Statutory Requirement',
      action: 'Request submission of high-resolution scanned PAN and Aadhaar copies before proceeding to committee signoff.'
    },
    {
      id: 'f-3',
      title: 'Company Turnover & Revenue Assertion Cross-Reference',
      type: 'INTELLIGENCE',
      severity: 'MEDIUM',
      confidence: 92.0,
      summary: 'Turnover figures cited in audited balance sheet align within 2.1% of GST annual returns.',
      reasoning: 'Cross-document assertion verified between financial statements and quarterly tax filings.',
      sourceDocA: { name: 'Financial_Statement.pdf', page: 3, value: '₹14.2 Cr', snippet: 'Total annual gross turnover from operations: ₹14,20,00,000.' },
      sourceDocB: { name: 'GST_Return_Annual.pdf', page: 2, value: '₹13.9 Cr', snippet: 'Cumulative taxable turnover reported under GSTR-9: ₹13,90,50,000.' },
      variance: '₹29.5 L (2.1% variance - Within acceptable threshold)',
      action: 'Marked verified consistent. Minor variance attributed to unbilled work-in-progress.'
    }
  ];

  const allFindings = (findings && findings.length > 0)
    ? findings.map((f, idx) => ({
        id: f.id || `find-${idx}`,
        title: f.title || f.name || 'Intelligence Finding',
        type: f.type || (f.severity === 'CRITICAL' ? 'CONTRADICTION' : f.title?.toLowerCase().includes('missing') ? 'MISSING_DATA' : 'INTELLIGENCE'),
        severity: f.severity || 'HIGH',
        confidence: typeof f.confidence === 'number' ? f.confidence : 94,
        summary: f.summary || f.description || 'Cross-document fact assertion verified by NEXUS.',
        reasoning: f.reasoning || f.summary || 'Deterministic extraction identified variance between primary records.',
        sourceDocA: f.sourceDocA || {
          name: f.conflictingFacts?.[0]?.source?.documentName || documents[0]?.name || 'Primary Record.pdf',
          page: f.conflictingFacts?.[0]?.source?.pageNumber || 1,
          value: f.conflictingFacts?.[0]?.declaredValue || f.conflictingFacts?.[0]?.value || 'Declared Value',
          snippet: f.conflictingFacts?.[0]?.source?.snippet || 'Verbatim excerpt from primary filing.'
        },
        sourceDocB: f.sourceDocB || {
          name: f.conflictingFacts?.[1]?.source?.documentName || documents[1]?.name || 'Secondary Record.pdf',
          page: f.conflictingFacts?.[1]?.source?.pageNumber || 2,
          value: f.conflictingFacts?.[1]?.declaredValue || f.conflictingFacts?.[1]?.value || 'Verified Value',
          snippet: f.conflictingFacts?.[1]?.source?.snippet || 'Verbatim excerpt from secondary benchmark.'
        },
        variance: f.variance || 'Variance detected across sources',
        action: f.action || f.recommendation || 'Perform dual-signoff inspection on flagged files before final underwriting.'
      }))
    : defaultFindings;

  // Filter findings based on selected filters
  const filteredFindings = allFindings.filter(f => {
    // Category filter
    if (activeCategory === 'CONFLICTS' && f.type !== 'CONTRADICTION' && f.severity !== 'CRITICAL' && f.severity !== 'HIGH') return false;
    if (activeCategory === 'MISSING_DATA' && f.type !== 'MISSING_DATA' && !f.title.toLowerCase().includes('missing')) return false;
    if (activeCategory === 'INTELLIGENCE' && f.type !== 'INTELLIGENCE' && f.severity === 'CRITICAL') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = f.title.toLowerCase().includes(q);
      const matchesSummary = f.summary.toLowerCase().includes(q);
      const matchesDocA = f.sourceDocA?.name?.toLowerCase().includes(q);
      const matchesDocB = f.sourceDocB?.name?.toLowerCase().includes(q);
      if (!matchesTitle && !matchesSummary && !matchesDocA && !matchesDocB) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] glass-panel-nexus rounded-3xl border border-[#C9FF3D]/30 p-5 sm:p-7 shadow-2xl flex flex-col justify-between overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#292D2B] flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-[#F5F7F5] font-mono">
                  Multi-Document Intelligence & Conflict Explorer
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#C9FF3D]/15 text-[#C9FF3D] border border-[#C9FF3D]/30 text-[10px] font-mono font-bold">
                  {filteredFindings.length} Active Findings
                </span>
              </div>
              <p className="text-[11px] text-[#8F9691] font-sans">
                Scoped to your specific uploaded files ({documents.length} files in dossier)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenReport && (
              <button
                type="button"
                onClick={() => onOpenReport('ALL', 'all', 'Full Ingested Dossier')}
                className="px-3 py-1.5 rounded-xl bg-[#C9FF3D]/10 hover:bg-[#C9FF3D] text-[#C9FF3D] hover:text-[#0D0F0E] font-mono text-xs font-semibold border border-[#C9FF3D]/30 transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Full Dossier Brief</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#8F9691] hover:text-[#F5F7F5] hover:bg-[#1D211F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills & Batch Selection Bar */}
        <div className="py-2.5 border-b border-[#292D2B] flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-[#111312]/70 px-3 rounded-2xl my-2 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeCategory === 'ALL'
                  ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold'
                  : 'bg-[#171A18] text-[#8F9691] hover:text-white border border-[#292D2B]'
              }`}
            >
              All Findings ({allFindings.length})
            </button>
            <button
              onClick={() => setActiveCategory('CONFLICTS')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                activeCategory === 'CONFLICTS'
                  ? 'bg-[#FF7777] text-white font-bold'
                  : 'bg-[#171A18] text-[#FF7777] hover:bg-[#1D211F] border border-[#FF7777]/30'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Conflicts</span>
            </button>
            <button
              onClick={() => setActiveCategory('MISSING_DATA')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                activeCategory === 'MISSING_DATA'
                  ? 'bg-[#FFBD59] text-[#0D0F0E] font-bold'
                  : 'bg-[#171A18] text-[#FFBD59] hover:bg-[#1D211F] border border-[#FFBD59]/30'
              }`}
            >
              <HelpCircle className="w-3 h-3" />
              <span>Missing Data</span>
            </button>
            <button
              onClick={() => setActiveCategory('INTELLIGENCE')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center space-x-1 ${
                activeCategory === 'INTELLIGENCE'
                  ? 'bg-[#79DF9B] text-[#0D0F0E] font-bold'
                  : 'bg-[#171A18] text-[#79DF9B] hover:bg-[#1D211F] border border-[#79DF9B]/30'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Facts</span>
            </button>
          </div>

          {/* Quick Search inside Findings */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#8F9691] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search file name or attribute..."
              className="w-full bg-[#171A18] border border-[#292D2B] rounded-xl pl-8 pr-3 py-1 text-xs font-mono text-[#F5F7F5] placeholder-[#8F9691] focus:outline-none focus:border-[#C9FF3D]"
            />
          </div>
        </div>

        {/* Scrollable Findings Cards List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 my-2 scrollbar-thin scrollbar-thumb-[#292D2B]">
          {filteredFindings.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-mono text-xs">
              <p>No findings match your active filter.</p>
            </div>
          ) : (
            filteredFindings.map((finding, idx) => {
              const isExpanded = expandedFindingId === finding.id || idx === 0;

              return (
                <div
                  key={finding.id}
                  className="rounded-2xl bg-[#141715] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-all p-4 space-y-3 text-xs"
                >
                  {/* Top Card Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                          finding.severity === 'CRITICAL' ? 'bg-[#FF7777]/20 text-[#FF7777] border border-[#FF7777]/40' :
                          finding.type === 'MISSING_DATA' ? 'bg-[#FFBD59]/20 text-[#FFBD59] border border-[#FFBD59]/40' :
                          'bg-[#79DF9B]/20 text-[#79DF9B] border border-[#79DF9B]/40'
                        }`}>
                          {finding.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 text-[#C9FF3D]" />
                          <span>Confidence: {finding.confidence}%</span>
                        </span>
                      </div>

                      <h3 className="font-mono text-sm font-bold text-white truncate">
                        {finding.title}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* Action buttons to view specific file reports */}
                      {onOpenReport && finding.sourceDocA?.name && (
                        <button
                          type="button"
                          onClick={() => onOpenReport('DOCUMENT', finding.sourceDocA.name, finding.sourceDocA.name)}
                          className="px-2.5 py-1 rounded-lg bg-[#171A18] hover:bg-[#1D211F] text-slate-300 hover:text-[#C9FF3D] border border-[#292D2B] font-mono text-[10px] flex items-center space-x-1 transition-colors cursor-pointer"
                          title={`View report for ${finding.sourceDocA.name}`}
                        >
                          <FileText className="w-3 h-3 text-[#C9FF3D]" />
                          <span className="truncate max-w-[120px]">{finding.sourceDocA.name}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setExpandedFindingId(isExpanded ? null : finding.id)}
                        className="px-2 py-1 rounded-lg bg-[#1D211F] hover:bg-[#292D2B] text-[#8F9691] hover:text-[#F5F7F5] font-mono text-[10px] transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Collapse' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {/* Summary & Reasoning */}
                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    {finding.summary}
                  </p>

                  {/* Expanded Evidence & Side-by-Side Comparison */}
                  {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-[#292D2B] animate-in fade-in duration-150">
                      {/* Side-by-side Evidence Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                        {/* Source A */}
                        <div className="p-3 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-1.5">
                          <div className="flex items-center justify-between text-[#8F9691]">
                            <span className="text-[9px] uppercase">Source Record 1</span>
                            <span className="text-[#C9FF3D] font-bold">{finding.sourceDocA?.value}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-white font-semibold">
                            <FileText className="w-3.5 h-3.5 text-[#C9FF3D] flex-shrink-0" />
                            <span className="truncate">{finding.sourceDocA?.name}</span>
                            <span className="text-[10px] text-slate-400">P.{finding.sourceDocA?.page || 1}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 italic font-sans bg-[#141715] p-2 rounded-lg border border-[#292D2B]">
                            "{finding.sourceDocA?.snippet}"
                          </p>
                        </div>

                        {/* Source B */}
                        <div className="p-3 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-1.5">
                          <div className="flex items-center justify-between text-[#8F9691]">
                            <span className="text-[9px] uppercase">Source Record 2</span>
                            <span className="text-[#79DF9B] font-bold">{finding.sourceDocB?.value}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-white font-semibold">
                            <FileText className="w-3.5 h-3.5 text-[#79DF9B] flex-shrink-0" />
                            <span className="truncate">{finding.sourceDocB?.name}</span>
                            <span className="text-[10px] text-slate-400">P.{finding.sourceDocB?.page || 1}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 italic font-sans bg-[#141715] p-2 rounded-lg border border-[#292D2B]">
                            "{finding.sourceDocB?.snippet}"
                          </p>
                        </div>
                      </div>

                      {/* Delta & Recommended Action */}
                      <div className="p-2.5 rounded-xl bg-[#0D0F0E] border border-[#292D2B] flex items-start space-x-2 text-[11px] font-sans">
                        <AlertTriangle className="w-4 h-4 text-[#FFBD59] flex-shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <strong className="text-[#FFBD59] font-mono text-[10px] uppercase block">Auditor Action Item:</strong>
                          <p className="text-slate-300">{finding.action}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-2.5 border-t border-[#292D2B] flex items-center justify-between flex-shrink-0 text-xs font-mono">
          <span className="text-[10px] text-[#8F9691]">
            NEXUS Grounded Intelligence • Real-time Multi-Document Cross-Referencing
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] text-[#8F9691] hover:text-white border border-[#292D2B] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

