import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  CheckCircle2,
  Clock,
  ArrowRight
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
  return (
    <div className="glass-panel-nexus rounded-2xl p-5 border border-[#292D2B] flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#292D2B]">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-[#C9FF3D]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F7F5]">
            Document Summary
          </h3>
        </div>

        <button
          onClick={onViewAll}
          className="text-xs font-mono text-[#8F9691] hover:text-[#C9FF3D] flex items-center space-x-1 transition-colors group"
        >
          <span>View all</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>

      {/* Donut Chart & Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Left: Donut Chart Widget (5 cols) */}
        <div className="sm:col-span-5 flex items-center space-x-4">
          <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
            {/* SVG Donut Progress Chart */}
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
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
              <span className="text-xl font-extrabold text-[#F5F7F5] font-mono leading-none">
                {nexusData.documentSummary.total}
              </span>
            </div>
          </div>

          <div className="space-y-0.5">
            <span className="text-xs font-bold text-[#F5F7F5] block font-sans">
              Total Documents
            </span>
            <span className="text-[10px] text-[#C9FF3D] font-mono block">
              {nexusData.documentSummary.processing} processing...
            </span>
          </div>
        </div>

        {/* Right: Breakdown Counts (7 cols) */}
        <div className="sm:col-span-7 grid grid-cols-3 gap-1.5 text-xs font-mono">
          {nexusData.documentSummary.breakdown.map((b) => (
            <div
              key={b.type}
              className="p-1.5 rounded-lg bg-[#171A18]/80 border border-[#292D2B] flex items-center justify-between"
            >
              <span className="text-[10px] text-[#8F9691]">{b.type}</span>
              <span className="text-xs text-[#F5F7F5] font-bold">{b.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest Uploads Table */}
      <div className="space-y-2 pt-2 border-t border-[#292D2B]/80">
        <span className="text-[10px] font-mono uppercase text-[#8F9691] tracking-wider block">
          Latest Uploads
        </span>

        <div className="space-y-1.5">
          {nexusData.documentSummary.latestUploads.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="p-2 rounded-xl bg-[#171A18]/60 hover:bg-[#1D211F] border border-[#292D2B] flex items-center justify-between text-xs cursor-pointer group transition-colors"
            >
              <div className="flex items-center space-x-2 truncate pr-2">
                <FileText className="w-3.5 h-3.5 text-[#8F9691] group-hover:text-[#C9FF3D] transition-colors flex-shrink-0" />
                <span className="text-[#F5F7F5] font-mono text-[11px] truncate">
                  {doc.name}
                </span>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-[10px] text-[#8F9691] font-mono">
                  {doc.time}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    doc.status === 'Processing'
                      ? 'bg-[#C9FF3D]/10 text-[#C9FF3D] border border-[#C9FF3D]/30'
                      : 'bg-[#79DF9B]/10 text-[#79DF9B] border border-[#79DF9B]/30'
                  }`}
                >
                  {doc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
