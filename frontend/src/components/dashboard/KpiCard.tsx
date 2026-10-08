import React, { useEffect, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number;
  change?: string;
  subtext?: string;
  criticalText?: string;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  change,
  subtext,
  criticalText,
  icon,
  iconBg = 'rgba(201, 255, 61, 0.12)',
  iconColor = '#C9FF3D',
  onClick
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Smooth ease-out counter animation
  useEffect(() => {
    let start = 0;
    const duration = 1200; // 1.2s
    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (value - start) * easeOut);
      setDisplayValue(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [value]);

  return (
    <div
      onClick={onClick}
      className="glass-card-interactive p-4 sm:p-5 rounded-2xl flex flex-col justify-between cursor-pointer group select-none min-h-[125px]"
    >
      {/* Top Row: Icon + Label + Arrow */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: iconBg, color: iconColor }}
          >
            {icon}
          </div>
          <span className="text-xs font-mono font-medium text-[#8F9691] uppercase tracking-wider">
            {label}
          </span>
        </div>

        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[#8F9691] group-hover:text-[#C9FF3D] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric Value & Subtext */}
      <div className="mt-3 flex items-baseline justify-between">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#F5F7F5] font-mono tracking-tight group-hover:text-[#C9FF3D] transition-colors">
            {displayValue}
          </span>
          {change && (
            <span className="text-[11px] font-mono text-[#79DF9B] font-semibold">
              {change}
            </span>
          )}
        </div>

        {/* Critical Badge or Subtext */}
        {criticalText ? (
          <span className="text-[10px] font-mono font-bold text-[#FF7777] bg-[#FF7777]/10 px-2 py-0.5 rounded-full border border-[#FF7777]/25">
            {criticalText}
          </span>
        ) : subtext ? (
          <span className="text-[11px] font-sans text-[#8F9691]">
            {subtext}
          </span>
        ) : null}
      </div>
    </div>
  );
};
