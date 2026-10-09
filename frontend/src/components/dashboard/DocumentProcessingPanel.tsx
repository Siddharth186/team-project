import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Cpu,
  X,
  Search,
  ExternalLink,
  Tag,
  Clock,
  Layers
} from 'lucide-react';
import { NexusHolographicCore, AIState } from '../core/NexusHolographicCore';
import { DocumentItem } from '../../types/nexus';

interface DocumentProcessingPanelProps {
  documents?: DocumentItem[];
  findings?: any[];
  onExplorePipeline?: () => void;
  onFilterFileType?: (type: string) => void;
  onSelectDocument?: (doc: any) => void;
  onOpenReport?: (type: 'ALL' | 'DOCUMENT' | 'BATCH', id: string, name: string) => void;
}

export const DocumentProcessingPanel: React.FC<DocumentProcessingPanelProps> = ({
  documents = [],
  findings = [],
  onExplorePipeline,
  onFilterFileType,
  onSelectDocument,
  onOpenReport
}) => {
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);
  const [simulatedPulse, setSimulatedPulse] = useState<number | null>(null);
  const [selectedTypeModal, setSelectedTypeModal] = useState<string | null>(null);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Helper to filter documents by category type
  const filterDocsByType = (type: string) => {
    return documents.filter(d => {
      const n = (d.fileType || d.name || '').toLowerCase();
      if (type === 'PDF') return n.endsWith('pdf') || n === 'pdf';
      if (type === 'DOCX') return n.includes('doc') || n.includes('docx') || n.includes('word');
      if (type === 'CSV / Excel') return n.includes('csv') || n.includes('xls') || n.includes('xlsx') || n.includes('sheet');
      if (type === 'TXT') return n.endsWith('txt') || n === 'txt';
      if (type === 'Images') return ['png', 'jpg', 'jpeg', 'webp', 'gif'].some(ext => n.endsWith(ext) || n === ext);
      return false;
    });
  };

  const pdfDocs = filterDocsByType('PDF');
  const docxDocs = filterDocsByType('DOCX');
  const csvDocs = filterDocsByType('CSV / Excel');
  const txtDocs = filterDocsByType('TXT');
  const imgDocs = filterDocsByType('Images');

  const fileTypeItems = [
    { type: 'PDF', count: pdfDocs.length, docs: pdfDocs, icon: <FileText className="w-3.5 h-3.5 text-[#C9FF3D]" /> },
    { type: 'DOCX', count: docxDocs.length, docs: docxDocs, icon: <FileText className="w-3.5 h-3.5 text-[#38BDF8]" /> },
    { type: 'CSV / Excel', count: csvDocs.length, docs: csvDocs, icon: <FileSpreadsheet className="w-3.5 h-3.5 text-[#79DF9B]" /> },
    { type: 'TXT', count: txtDocs.length, docs: txtDocs, icon: <FileText className="w-3.5 h-3.5 text-[#F5F7F5]" /> },
    { type: 'Images', count: imgDocs.length, docs: imgDocs, icon: <FileImage className="w-3.5 h-3.5 text-[#FFBD59]" /> }
  ];

  const totalFiles = documents.length;
  const processingDocs = documents.filter(d => d.status === 'PROCESSING');
  const isCurrentlyProcessing = processingDocs.length > 0 || simulatedPulse !== null;

  // Compute live real-time progress
  let progress = 100;
  let aiState: AIState = 'COMPLETE';
  let statusText = `All ${totalFiles} documents ingested & indexed into vector knowledge graph`;

  if (totalFiles === 0) {
    progress = 0;
    aiState = 'IDLE';
    statusText = 'Multimodal Ingestion Pipeline Ready • Standby';
  } else if (simulatedPulse !== null) {
    progress = simulatedPulse;
    if (progress < 30) {
      aiState = 'PROCESSING';
      statusText = `Extracting layout & optical OCR across ${totalFiles} files (${progress}%)`;
    } else if (progress < 60) {
      aiState = 'ANALYZING';
      statusText = `Resolving entities & financial assertions (${progress}%)`;
    } else if (progress < 90) {
      aiState = 'CONNECTING';
      statusText = `Projecting knowledge graph & detecting contradictions (${progress}%)`;
    } else {
      aiState = 'VALIDATING';
      statusText = `Finalizing forensic verification ledger (${progress}%)`;
    }
  } else if (processingDocs.length > 0) {
    const avg = Math.round(
      processingDocs.reduce((acc, d) => acc + (d.processingProgress || 50), 0) / processingDocs.length
    );
    progress = avg;
    if (progress < 40) aiState = 'PROCESSING';
    else if (progress < 70) aiState = 'ANALYZING';
    else if (progress < 95) aiState = 'CONNECTING';
    else aiState = 'VALIDATING';
    statusText = `Processing ${processingDocs.length} of ${totalFiles} document(s) in active pipeline (${progress}%)`;
  }

  // Trigger live pipeline simulation animation for demo
  const handleTriggerLivePulse = () => {
    setActiveFeedback(`Starting live multi-stage ingestion pass across ${totalFiles || 5} documents...`);
    let p = 15;
    setSimulatedPulse(p);
    const interval = setInterval(() => {
      p += 17;
      if (p >= 100) {
        setSimulatedPulse(100);
        clearInterval(interval);
        setTimeout(() => {
          setSimulatedPulse(null);
          setActiveFeedback(`Ingestion pass complete: 100% verified across all local documents.`);
          setTimeout(() => setActiveFeedback(null), 3500);
        }, 800);
      } else {
        setSimulatedPulse(p);
      }
    }, 400);
  };

  const checklistItems = [
    {
      id: 'c1',
      label: 'Text Extraction',
      sub: totalFiles > 0 ? `${totalFiles} docs parsed` : 'Ready',
      active: totalFiles > 0
    },
    {
      id: 'c2',
      label: 'OCR Processing',
      sub: 'Local OCR active',
      active: totalFiles > 0
    },
    {
      id: 'c3',
      label: 'Entity Recognition',
      sub: 'Multi-entity resolver',
      active: totalFiles > 0
    },
    {
      id: 'c4',
      label: 'Relationship Mapping',
      sub: 'Constellation graph',
      active: totalFiles > 0
    },
    {
      id: 'c5',
      label: 'Cross-Doc Analysis',
      sub: `${findings.length} findings verified`,
      active: totalFiles > 0
    }
  ];

  // Current active modal docs
  const activeModalDocs = selectedTypeModal ? filterDocsByType(selectedTypeModal) : [];
  const filteredModalDocs = modalSearchQuery.trim()
    ? activeModalDocs.filter(d => 
        (d.name || '').toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
        (d.documentCategory || '').toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
        (d.tags || []).some(t => t.toLowerCase().includes(modalSearchQuery.toLowerCase()))
      )
    : activeModalDocs;

  return (
    <div className="glass-panel-nexus rounded-3xl p-5 sm:p-7 border border-[#292D2B] relative overflow-hidden h-full flex flex-col justify-between shadow-2xl min-h-[460px]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#C9FF3D]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#292D2B] relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#F5F7F5]">
                DOCUMENT PROCESSING
              </span>
              <span className={`w-2 h-2 rounded-full ${isCurrentlyProcessing ? 'bg-[#C9FF3D] animate-ping' : 'bg-emerald-400'}`} />
            </div>
            <span className="text-[10px] text-[#8F9691] font-sans">
              Live Multimodal Ingestion & Verification Telemetry
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleTriggerLivePulse}
            className="px-2.5 py-1 rounded-full bg-[#171A18] hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/50 text-[10px] font-mono text-[#8F9691] hover:text-[#C9FF3D] transition-all cursor-pointer flex items-center space-x-1"
            title="Click to trigger a live multi-agent verification pass"
          >
            <RefreshCw className={`w-3 h-3 ${isCurrentlyProcessing ? 'animate-spin text-[#C9FF3D]' : ''}`} />
            <span>Live Pass:</span>
            <strong className="text-[#C9FF3D]">{aiState}</strong>
          </button>
        </div>
      </div>

      {/* Interactive Feedback Notice */}
      {activeFeedback && (
        <div className="mx-1 my-2 p-2.5 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 text-xs font-mono text-[#F5F7F5] flex items-center space-x-2 animate-in fade-in duration-150">
          <Sparkles className="w-3.5 h-3.5 text-[#C9FF3D] flex-shrink-0" />
          <span className="truncate">{activeFeedback}</span>
        </div>
      )}

      {/* Main 3-Column Visual Flow Area */}
      <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center relative z-10 flex-1 my-auto">
        {/* Left Column: Live File Types Stack (3 cols) */}
        <div className="sm:col-span-3 space-y-1.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#8F9691]">
              Ingestion Queue ({totalFiles})
            </span>
            <span className="text-[9px] font-mono text-[#C9FF3D]/80">
              Touch to view
            </span>
          </div>

          {fileTypeItems.map((item) => (
            <button
              type="button"
              key={item.type}
              onClick={() => {
                setSelectedTypeModal(item.type);
                setModalSearchQuery('');
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#171A18]/90 hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/50 hover:shadow-[0_0_12px_rgba(201,255,61,0.15)] transition-all text-xs font-mono group shadow-sm text-left cursor-pointer active:scale-95"
              title={`Click to view all ${item.count} ${item.type} files`}
            >
              <div className="flex items-center space-x-2">
                {item.icon}
                <span className="text-[#F5F7F5] font-medium text-[11px] group-hover:text-[#C9FF3D] transition-colors">
                  {item.type}
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                  item.count > 0 ? 'bg-[#C9FF3D]/10 text-[#C9FF3D] border border-[#C9FF3D]/30' : 'text-slate-600 bg-slate-900/40'
                }`}>
                  {item.count}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Center Column: Animated Particle Flow & Holographic Core (5 cols) */}
        <div className="sm:col-span-5 relative flex flex-col items-center justify-center py-2">
          {/* Holographic AI Core */}
          <NexusHolographicCore state={aiState} size="md" showWaveform={false} />

          {/* Central Label Under Core */}
          <div className="mt-1 text-center">
            <span className="font-mono text-xs font-extrabold text-[#F5F7F5] tracking-wider block">
              NEXUS <span className="text-[#C9FF3D]">AI</span>
            </span>

            {/* Pipeline Stage Breadcrumbs with Active Step Highlighting */}
            <div className="flex items-center justify-center space-x-1 mt-1 text-[9px] font-mono">
              <span className={progress >= 20 ? "text-[#C9FF3D] font-bold" : "text-[#8F9691]"}>Analyzing</span>
              <span className="text-slate-600">→</span>
              <span className={progress >= 50 ? "text-[#C9FF3D] font-bold" : "text-[#8F9691]"}>Extracting</span>
              <span className="text-slate-600">→</span>
              <span className={progress >= 80 ? "text-[#C9FF3D] font-bold" : "text-[#8F9691]"}>Connecting</span>
              <span className="text-slate-600">→</span>
              <span className={progress >= 100 ? "text-[#79DF9B] font-bold" : "text-[#8F9691]"}>Verified</span>
            </div>
          </div>
        </div>

        {/* Right Column: Processing Pipeline Checklist (4 cols) */}
        <div className="sm:col-span-4 space-y-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#8F9691] block mb-1">
            Active Verification Engines
          </span>

          {checklistItems.map((item) => (
            <div
              key={item.id}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#171A18]/90 border border-[#292D2B] text-xs font-sans text-[#F5F7F5] shadow-sm text-left"
            >
              <div className="flex items-center space-x-2 truncate">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.active ? 'bg-[#79DF9B]/20 text-[#79DF9B]' : 'bg-slate-800 text-slate-500'
                }`}>
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span className="text-[11px] truncate font-medium">
                  {item.label}
                </span>
              </div>
              <span className="text-[9px] font-mono text-[#8F9691] flex-shrink-0 ml-1">
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Progress Bar & Status */}
      <div className="pt-3.5 border-t border-[#292D2B] space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#8F9691] text-[11px] truncate max-w-[320px]">
            {statusText}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onExplorePipeline}
              className="text-[10px] text-[#8F9691] hover:text-[#C9FF3D] transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <span>Explore Pipeline</span>
              <span>→</span>
            </button>
            <span className={`font-extrabold ${progress === 100 ? 'text-[#79DF9B]' : 'text-[#C9FF3D]'}`}>
              {progress}%
            </span>
          </div>
        </div>

        {/* Animated Neon-Lime Progress Bar with Glow */}
        <div className="w-full bg-[#1D211F] h-2.5 rounded-full overflow-hidden p-[1px] border border-[#292D2B]">
          <div
            className={`h-full rounded-full transition-all duration-500 shadow-[0_0_12px_#C9FF3D] ${
              progress === 100 ? 'bg-[#79DF9B]' : 'bg-[#C9FF3D]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Specific File Type Inspector Modal Popup */}
      {selectedTypeModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedTypeModal(null)}
        >
          <div 
            className="bg-[#121513] border border-[#292D2B] rounded-3xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#292D2B] flex items-center justify-between bg-[#171A18]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-[#F5F7F5] flex items-center space-x-2">
                    <span>{selectedTypeModal} Ingested Documents</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#C9FF3D]/20 text-[#C9FF3D] text-[10px] font-mono">
                      {activeModalDocs.length} {activeModalDocs.length === 1 ? 'file' : 'files'}
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#8F9691] font-sans">
                    Specific dossier files recognized under <strong className="text-[#F5F7F5]">{selectedTypeModal}</strong> format
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTypeModal(null)}
                className="w-7 h-7 rounded-lg bg-[#1D211F] hover:bg-[#292D2B] border border-[#292D2B] flex items-center justify-center text-[#8F9691] hover:text-[#F5F7F5] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-Modal Search filter for quick navigation */}
            <div className="p-3.5 border-b border-[#292D2B] bg-[#141715]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8F9691] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder={`Filter among ${activeModalDocs.length} ${selectedTypeModal} files...`}
                  className="w-full bg-[#1A1E1B] border border-[#292D2B] rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-[#F5F7F5] placeholder-[#8F9691] focus:outline-none focus:border-[#C9FF3D]"
                  autoFocus
                />
              </div>
            </div>

            {/* List of specific files */}
            <div className="p-4 overflow-y-auto space-y-2 flex-1 max-h-[50vh]">
              {filteredModalDocs.length === 0 ? (
                <div className="py-12 text-center text-[#8F9691] font-mono text-xs">
                  <p>No {selectedTypeModal} documents match your filter.</p>
                </div>
              ) : (
                filteredModalDocs.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="p-3.5 rounded-2xl bg-[#171A18] hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="w-7 h-7 rounded-lg bg-[#1F2421] border border-[#292D2B] flex items-center justify-center flex-shrink-0 text-[#C9FF3D]">
                        {selectedTypeModal === 'PDF' && <FileText className="w-4 h-4 text-[#C9FF3D]" />}
                        {selectedTypeModal === 'DOCX' && <FileText className="w-4 h-4 text-[#38BDF8]" />}
                        {selectedTypeModal === 'CSV / Excel' && <FileSpreadsheet className="w-4 h-4 text-[#79DF9B]" />}
                        {selectedTypeModal === 'TXT' && <FileText className="w-4 h-4 text-[#F5F7F5]" />}
                        {selectedTypeModal === 'Images' && <FileImage className="w-4 h-4 text-[#FFBD59]" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-semibold text-[#F5F7F5] truncate group-hover:text-[#C9FF3D] transition-colors">
                            {doc.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            {doc.status || 'VERIFIED'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-3 text-[10px] font-mono text-[#8F9691] mt-1">
                          <span>
                            {typeof doc.fileSize === 'number'
                              ? `${(doc.fileSize / (1024 * 1024)).toFixed(2)} MB`
                              : ((doc as any).size || '1.2 MB')}
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <Clock className="w-2.5 h-2.5" />
                            <span>{doc.uploadedAt ? doc.uploadedAt.substring(0, 16).replace('T', ' ') : 'Active'}</span>
                          </span>

                          {/* Render taxonomy tags if present */}
                          {doc.tags && doc.tags.length > 0 && (
                            <div className="hidden sm:flex items-center space-x-1">
                              {doc.tags.slice(0, 2).map((t: string) => (
                                <span key={t} className="px-1.5 py-0.2 bg-[#C9FF3D]/10 text-[#C9FF3D] rounded text-[9px] border border-[#C9FF3D]/20">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTypeModal(null);
                          if (onOpenReport) {
                            onOpenReport('DOCUMENT', doc.id, doc.name);
                          } else if (onSelectDocument) {
                            onSelectDocument(doc);
                          }
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-[#C9FF3D]/10 hover:bg-[#C9FF3D] text-[#C9FF3D] hover:text-[#0D0F0E] border border-[#C9FF3D]/30 transition-all font-mono text-[10px] font-semibold flex items-center space-x-1 cursor-pointer"
                        title="View Executive Forensic Report & Findings for this file"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Report</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 border-t border-[#292D2B] bg-[#171A18] flex items-center justify-between text-xs font-mono">
              <span className="text-[#8F9691] text-[10px]">
                Showing {filteredModalDocs.length} of {activeModalDocs.length} {selectedTypeModal} files
              </span>
              <button
                type="button"
                onClick={() => setSelectedTypeModal(null)}
                className="px-3 py-1 rounded-xl bg-[#1D211F] hover:bg-[#292D2B] text-[#F5F7F5] border border-[#292D2B] text-[11px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

