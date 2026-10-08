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
}

export const DocumentProcessingPanel: React.FC<DocumentProcessingPanelProps> = ({
  onExplorePipeline
}) => {
  const [aiState, setAiState] = useState<AIState>('PROCESSING');
  const [progress, setProgress] = useState(78);

  const fileIcons: Record<string, React.ReactNode> = {
    PDF: <FileText className="w-3.5 h-3.5 text-[#C9FF3D]" />,
    DOCX: <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />,
    CSV: <FileSpreadsheet className="w-3.5 h-3.5 text-[#79DF9B]" />,
    TXT: <FileText className="w-3.5 h-3.5 text-[#F5F7F5]" />,
    Images: <FileImage className="w-3.5 h-3.5 text-[#FFBD59]" />
  };

  return (
    <div className="glass-panel-nexus rounded-2xl p-5 sm:p-6 border border-[#292D2B] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#C9FF3D]/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#292D2B]/80 relative z-10">
        <div className="flex items-center space-x-2.5">
          {/* 4-Pointed Star Icon */}
          <div className="w-5 h-5 flex items-center justify-center text-[#C9FF3D]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M 12 2 C 12.5 7 17 11.5 22 12 C 17 12.5 12.5 17 12 22 C 11.5 17 7 12.5 2 12 C 7 11.5 11.5 7 12 2 Z"
                fill="#C9FF3D"
              />
            </svg>
          </div>
          <span className="font-mono font-bold text-xs uppercase tracking-wider text-[#F5F7F5]">
            DOCUMENT PROCESSING
          </span>
          <span className="w-2 h-2 rounded-full bg-[#C9FF3D] animate-ping" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono text-[#8F9691] uppercase tracking-wider">
            State: <strong className="text-[#C9FF3D]">{aiState}</strong>
          </span>
        </div>
      </div>

      {/* Main 3-Column Visual Flow Area */}
      <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        {/* Left Column: File Types Stack (3 cols) */}
        <div className="md:col-span-3 space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F9691] block mb-2">
            Ingestion Queue (6 Files)
          </span>

          {nexusData.processing.fileTypes.map((item) => (
            <div
              key={item.type}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#171A18]/80 border border-[#292D2B] hover:border-[#C9FF3D]/30 transition-all text-xs font-mono group"
            >
              <div className="flex items-center space-x-2.5">
                {fileIcons[item.type] || <FileText className="w-3.5 h-3.5 text-[#C9FF3D]" />}
                <span className="text-[#F5F7F5] font-medium">{item.type}</span>
              </div>
              <span className="text-[#8F9691] group-hover:text-[#C9FF3D] font-bold">
                {item.count}
              </span>
            </div>
          ))}
        </div>

        {/* Center Column: Animated Particle Flow & Holographic Core (6 cols) */}
        <div className="md:col-span-6 relative flex flex-col items-center justify-center py-2">
          {/* SVG Particle Streams flowing from left & right into core */}
          <div className="absolute inset-0 pointer-events-none hidden sm:block">
            <svg className="w-full h-full" viewBox="0 0 400 200" fill="none">
              <defs>
                <linearGradient id="streamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#C9FF3D" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#C9FF3D" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#C9FF3D" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Inflow paths from left */}
              <path
                d="M 20 40 C 90 40, 120 100, 160 100"
                stroke="url(#streamGrad)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                className="animate-[dash_2s_linear_infinite]"
              />
              <path
                d="M 20 80 C 80 80, 110 100, 160 100"
                stroke="url(#streamGrad)"
                strokeWidth="1.2"
                strokeDasharray="3 5"
                className="animate-[dash_1.5s_linear_infinite]"
              />
              <path
                d="M 20 130 C 80 130, 110 100, 160 100"
                stroke="url(#streamGrad)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                className="animate-[dash_2.2s_linear_infinite]"
              />
              <path
                d="M 20 160 C 90 160, 120 100, 160 100"
                stroke="url(#streamGrad)"
                strokeWidth="1.5"
                strokeDasharray="5 7"
                className="animate-[dash_1.8s_linear_infinite]"
              />

              {/* Outflow paths to right */}
              <path
                d="M 240 100 C 280 100, 310 50, 380 50"
                stroke="url(#streamGrad)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                className="animate-[dash_2s_linear_infinite]"
              />
              <path
                d="M 240 100 C 280 100, 310 100, 380 100"
                stroke="url(#streamGrad)"
                strokeWidth="1.5"
                strokeDasharray="3 5"
                className="animate-[dash_1.4s_linear_infinite]"
              />
              <path
                d="M 240 100 C 280 100, 310 150, 380 150"
                stroke="url(#streamGrad)"
                strokeWidth="1.2"
                strokeDasharray="4 6"
                className="animate-[dash_1.8s_linear_infinite]"
              />
            </svg>
          </div>

          {/* Holographic AI Core */}
          <NexusHolographicCore state={aiState} size="md" showWaveform={false} />

          {/* Central Label Under Core */}
          <div className="mt-2 text-center">
            <span className="font-mono text-xs font-extrabold text-[#F5F7F5] tracking-wider block">
              NEXUS <span className="text-[#C9FF3D]">AI</span>
            </span>

            {/* Pipeline Stage Breadcrumbs */}
            <div className="flex items-center justify-center space-x-1.5 mt-2 text-[10px] font-mono text-[#8F9691]">
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

        {/* Right Column: Processing Pipeline Checklist (3 cols) */}
        <div className="md:col-span-3 space-y-2.5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F9691] block mb-2">
            Active Verification Engines
          </span>

          {nexusData.processing.checklist.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-2.5 p-2 rounded-lg bg-[#171A18]/50 border border-[#292D2B]/80 text-xs font-sans text-[#F5F7F5]"
            >
              <div className="w-4 h-4 rounded-full bg-[#79DF9B]/20 text-[#79DF9B] flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Progress Bar & Status */}
      <div className="pt-4 border-t border-[#292D2B]/80 space-y-2 relative z-10">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-[#8F9691]">{nexusData.processing.statusText}</span>
          <span className="text-[#C9FF3D] font-extrabold">{progress}%</span>
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
