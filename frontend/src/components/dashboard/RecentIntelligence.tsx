import React, { useState } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Clock,
  Share2,
  ChevronRight,
  ArrowUpRight,
  FileText,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { nexusData } from '../../data/demoData';

interface RecentIntelligenceProps {
  onSelectItem: (item: any) => void;
  onViewAll: () => void;
}

export const RecentIntelligence: React.FC<RecentIntelligenceProps> = ({
  onSelectItem,
  onViewAll
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SUCCESS'>('ALL');

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-[#FF7777]" />;
      case 'warning':
        return <HelpCircle className="w-4 h-4 text-[#FFBD59]" />;
      case 'success':
        return <Share2 className="w-4 h-4 text-[#79DF9B]" />;
      default:
        return <Clock className="w-4 h-4 text-[#C9FF3D]" />;
    }
  };

  const getTagColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-[#FF7777]/15 text-[#FF7777] border-[#FF7777]/30';
      case 'warning':
        return 'bg-[#FFBD59]/15 text-[#FFBD59] border-[#FFBD59]/30';
      case 'success':
        return 'bg-[#79DF9B]/15 text-[#79DF9B] border-[#79DF9B]/30';
      default:
        return 'bg-[#C9FF3D]/15 text-[#C9FF3D] border-[#C9FF3D]/30';
    }
  };

  const filteredItems = nexusData.recentIntelligence.filter(item => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'CRITICAL') return item.type === 'critical';
    if (activeFilter === 'WARNING') return item.type === 'warning';
    if (activeFilter === 'SUCCESS') return item.type === 'success';
    return true;
  });

  return (
    <div className="glass-panel-nexus rounded-3xl p-6 sm:p-7 border border-[#292D2B] flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden min-h-[380px]">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#C9FF3D]/5 blur-3xl pointer-events-none" />

      {/* Header with breadth */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#292D2B] relative z-10">
        <div className="flex items-center space-x-2.5">
          {/* 4-Pointed Star Symbol */}
          <div className="w-7 h-7 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M 12 2 C 12.5 7 17 11.5 22 12 C 17 12.5 12.5 17 12 22 C 11.5 17 7 12.5 2 12 C 7 11.5 11.5 7 12 2 Z"
                fill="#C9FF3D"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F7F5]">
                Recent Intelligence
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#FF7777]/15 border border-[#FF7777]/30 text-[#FF7777] text-[10px] font-mono font-bold">
                2 Critical
              </span>
            </div>
            <span className="text-[10px] text-[#8F9691] font-sans">
              Cross-Document Contradictions & Validation Anomalies
            </span>
          </div>
        </div>

        {/* Filter Pills across breadth */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto">
          {(['ALL', 'CRITICAL', 'WARNING', 'SUCCESS'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all ${
                activeFilter === tab
                  ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold shadow-[0_0_10px_rgba(201,255,61,0.3)]'
                  : 'bg-[#171A18] text-[#8F9691] hover:text-[#F5F7F5] border border-[#292D2B]'
              }`}
            >
              {tab === 'ALL' ? 'All (7)' : tab === 'CRITICAL' ? 'Critical' : tab === 'WARNING' ? 'Missing' : 'Discovered'}
            </button>
          ))}

          <button
            onClick={onViewAll}
            className="text-xs font-mono text-[#8F9691] hover:text-[#C9FF3D] pl-2 flex items-center space-x-1 transition-colors group"
          >
            <span>View all</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Broad Intelligence Rows (Increased in Breadth) */}
      <div className="space-y-3 relative z-10 flex-1">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="p-3.5 sm:p-4 rounded-2xl bg-[#171A18]/85 hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-sm"
          >
            {/* Left Column: Icon + Title + Description + Citation tag */}
            <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 shadow-inner"
                style={{ backgroundColor: `${item.color}18`, border: `1px solid ${item.color}35` }}
              >
                {getItemIcon(item.type)}
              </div>

              <div className="min-w-0 space-y-1 flex-1">
                <div className="flex items-center space-x-2 flex-wrap">
                  <h4 className="text-xs font-bold text-[#F5F7F5] group-hover:text-[#C9FF3D] transition-colors font-mono">
                    {item.title}
                  </h4>
                  <span className={`px-2 py-0.2 rounded-full text-[9px] font-mono border ${getTagColor(item.type)}`}>
                    {item.type.toUpperCase()}
                  </span>
                </div>

                <p className="text-[11px] text-[#8F9691] font-sans leading-snug line-clamp-1">
                  {item.description}
                </p>

                {/* Evidence Citation Tag spanning breadth */}
                <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#C9FF3D]/80">
                  <FileText className="w-3 h-3" />
                  <span className="truncate">Source Verified: Page-level verbatim cross-reference available</span>
                </div>
              </div>
            </div>

            {/* Right Column: Confidence + Time + Action Arrow */}
            <div className="flex items-center space-x-4 flex-shrink-0 self-end sm:self-center pl-2">
              <div className="text-right">
                <span className="text-[9px] font-mono uppercase text-[#8F9691] block leading-none">
                  Confidence
                </span>
                <span className="text-xs font-mono font-bold text-[#F5F7F5]">
                  {item.confidence}%
                </span>
              </div>

              {/* Mini Circular Progress Ring */}
              <div className="relative w-6 h-6 flex items-center justify-center">
                <svg className="w-6 h-6 transform -rotate-90">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#1D211F"
                    strokeWidth="2.2"
                    fill="none"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke={item.color}
                    strokeWidth="2.2"
                    strokeDasharray={2 * Math.PI * 9}
                    strokeDashoffset={2 * Math.PI * 9 * (1 - item.confidence / 100)}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>

              <span className="text-[10px] font-mono text-[#8F9691] whitespace-nowrap">
                {item.timestamp}
              </span>

              <div className="w-7 h-7 rounded-lg bg-[#111312] border border-[#292D2B] group-hover:border-[#C9FF3D]/50 group-hover:bg-[#C9FF3D]/10 flex items-center justify-center text-[#8F9691] group-hover:text-[#C9FF3D] transition-colors">
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
