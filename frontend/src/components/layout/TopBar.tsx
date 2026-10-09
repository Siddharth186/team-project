import React, { useState, useEffect } from 'react';
import { Search, Bell, Calendar, ChevronDown, Sparkles, Command, Clock } from 'lucide-react';

interface TopBarProps {
  onSearchOpen: () => void;
  onNotificationsOpen: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onSearchOpen, onNotificationsOpen }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [now, setNow] = useState<Date>(new Date());

  // Live ticking clock updated every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const greeting = hours < 12 ? 'Good morning' : hours < 18 ? 'Good afternoon' : 'Good evening';

  const dateString = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const timeString = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="space-y-5">
      {/* Search Header Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Glassmorphic Search Bar */}
        <div
          onClick={onSearchOpen}
          className={`flex-1 max-w-2xl flex items-center justify-between px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer ${
            isFocused
              ? 'bg-[#171A18] border border-[#C9FF3D]/50 shadow-[0_0_20px_rgba(201,255,61,0.15)] scale-[1.01]'
              : 'bg-[#171A18]/85 border border-[#292D2B] hover:border-[#292D2B]/90 hover:bg-[#1D211F]/70'
          }`}
        >
          <div className="flex items-center space-x-3 text-xs text-[#8F9691] min-w-0">
            <Search className="w-4 h-4 text-[#8F9691] flex-shrink-0" />
            <span className="truncate font-sans text-xs">
              Ask NEXUS anything... (e.g. "Show all conflicts" or "What's missing?")
            </span>
          </div>

          <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#1D211F] border border-[#292D2B] text-[10px] font-mono text-[#8F9691] flex-shrink-0">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </div>

        {/* Right User & Control Panel Controls */}
        <div className="flex items-center space-x-4 flex-shrink-0">
          {/* Notification Bell with red pulse dot */}
          <button
            onClick={onNotificationsOpen}
            className="relative p-2.5 rounded-full bg-[#171A18] border border-[#292D2B] text-[#8F9691] hover:text-[#F5F7F5] hover:border-[#C9FF3D]/40 transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF7777] shadow-[0_0_8px_#FF7777]" />
          </button>

          {/* User Profile Lockup */}
          <div className="flex items-center space-x-2.5 pl-1 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-[#C9FF3D] text-[#0D0F0E] font-extrabold text-xs flex items-center justify-center font-mono shadow-[0_0_12px_rgba(201,255,61,0.3)]">
              CT
            </div>
            <div className="hidden sm:flex items-center space-x-1 text-xs text-[#F5F7F5] font-medium group-hover:text-[#C9FF3D] transition-colors">
              <span>Control Panel</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#8F9691]" />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Greeting Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F7F5] font-sans">
            {greeting}, <span className="text-[#C9FF3D] font-mono drop-shadow-[0_0_15px_rgba(201,255,61,0.35)]">Team</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#8F9691] mt-1 font-sans">
            Here's what <span className="text-[#F5F7F5] font-semibold">NEXUS</span> discovered from your documents.
          </p>
        </div>

        {/* Live Date & Time Chip */}
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#171A18]/90 border border-[#292D2B] shadow-sm text-xs font-mono text-[#8F9691] self-start sm:self-auto select-none">
          <Calendar className="w-3.5 h-3.5 text-[#C9FF3D]" />
          <span className="text-slate-200 font-medium">{dateString}</span>
          <span className="text-[#292D2B]">|</span>
          <div className="flex items-center space-x-1.5 text-[#F5F7F5] font-semibold">
            <Clock className="w-3 h-3 text-[#79DF9B] animate-pulse" />
            <span className="tabular-nums">{timeString}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
