import React from 'react';
import { Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { nexusData } from '../../data/demoData';

interface TimelineMiniProps {
  onOpenFullTimeline: () => void;
}

export const TimelineMini: React.FC<TimelineMiniProps> = ({ onOpenFullTimeline }) => {
  return (
    <div className="glass-panel-nexus rounded-2xl p-5 border border-[#292D2B] flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#292D2B]">
        <div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#C9FF3D]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F7F5]">
              Timeline
            </h3>
          </div>
          <p className="text-[10px] text-[#8F9691] mt-0.5 font-sans">
            Track changes and updates over time.
          </p>
        </div>

        <button
          onClick={onOpenFullTimeline}
          className="text-xs font-mono text-[#8F9691] hover:text-[#C9FF3D] flex items-center space-x-1 transition-colors group flex-shrink-0"
        >
          <span>View timeline</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>

      {/* Chronological Vertical Sequence */}
      <div className="space-y-3 relative pl-2">
        {/* Subtle Vertical Track Line */}
        <div className="absolute left-[88px] top-2 bottom-3 w-[1px] bg-[#292D2B]" />

        {nexusData.timeline.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center space-x-4 text-xs font-mono relative group cursor-pointer"
            onClick={onOpenFullTimeline}
          >
            {/* Period Label */}
            <span className="w-16 text-[#8F9691] text-[11px] font-semibold flex-shrink-0 text-right">
              {item.period}
            </span>

            {/* Glowing Dot on Track */}
            <div className="relative z-10 flex items-center justify-center flex-shrink-0">
              <span
                className="w-2.5 h-2.5 rounded-full transition-transform duration-200 group-hover:scale-125"
                style={{
                  backgroundColor: item.color,
                  boxShadow: `0 0 8px ${item.color}`
                }}
              />
            </div>

            {/* Content & Alert */}
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <span className="text-[#F5F7F5] truncate text-[11px]">
                {item.text}
              </span>

              {item.conflict && (
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FF7777]/15 text-[#FF7777] border border-[#FF7777]/30 flex items-center space-x-1 flex-shrink-0 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>{item.conflict}</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
