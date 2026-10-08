import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';
import { nexusData } from '../../data/demoData';

interface DocumentSummaryProps {
  onViewAll: () => void;
  onSelectDocument: (doc: any) => void;
}

export const DocumentSummary: React.FC<DocumentSummaryProps> = ({
  onViewAll,
  onSelectDocument
}) => {
  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-[#C9FF3D]" />;
      case 'docx':
        return <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />;
      case 'csv':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-[#79DF9B]" />;
      case 'txt':
        return <FileText className="w-3.5 h-3.5 text-[#F5F7F5]" />;
      case 'images':
        return <FileImage className="w-3.5 h-3.5 text-[#FFBD59]" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#C9FF3D]" />;
    }
  };

  const recentFiles = [
    { name: 'Applicant_Form.pdf', size: '2.4 MB', pages: '4 pgs', time: '2m ago', status: 'Processing', progress: 78, category: 'FINANCIAL' },
    { name: 'Income_Certificate.pdf', size: '1.1 MB', pages: '2 pgs', time: '5m ago', status: 'Analyzed', progress: 100, category: 'TAX' },
    { name: 'Bank_Statement.pdf', size: '4.8 MB', pages: '12 pgs', time: '8m ago', status: 'Analyzed', progress: 100, category: 'FINANCIAL' },
    { name: 'Board_Resolution.pdf', size: '850 KB', pages: '1 pg', time: '14m ago', status: 'Analyzed', progress: 100, category: 'LEGAL' }
  ];

  return (
    <div className="glass-panel-nexus rounded-3xl p-6 sm:p-7 border border-[#292D2B] flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden min-h-[380px]">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#79DF9B]/5 blur-3xl pointer-events-none" />

      {/* Header with breadth */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#292D2B] relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F7F5]">
                Document Summary
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#C9FF3D]/15 border border-[#C9FF3D]/30 text-[#C9FF3D] text-[10px] font-mono font-bold">
                24 Ingested
              </span>
            </div>
            <span className="text-[10px] text-[#8F9691] font-sans">
              Multimodal Ingestion Breakdown & Processing Status
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#171A18] border border-[#292D2B] text-[10px] font-mono text-[#8F9691]">
            <span className="w-2 h-2 rounded-full bg-[#C9FF3D] animate-pulse" />
            <span>Live Sync</span>
          </div>

          <button
            onClick={onViewAll}
            className="text-xs font-mono text-[#8F9691] hover:text-[#C9FF3D] flex items-center space-x-1 transition-colors group"
          >
            <span>View all</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Upper Metrics Section (Increased breadth with Donut + Breakdown Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center p-3.5 rounded-2xl bg-[#171A18]/70 border border-[#292D2B] relative z-10">
        {/* Left: Donut Chart Widget (4 cols) */}
        <div className="sm:col-span-4 flex items-center space-x-3.5">
          <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
            {/* SVG Donut Progress Chart */}
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-[#1D211F]"
                strokeWidth="3.8"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.8"
                strokeDasharray="75, 100"
                strokeLinecap="round"
                stroke="#C9FF3D"
                fill="none"
                className="drop-shadow-[0_0_6px_rgba(201,255,61,0.5)]"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            {/* Inner Core Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-extrabold text-[#F5F7F5] font-mono leading-none">
                {nexusData.documentSummary.total}
              </span>
            </div>
          </div>

          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-bold text-[#F5F7F5] block font-sans truncate">
              Total Dossier
            </span>
            <span className="text-[10px] text-[#C9FF3D] font-mono block">
              {nexusData.documentSummary.processing} processing (78%)
            </span>
          </div>
        </div>

        {/* Right: Breakdown Chips spanning breadth (8 cols) */}
        <div className="sm:col-span-8 grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs font-mono">
          {nexusData.documentSummary.breakdown.map((b) => (
            <div
              key={b.type}
              className="p-2 rounded-xl bg-[#111312] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-colors flex flex-col items-center justify-center text-center group"
            >
              <div className="flex items-center space-x-1 mb-0.5">
                {getFormatIcon(b.type)}
                <span className="text-[10px] text-[#8F9691] group-hover:text-[#F5F7F5] transition-colors">{b.type}</span>
              </div>
              <span className="text-xs text-[#F5F7F5] font-bold">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lower Section: Recent Ingested Dossier Table spanning breadth */}
      <div className="space-y-2 relative z-10 flex-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#8F9691] uppercase px-1">
          <span>Recent Documents In Pipeline</span>
          <span>Status</span>
        </div>

        <div className="space-y-1.5">
          {recentFiles.map((doc, idx) => (
            <div
              key={idx}
              onClick={() => onSelectDocument(doc)}
              className="p-2.5 sm:p-3 rounded-xl bg-[#171A18]/85 hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
            >
              {/* Left: Icon + File Name + Metadata */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-[#111312] border border-[#292D2B] flex items-center justify-center flex-shrink-0 text-[#C9FF3D]">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <h5 className="text-xs font-semibold text-[#F5F7F5] group-hover:text-[#C9FF3D] transition-colors truncate font-mono">
                    {doc.name}
                  </h5>
                  <div className="flex items-center space-x-2 text-[10px] font-mono text-[#8F9691]">
                    <span>{doc.size}</span>
                    <span>•</span>
                    <span>{doc.pages}</span>
                    <span>•</span>
                    <span className="text-[#C9FF3D]/80">{doc.category}</span>
                  </div>
                </div>
              </div>

              {/* Right: Time + Status Badge */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className="text-[10px] font-mono text-[#8F9691] hidden sm:inline">
                  {doc.time}
                </span>

                {doc.status === 'Processing' ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#C9FF3D]/15 text-[#C9FF3D] border border-[#C9FF3D]/30 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9FF3D] animate-ping" />
                    <span>{doc.progress}%</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#79DF9B]/15 text-[#79DF9B] border border-[#79DF9B]/30 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                    <span>Analyzed</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
