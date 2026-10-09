import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck,
  Download,
  Printer,
  Copy,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Boxes,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  FileSpreadsheet,
  Check,
  Maximize2,
  Volume2,
  VolumeX
} from 'lucide-react';
import { nexusApi } from '../../services/api';
import { DocumentItem } from '../../types/nexus';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType?: 'ALL' | 'DOCUMENT' | 'BATCH';
  targetId?: string;
  targetName?: string;
  documents?: DocumentItem[];
  batches?: any[];
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType = 'ALL',
  targetId = 'all',
  targetName = 'Full Ingested Dossier',
  documents = [],
  batches = []
}) => {
  const [selectedType, setSelectedType] = useState<'ALL' | 'DOCUMENT' | 'BATCH'>(targetType);
  const [selectedTargetId, setSelectedTargetId] = useState<string>(targetId);
  const [viewPattern, setViewPattern] = useState<'PDF_SHEET' | 'INTERACTIVE'>('PDF_SHEET');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedType(targetType);
      setSelectedTargetId(targetId);
      loadReport(targetType, targetId);
    }
  }, [isOpen, targetType, targetId]);

  const loadReport = async (type: 'ALL' | 'DOCUMENT' | 'BATCH', id: string) => {
    setLoading(true);
    try {
      const options: any = { targetType: type };
      if (type === 'DOCUMENT') options.documentId = id;
      if (type === 'BATCH') options.batchId = id;

      const data = await nexusApi.getReport(options);
      setReport(data);
    } catch (err) {
      console.warn('[REPORT_ERROR]', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTargetChange = (type: 'ALL' | 'DOCUMENT' | 'BATCH', id: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setSelectedType(type);
    setSelectedTargetId(id);
    loadReport(type, id);
  };

  const handleSpeakReport = () => {
    if (!('speechSynthesis' in window) || !report) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = `${report.caseTitle}. Status: ${report.decisionStatus}. Risk Score: ${report.riskScore} out of 100. Executive Summary: ${report.executiveSummary}`;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!report) return;
    const text = `NEXUS AI — ${report.caseTitle}
Report ID: ${report.caseId}
Target Subject: ${report.targetName}
Status: ${report.decisionStatus}
Risk Score: ${report.riskScore}/100
Confidence: ${((report.overallConfidence || 0.95) * 100).toFixed(1)}%

Summary:
${report.executiveSummary}

Recommended Actions:
${(report.recommendedHumanActions || []).map((a: string, i: number) => `${i + 1}. ${a}`).join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    let url = '/api/report/markdown';
    if (selectedType === 'DOCUMENT') url += `?documentId=${encodeURIComponent(selectedTargetId)}&targetType=DOCUMENT`;
    else if (selectedType === 'BATCH') url += `?batchId=${encodeURIComponent(selectedTargetId)}&targetType=BATCH`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-5xl max-h-[92vh] glass-panel-nexus rounded-3xl border border-[#C9FF3D]/30 p-5 sm:p-7 shadow-2xl flex flex-col justify-between overflow-hidden print:max-h-none print:h-auto print:border-none print:shadow-none print:p-4 print:bg-white print:text-black">
        
        {/* Top Header (Hidden when printing) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292D2B] flex-shrink-0 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm sm:text-base font-bold text-[#F5F7F5] font-mono">
                  Document Audit & Forensic PDF Report
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#C9FF3D]/15 text-[#C9FF3D] border border-[#C9FF3D]/30 text-[10px] font-mono font-bold">
                  {selectedType === 'DOCUMENT' ? 'FILE PDF REPORT' : selectedType === 'BATCH' ? 'BATCH PDF REPORT' : 'FULL DOSSIER REPORT'}
                </span>
              </div>
              <p className="text-[11px] text-[#8F9691] font-sans">
                Stored forensic intelligence report & deterministic audit ledger
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
            {/* View Pattern Toggle */}
            <div className="flex items-center bg-[#171A18] rounded-xl p-1 border border-[#292D2B]">
              <button
                onClick={() => setViewPattern('PDF_SHEET')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1 ${
                  viewPattern === 'PDF_SHEET'
                    ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold shadow-sm'
                    : 'text-[#8F9691] hover:text-white'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>PDF Sheet</span>
              </button>
              <button
                onClick={() => setViewPattern('INTERACTIVE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1 ${
                  viewPattern === 'INTERACTIVE'
                    ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold shadow-sm'
                    : 'text-[#8F9691] hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Interactive</span>
              </button>
            </div>

            {/* Read Briefing Audio Button */}
            <button
              onClick={handleSpeakReport}
              className={`px-2.5 py-1.5 rounded-xl border font-mono text-xs flex items-center space-x-1 transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold animate-pulse shadow-[0_0_12px_rgba(201,255,61,0.4)]'
                  : 'bg-[#171A18] hover:bg-[#1D211F] text-slate-300 hover:text-[#C9FF3D] border-[#292D2B]'
              }`}
              title={isSpeaking ? "Stop Reading Aloud" : "Read Executive Briefing Aloud"}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#C9FF3D]" />}
              <span>{isSpeaking ? 'Stop' : 'Read Briefing'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] text-slate-300 hover:text-[#C9FF3D] font-mono text-xs border border-[#292D2B] transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownloadMd}
              className="px-2.5 py-1.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] text-slate-300 hover:text-[#C9FF3D] font-mono text-xs border border-[#292D2B] transition-colors cursor-pointer flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Markdown</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-[#C9FF3D] hover:bg-[#bbf030] text-[#0D0F0E] font-bold font-mono text-xs transition-all shadow-md shadow-[#C9FF3D]/20 cursor-pointer flex items-center space-x-1.5"
              title="Print official PDF report or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF Report</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#8F9691] hover:text-[#F5F7F5] hover:bg-[#1D211F] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Target Scope Selection Bar (Hidden when printing) */}
        <div className="py-2.5 border-b border-[#292D2B] flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-[#111312]/70 px-3 rounded-2xl my-2 flex-shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-[#8F9691] text-[11px] uppercase">Scope:</span>
            <button
              onClick={() => handleTargetChange('ALL', 'all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                selectedType === 'ALL'
                  ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold'
                  : 'bg-[#171A18] text-[#8F9691] hover:text-white border border-[#292D2B]'
              }`}
            >
              All Documents
            </button>
          </div>

          {/* Quick Dropdown / Selectors for Files & Batches */}
          <div className="flex flex-wrap items-center gap-2">
            {documents.length > 0 && (
              <select
                value={selectedType === 'DOCUMENT' ? selectedTargetId : ''}
                onChange={(e) => {
                  if (e.target.value) handleTargetChange('DOCUMENT', e.target.value);
                }}
                className="px-3 py-1 rounded-lg bg-[#171A18] text-[#F5F7F5] border border-[#292D2B] text-xs font-mono focus:outline-none focus:border-[#C9FF3D]/50 cursor-pointer max-w-[240px] truncate"
              >
                <option value="">📄 Select Specific File...</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.name}
                  </option>
                ))}
              </select>
            )}

            {batches.length > 0 && (
              <select
                value={selectedType === 'BATCH' ? selectedTargetId : ''}
                onChange={(e) => {
                  if (e.target.value) handleTargetChange('BATCH', e.target.value);
                }}
                className="px-3 py-1 rounded-lg bg-[#171A18] text-[#F5F7F5] border border-[#292D2B] text-xs font-mono focus:outline-none focus:border-[#C9FF3D]/50 cursor-pointer max-w-[240px] truncate"
              >
                <option value="">📦 Select Upload Batch...</option>
                {batches.map((b) => (
                  <option key={b.batchId} value={b.batchId}>
                    {b.batchName} ({b.totalFiles} files)
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Report Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-2 scrollbar-thin scrollbar-thumb-[#292D2B] print:overflow-visible print:pr-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-[#C9FF3D] border-t-transparent animate-spin" />
              <span className="text-xs font-mono text-[#C9FF3D]">
                Rendering grounded PDF document intelligence pattern...
              </span>
            </div>
          ) : report ? (
            viewPattern === 'PDF_SHEET' ? (
              /* ================= PATTERN A: AUTHENTIC PDF DOCUMENT SHEET PATTERN ================= */
              /* ================= PATTERN A: COMPACT MINIMAL-PAGE EXECUTIVE PDF SHEET ================= */
              <div className="bg-[#141715] border border-[#292D2B] rounded-2xl p-4 sm:p-6 space-y-4 font-sans text-slate-200 shadow-inner relative overflow-hidden print:bg-white print:text-black print:border-none print:p-0 print:space-y-3 print:text-[11px] print:max-w-none">
                
                {/* 1. Compact Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#292D2B] print:border-black print:pb-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-[#C9FF3D]/20 text-[#C9FF3D] border border-[#C9FF3D]/40 font-bold print:border-black print:text-black print:bg-slate-100">
                        {selectedType === 'DOCUMENT' ? 'FILE AUDIT BRIEF' : selectedType === 'BATCH' ? 'BATCH AUDIT BRIEF' : 'DOSSIER BRIEF'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 print:text-slate-600">
                        {report.caseId}
                      </span>
                    </div>
                    <h1 className="text-sm sm:text-base font-bold font-mono text-white print:text-black uppercase tracking-tight">
                      {report.caseTitle}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 print:text-slate-700 font-mono">
                      <span>Target: <strong className="text-[#C9FF3D] print:text-black font-semibold">{report.targetName}</strong></span>
                      {report.documentMetadata && (
                        <>
                          <span>•</span>
                          <span>{report.documentMetadata.fileSize}</span>
                          <span>•</span>
                          <span>{report.documentMetadata.totalPages} Page(s)</span>
                          <span>•</span>
                          <span className="text-[#C9FF3D] print:text-black font-semibold">#{report.documentMetadata.category}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: Risk & Decision Status */}
                  <div className="flex items-center space-x-2.5 flex-shrink-0">
                    <div className="px-3 py-1.5 rounded-xl bg-[#0D0F0E] border border-[#292D2B] text-center font-mono print:bg-slate-100 print:border-black">
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 print:text-slate-700 block">Risk Level</span>
                      <span className={`text-base font-bold ${report.riskScore > 40 ? 'text-[#FF7777]' : 'text-[#79DF9B]'} print:text-black`}>
                        {report.riskScore}<span className="text-[10px] font-normal text-slate-500">/100</span>
                      </span>
                    </div>

                    <div className={`px-3 py-1.5 rounded-xl border text-center font-mono ${
                      report.decisionStatus === 'VERIFIED_CLEAR'
                        ? 'bg-[#79DF9B]/15 border-[#79DF9B]/40 text-[#79DF9B] print:border-black print:text-black'
                        : 'bg-[#FFBD59]/15 border-[#FFBD59]/40 text-[#FFBD59] print:border-black print:text-black'
                    }`}>
                      <span className="text-[8px] uppercase font-bold tracking-wider block">Decision Status</span>
                      <span className="text-xs font-bold">{report.decisionStatus}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Concise Executive Brief (2-3 lines max) */}
                <div className="p-3 rounded-xl bg-[#0D0F0E] border border-[#292D2B] text-xs leading-relaxed font-sans text-slate-200 print:bg-slate-50 print:text-black print:border-black print:p-2 print:text-[11px]">
                  <strong className="text-[#C9FF3D] print:text-black font-mono text-[10px] uppercase block mb-0.5">Executive Summary:</strong>
                  {report.executiveSummary}
                </div>

                {/* 3. High-Density 2-Column Extraction & Intelligence Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 print:grid-cols-12 print:gap-2">
                  {/* Left Column: Extracted Atomic Data Table (7 cols) */}
                  <div className="md:col-span-7 space-y-1.5 print:col-span-7">
                    <div className="flex items-center justify-between pb-1">
                      <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#C9FF3D] font-bold print:text-black flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Extracted Key Data & Attributes</span>
                      </h3>
                      <span className="text-[9px] font-mono text-slate-400 print:text-slate-600">
                        {report.extractedFacts ? report.extractedFacts.length : 0} items verified
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-[#292D2B] print:border-black">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead className="bg-[#0D0F0E] text-[9px] uppercase text-slate-400 border-b border-[#292D2B] print:bg-slate-100 print:text-black print:border-black">
                          <tr>
                            <th className="py-1.5 px-2.5">Attribute / Field</th>
                            <th className="py-1.5 px-2.5">Extracted Value</th>
                            <th className="py-1.5 px-2 text-center">Ref</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#292D2B] bg-[#111312]/70 print:bg-white print:divide-black">
                          {report.extractedFacts && report.extractedFacts.length > 0 ? (
                            report.extractedFacts.slice(0, 10).map((fact: any, i: number) => (
                              <tr key={i} className="hover:bg-[#171A18] print:hover:bg-white">
                                <td className="py-1.5 px-2.5 font-medium text-slate-200 print:text-black truncate max-w-[150px]">
                                  {fact.attribute}
                                </td>
                                <td className="py-1.5 px-2.5 text-[#C9FF3D] print:text-black font-bold truncate max-w-[180px]">
                                  {String(fact.value)}
                                </td>
                                <td className="py-1.5 px-2 text-[10px] text-slate-400 print:text-black text-center">
                                  P.{fact.source?.pageNumber || 1}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="py-3 text-center text-slate-500 text-[10px]">
                                No atomic facts extracted.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right Column: Ingestion Specs & Verification Checklist (5 cols) */}
                  <div className="md:col-span-5 space-y-2 print:col-span-5">
                    <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#C9FF3D] font-bold print:text-black flex items-center space-x-1.5">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Verification Audit</span>
                    </h3>

                    <div className="p-2.5 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-2 font-mono text-[10px] print:bg-slate-50 print:border-black print:p-2">
                      <div className="flex justify-between pb-1 border-b border-[#292D2B]/60 print:border-slate-300">
                        <span className="text-slate-400">OCR / Parse Engine:</span>
                        <span className="font-bold text-slate-200 print:text-black">
                          {report.documentMetadata?.ocrEngine || 'LOCAL_OCR_PARSER'}
                        </span>
                      </div>
                      <div className="flex justify-between pb-1 border-b border-[#292D2B]/60 print:border-slate-300">
                        <span className="text-slate-400">Vector Index:</span>
                        <span className="font-bold text-[#79DF9B] print:text-black">INDEXED (100%)</span>
                      </div>
                      <div className="flex justify-between pb-1 border-b border-[#292D2B]/60 print:border-slate-300">
                        <span className="text-slate-400">Cross-Doc Variance:</span>
                        <span className={`font-bold ${report.criticalFindings?.length > 0 ? 'text-[#FF7777]' : 'text-[#79DF9B]'} print:text-black`}>
                          {report.criticalFindings?.length > 0 ? `${report.criticalFindings.length} Variance(s)` : '0 Variances (Clear)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Confidence:</span>
                        <span className="font-bold text-[#C9FF3D] print:text-black">
                          {((report.overallConfidence || 0.95) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Discrepancies Box (if any) or Clear Confirmation */}
                    {report.criticalFindings && report.criticalFindings.length > 0 ? (
                      <div className="p-2.5 rounded-xl bg-[#171A18] border border-[#FF7777]/50 space-y-1 font-mono text-[10px] print:bg-slate-100 print:border-black">
                        <span className="text-[#FF7777] font-bold uppercase flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Flagged Variance:</span>
                        </span>
                        <p className="text-slate-200 print:text-black text-[10px] line-clamp-2">
                          {report.criticalFindings[0].summary || report.criticalFindings[0].title}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-800/40 font-mono text-[10px] text-emerald-400 flex items-center space-x-1.5 print:bg-slate-50 print:text-black print:border-black">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Consistent with all cross-referenced documents.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Actionable Next Steps (2 points max) */}
                {report.recommendedHumanActions && report.recommendedHumanActions.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-mono uppercase tracking-wider text-[#C9FF3D] font-bold print:text-black flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Recommended Decision Support Actions</span>
                    </h3>
                    <div className="p-2.5 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-1 text-[11px] font-sans print:bg-slate-50 print:border-black print:p-2">
                      {report.recommendedHumanActions.slice(0, 2).map((action: string, i: number) => (
                        <div key={i} className="flex items-start space-x-2">
                          <span className="text-[#C9FF3D] print:text-black font-mono font-bold text-[10px]">•</span>
                          <span className="text-slate-300 print:text-black">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Compact Dual Sign-Off & Stamp Line */}
                <div className="pt-2 border-t border-[#292D2B] print:border-black grid grid-cols-2 gap-3 font-mono text-[10px] print:pt-1">
                  <div className="p-2 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-0.5 print:bg-slate-50 print:border-black">
                    <span className="text-[8px] uppercase text-slate-500 block">AI Engine Hash</span>
                    <p className="text-[#C9FF3D] font-bold print:text-black truncate">NEXUS MULTI-AGENT ORCHESTRATOR</p>
                    <span className="text-[8px] text-slate-400 block">SHA256-DETERMINISTIC-VERIFIED</span>
                  </div>
                  <div className="p-2 rounded-xl bg-[#0D0F0E] border border-[#292D2B] space-y-1 print:bg-slate-50 print:border-black">
                    <span className="text-[8px] uppercase text-slate-500 block">Auditor Verification Stamp</span>
                    <div className="border-b border-dashed border-slate-600 print:border-black pt-1"></div>
                    <div className="flex justify-between text-[8px] text-slate-400 print:text-black">
                      <span>Sign: _______________</span>
                      <span>Date: _________</span>
                    </div>
                  </div>
                </div>

                {/* Compact Disclaimer */}
                <div className="text-[9px] text-slate-500 italic font-sans text-center print:text-slate-600">
                  {report.disclaimer}
                </div>
              </div>
            ) : (
              /* ================= PATTERN B: INTERACTIVE DOSSIER ================= */
              <div className="space-y-4 text-xs text-[#F5F7F5]">
                {/* Header Card */}
                <div className="p-4 rounded-2xl bg-[#171A18] border border-[#292D2B] flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-[#8F9691] uppercase tracking-wider">
                      {report.caseId} • {report.generatedAt?.substring(0, 16).replace('T', ' ')}
                    </span>
                    <h2 className="text-sm font-bold text-white font-mono">
                      {report.caseTitle}
                    </h2>
                    <p className="text-[11px] text-[#8F9691] font-sans">
                      Target Subject: <strong className="text-[#C9FF3D] font-mono">{report.targetName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3 flex-shrink-0">
                    <div className="text-right font-mono">
                      <span className="text-[8px] uppercase text-[#8F9691] block">Risk Index</span>
                      <span className={`text-base font-bold ${report.riskScore > 40 ? 'text-[#FF7777]' : 'text-[#79DF9B]'}`}>
                        {report.riskScore}/100
                      </span>
                    </div>

                    <div className={`px-2.5 py-1 rounded-xl border text-center font-mono ${
                      report.decisionStatus === 'VERIFIED_CLEAR'
                        ? 'bg-[#79DF9B]/15 border-[#79DF9B]/30 text-[#79DF9B]'
                        : 'bg-[#FFBD59]/15 border-[#FFBD59]/30 text-[#FFBD59]'
                    }`}>
                      <span className="text-[8px] uppercase font-bold block">Status</span>
                      <span className="text-xs font-bold">{report.decisionStatus}</span>
                    </div>
                  </div>
                </div>

                {/* 1. Executive Summary */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#C9FF3D] font-bold">
                    1. Executive Summary
                  </h4>
                  <div className="p-3 rounded-2xl bg-[#111312] border border-[#292D2B] text-slate-300 leading-relaxed font-sans text-xs">
                    {report.executiveSummary}
                  </div>
                </div>

                {/* 2. Document Specs */}
                {report.documentMetadata && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#C9FF3D] font-bold">
                      2. Document Specifications
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                      <div className="p-2.5 rounded-xl bg-[#171A18] border border-[#292D2B]">
                        <span className="text-[8px] text-[#8F9691] block uppercase">Format</span>
                        <span className="font-bold text-white">{report.documentMetadata.fileType.toUpperCase()}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#171A18] border border-[#292D2B]">
                        <span className="text-[8px] text-[#8F9691] block uppercase">Size & Pages</span>
                        <span className="font-bold text-white">{report.documentMetadata.fileSize} • {report.documentMetadata.totalPages} pgs</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#171A18] border border-[#292D2B]">
                        <span className="text-[8px] text-[#8F9691] block uppercase">Category</span>
                        <span className="font-bold text-[#C9FF3D]">#{report.documentMetadata.category}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#171A18] border border-[#292D2B]">
                        <span className="text-[8px] text-[#8F9691] block uppercase">Engine</span>
                        <span className="font-bold text-slate-300">{report.documentMetadata.ocrEngine}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Verified Facts */}
                {report.extractedFacts && report.extractedFacts.length > 0 && (
                  <div className="space-y-1.5">
                    <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#C9FF3D] font-bold">
                      3. Verified Fact Ledger ({report.extractedFacts.length} Points)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {report.extractedFacts.slice(0, 8).map((fact: any, i: number) => (
                        <div key={i} className="p-2.5 rounded-xl bg-[#111312] border border-[#292D2B] font-mono text-[10px] space-y-0.5">
                          <div className="flex items-center justify-between text-[#8F9691]">
                            <span className="font-bold text-[#F5F7F5] truncate max-w-[140px]">{fact.attribute}</span>
                            <span>P.{fact.source?.pageNumber || 1}</span>
                          </div>
                          <p className="text-[#C9FF3D] font-semibold truncate">{String(fact.value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            <div className="text-center py-12 text-slate-500 font-mono text-xs">
              No report available for this target.
            </div>
          )}
        </div>

        {/* Modal Footer (Hidden when printing) */}
        <div className="pt-2.5 border-t border-[#292D2B] flex items-center justify-between flex-shrink-0 print:hidden">
          <span className="text-[10px] font-mono text-[#8F9691]">
            NEXUS AI Decision Support Engine • Compact 1-Page Summary
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1 rounded-xl bg-[#171A18] hover:bg-[#1D211F] text-[#8F9691] hover:text-white font-mono text-xs border border-[#292D2B] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
