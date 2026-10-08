import React from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Clock,
  Share2,
  ChevronRight,
  ArrowUpRight
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
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-3.5 h-3.5 text-[#FF7777]" />;
      case 'warning':
        return <HelpCircle className="w-3.5 h-3.5 text-[#FFBD59]" />;
      case 'success':
        return <Share2 className="w-3.5 h-3.5 text-[#79DF9B]" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#C9FF3D]" />;
    }
  };

  return (
    <div className="glass-panel-nexus rounded-2xl p-5 border border-[#292D2B] flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#292D2B]">
        <div className="flex items-center space-x-2">
          {/* 4-Pointed Star Symbol */}
          <div className="w-4 h-4 text-[#C9FF3D]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M 12 2 C 12.5 7 17 11.5 22 12 C 17 12.5 12.5 17 12 22 C 11.5 17 7 12.5 2 12 C 7 11.5 11.5 7 12 2 Z"
                fill="#C9FF3D"
              />
            </svg>
          </div>
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F7F5]">
            Recent Intelligence
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

      {/* Intelligence List */}
      <div className="space-y-2.5">
        {nexusData.recentIntelligence.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="p-3 rounded-xl bg-[#171A18]/90 hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-all duration-200 cursor-pointer flex items-center justify-between group"
          >
            {/* Left: Icon + Titles */}
            <div className="flex items-center space-x-3 min-w-0 pr-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${item.color}15` }}
              >
                {getItemIcon(item.type)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-[#F5F7F5] truncate group-hover:text-[#C9FF3D] transition-colors">
                  {item.title}
                </h4>
                <p className="text-[10px] text-[#8F9691] truncate font-sans">
                  {item.description}
                </p>
              </div>
            </div>

            {/* Right: Confidence Ring + Time + Chevron */}
            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="text-right">
                <span className="text-[9px] font-mono uppercase text-[#8F9691] block leading-none">
                  Confidence
                </span>
                <span className="text-xs font-mono font-bold text-[#F5F7F5]">
                  {item.confidence}%
                </span>
              </div>

              {/* Circular Mini Progress Ring */}
              <div className="relative w-5 h-5 flex items-center justify-center">
                <svg className="w-5 h-5 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#292D2B]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    strokeWidth="3.5"
                    strokeDasharray={`${item.confidence}, 100`}
                    strokeLinecap="round"
                    stroke={item.color}
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>

              <span className="text-[10px] font-mono text-[#8F9691]">
                {item.timestamp}
              </span>

              <ChevronRight className="w-3.5 h-3.5 text-[#8F9691] group-hover:text-[#C9FF3D] transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
