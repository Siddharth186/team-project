import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Layers,
  ArrowRight
} from 'lucide-react';
import { NexusHolographicCore, AIState } from '../core/NexusHolographicCore';
import { nexusData } from '../../data/demoData';

interface DocumentProcessingPanelProps {
  onExplorePipeline?: () => void;
  onFilterFileType?: (type: string) => void;
}

export const DocumentProcessingPanel: React.FC<DocumentProcessingPanelProps> = ({
  onExplorePipeline,
  onFilterFileType
}) => {
  const [aiState, setAiState] = useState<AIState>('PROCESSING');
  const [progress, setProgress] = useState(78);
  const [activeFeedback, setActiveFeedback] = useState<string | null>(null);

  const engineDetails: Record<string, string> = {
    c1: "Text Extraction: pdfplumber v0.11 + python-docx tabular extractor running with 99.8% precision.",
    c2: "OCR Processing: Tesseract 5.3 + LayoutLMv3 multi-column scanned document engine active.",
    c3: "Entity Recognition: SpaCy en_core_web_trf + financial regex entity resolver active.",
    c4: "Relationship Mapping: Bi-directional bipartite fact constellation graph projection active.",
    c5: "Cross-Document Analysis: Deterministic fact consistency and temporal anomaly validator active."
  };

  const handleCycleState = () => {
    const states: AIState[] = ['PROCESSING', 'ANALYZING', 'CONNECTING', 'VALIDATING', 'COMPLETE'];
    const nextIdx = (states.indexOf(aiState) + 1) % states.length;
    const nextState = states[nextIdx];
    setAiState(nextState);
    if (nextState === 'COMPLETE') setProgress(100);
    else if (nextState === 'VALIDATING') setProgress(94);
    else if (nextState === 'CONNECTING') setProgress(88);
    else if (nextState === 'ANALYZING') setProgress(82);
    else setProgress(78);
    setActiveFeedback(`Engine state transitioned to ${nextState}`);
    setTimeout(() => setActiveFeedback(null), 3000);
  };

  const handleEngineClick = (id: string, label: string) => {
    setActiveFeedback(engineDetails[id] || `${label} is running at optimal throughput.`);
    setTimeout(() => setActiveFeedback(null), 4000);
  };

  const handleQueueClick = (type: string, count: number) => {
    if (onFilterFileType) onFilterFileType(type);
    else if (onExplorePipeline) onExplorePipeline();
    setActiveFeedback(`Inspecting ${count} ${type} file(s) in active multimodal queue.`);
    setTimeout(() => setActiveFeedback(null), 3000);
  };

  const fileIcons: Record<string, React.ReactNode> = {
    PDF: <FileText className="w-3.5 h-3.5 text-[#C9FF3D]" />,
    DOCX: <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />,
    CSV: <FileSpreadsheet className="w-3.5 h-3.5 text-[#79DF9B]" />,
    TXT: <FileText className="w-3.5 h-3.5 text-[#F5F7F5]" />,
    Images: <FileImage className="w-3.5 h-3.5 text-[#FFBD59]" />
  };

  return (
    <div className="glass-panel-nexus rounded-3xl p-6 sm:p-7 border border-[#292D2B] relative overflow-hidden h-full flex flex-col justify-between shadow-2xl min-h-[460px]">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#C9FF3D]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#292D2B] relative z-10">
        <div className="flex items-center space-x-2.5">
          {/* 4-Pointed Star Icon */}
          <div className="w-6 h-6 rounded-lg bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M 12 2 C 12.5 7 17 11.5 22 12 C 17 12.5 12.5 17 12 22 C 11.5 17 7 12.5 2 12 C 7 11.5 11.5 7 12 2 Z"
                fill="#C9FF3D"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#F5F7F5]">
                DOCUMENT PROCESSING
              </span>
              <span className="w-2 h-2 rounded-full bg-[#C9FF3D] animate-ping" />
            </div>
            <span className="text-[10px] text-[#8F9691] font-sans">
              Autonomous Multimodal Ingestion Engine
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleCycleState}
            className="px-2.5 py-1 rounded-full bg-[#171A18] hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/50 text-[10px] font-mono text-[#8F9691] uppercase tracking-wider transition-all cursor-pointer flex items-center space-x-1"
            title="Click to cycle AI Engine state"
          >
            <span>State:</span>
            <strong className="text-[#C9FF3D]">{aiState}</strong>
            <span className="text-[9px] text-[#8F9691]">(click)</span>
          </button>
        </div>
      </div>

      {/* Interactive In-Panel Feedback Notice */}
      {activeFeedback && (
        <div className="mx-1 my-2 p-2.5 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 text-xs font-mono text-[#F5F7F5] flex items-center space-x-2 animate-in fade-in duration-150">
          <Sparkles className="w-3.5 h-3.5 text-[#C9FF3D] flex-shrink-0" />
          <span className="truncate">{activeFeedback}</span>
        </div>
      )}

      {/* Main 3-Column Visual Flow Area */}
      <div className="py-4 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center relative z-10 flex-1 my-auto">
        {/* Left Column: File Types Stack (3 cols) */}
        <div className="sm:col-span-3 space-y-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#8F9691] block mb-1">
            Ingestion Queue (6 Files)
          </span>

          {nexusData.processing.fileTypes.map((item) => (
            <button
              type="button"
              key={item.type}
              onClick={() => handleQueueClick(item.type, item.count)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-[#171A18]/90 hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/50 transition-all text-xs font-mono group shadow-sm text-left cursor-pointer"
              title={`Click to inspect ${item.count} ${item.type} files in pipeline`}
            >
              <div className="flex items-center space-x-2">
                {fileIcons[item.type] || <FileText className="w-3.5 h-3.5 text-[#C9FF3D]" />}
                <span className="text-[#F5F7F5] font-medium text-[11px] group-hover:text-[#C9FF3D] transition-colors">
                  {item.type}
                </span>
              </div>
              <span className="text-[#8F9691] group-hover:text-[#C9FF3D] font-bold text-[11px]">
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {/* Center Column: Animated Particle Flow & Holographic Core (5 cols) */}
        <div className="sm:col-span-5 relative flex flex-col items-center justify-center py-2">
          {/* SVG Particle Streams flowing into core */}
          <div className="absolute inset-0 pointer-events-none hidden sm:block">
            <svg className="w-full h-full" viewBox="0 0 300 180" fill="none">
              <defs>
                <linearGradient id="streamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#C9FF3D" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#C9FF3D" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#C9FF3D" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              <path
                d="M 10 40 C 70 40, 90 90, 130 90"
                stroke="url(#streamGrad)"
                strokeWidth="1.2"
                strokeDasharray="3 5"
                className="animate-[dash_2s_linear_infinite]"
              />
              <path
                d="M 10 140 C 70 140, 90 90, 130 90"
                stroke="url(#streamGrad)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                className="animate-[dash_1.8s_linear_infinite]"
              />
              <path
                d="M 170 90 C 210 90, 230 40, 290 40"
                stroke="url(#streamGrad)"
                strokeWidth="1.2"
                strokeDasharray="3 5"
                className="animate-[dash_1.5s_linear_infinite]"
              />
              <path
                d="M 170 90 C 210 90, 230 140, 290 140"
                stroke="url(#streamGrad)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                className="animate-[dash_2s_linear_infinite]"
              />
            </svg>
          </div>

          {/* Holographic AI Core */}
          <NexusHolographicCore state={aiState} size="md" showWaveform={false} />

          {/* Central Label Under Core */}
          <div className="mt-1 text-center">
            <span className="font-mono text-xs font-extrabold text-[#F5F7F5] tracking-wider block">
              NEXUS <span className="text-[#C9FF3D]">AI</span>
            </span>

            {/* Pipeline Stage Breadcrumbs */}
            <div className="flex items-center justify-center space-x-1 mt-1 text-[9px] font-mono text-[#8F9691]">
              <span className="text-[#C9FF3D] font-bold">Analyzing</span>
              <span>→</span>
              <span className="text-[#C9FF3D] font-bold">Extracting</span>
              <span>→</span>
              <span className="text-[#C9FF3D] font-bold">Connecting</span>
              <span>→</span>
              <span className="text-[#8F9691]">Validating</span>
            </div>
          </div>
        </div>

        {/* Right Column: Processing Pipeline Checklist (4 cols) */}
        <div className="sm:col-span-4 space-y-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-[#8F9691] block mb-1">
            Active Verification Engines
          </span>

          {nexusData.processing.checklist.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => handleEngineClick(item.id, item.label)}
              className="w-full flex items-center space-x-2 p-2 rounded-xl bg-[#171A18]/90 hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#79DF9B]/50 transition-all text-xs font-sans text-[#F5F7F5] shadow-sm text-left cursor-pointer group"
              title={`Click to inspect telemetry for ${item.label}`}
            >
              <div className="w-4 h-4 rounded-full bg-[#79DF9B]/20 text-[#79DF9B] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span className="text-[11px] truncate font-medium group-hover:text-[#79DF9B] transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Progress Bar & Status */}
      <div className="pt-3.5 border-t border-[#292D2B] space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#8F9691] text-[11px]">{nexusData.processing.statusText}</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onExplorePipeline}
              className="text-[10px] text-[#8F9691] hover:text-[#C9FF3D] transition-colors flex items-center space-x-1"
            >
              <span>Explore Pipeline</span>
              <span>→</span>
            </button>
            <span className="text-[#C9FF3D] font-extrabold">{progress}%</span>
          </div>
        </div>

        {/* Animated Neon-Lime Progress Bar with Glow */}
        <div className="w-full bg-[#1D211F] h-2 rounded-full overflow-hidden p-[1px] border border-[#292D2B]">
          <div
            className="bg-[#C9FF3D] h-full rounded-full transition-all duration-700 shadow-[0_0_12px_#C9FF3D]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
