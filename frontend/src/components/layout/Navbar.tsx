import React from 'react';
import {
  Search,
  User,
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
  Layers,
  FileText,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Share2,
  Clock
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenSearch: () => void;
  onOpenUpload: () => void;
  onOpenProfile?: () => void;
  counts?: {
    documents: number;
    intelligence: number;
    conflicts: number;
    missingData: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  onOpenSearch,
  onOpenUpload,
  onOpenProfile,
  counts = { documents: 24, intelligence: 3, conflicts: 7, missingData: 4 }
}) => {
  const navItems = [
    { id: 'overview', label: 'Home', icon: Layers },
    { id: 'documents', label: 'Documents', icon: FileText, badge: counts.documents },
    { id: 'intelligence', label: 'Intelligence', icon: Sparkles, badge: counts.intelligence },
    {
      id: 'conflicts',
      label: 'Conflicts',
      icon: AlertTriangle,
      badge: counts.conflicts,
      subBadge: '2 critical',
      subBadgeColor: '#FF7777'
    },
    {
      id: 'missing-data',
      label: 'Missing data',
      icon: HelpCircle,
      badge: counts.missingData,
      subBadge: '1 critical',
      subBadgeColor: '#FF7777'
    },
    { id: 'evidence', label: 'Evidence', icon: FileCheck },
    { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Share2 },
    { id: 'timeline', label: 'Timeline', icon: Clock }
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-4 sm:px-6 py-3 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 p-2 rounded-2xl glass-panel-nexus border border-[#292D2B] shadow-xl">
        {/* Left: Brand Logo */}
        <div
          onClick={() => setActiveTab('overview')}
          className="flex items-center space-x-2.5 cursor-pointer pl-2 flex-shrink-0 group select-none"
        >
          {/* 4-Pointed Star Symbol */}
          <div className={`w-8 h-8 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 ${
            isDark
              ? 'bg-[#171A18] border-[#292D2B] shadow-[0_0_15px_rgba(201,255,61,0.25)]'
              : 'bg-[#FFFFFF] border-[rgba(15,81,50,0.2)] shadow-[0_0_15px_rgba(15,81,50,0.15)]'
          }`}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M 12 2 C 12.5 7 17 11.5 22 12 C 17 12.5 12.5 17 12 22 C 11.5 17 7 12.5 2 12 C 7 11.5 11.5 7 12 2 Z"
                fill={isDark ? "#C9FF3D" : "#0F5132"}
              />
            </svg>
          </div>
          <span className={`font-extrabold text-base tracking-wider font-mono ${
            isDark ? 'text-[#F5F7F5]' : 'text-[#0D2E1C]'
          }`}>
            NEXUS <span className={isDark ? "text-[#C9FF3D]" : "text-[#0F5132]"}>AI</span>
          </span>
        </div>

        {/* Center: Main Pill Navigation Bar (as sketched: Home | Documents | Intelligence | Conflicts | Missing data...) */}
        <nav className={`hidden lg:flex items-center space-x-1 px-2 py-1 rounded-full border overflow-x-auto scrollbar-none ${
          isDark
            ? 'bg-[#111312]/90 border-[#292D2B]'
            : 'bg-[#FFFFFF] border-[rgba(15,81,50,0.2)] shadow-sm'
        }`}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 flex items-center space-x-1.5 whitespace-nowrap ${
                  isActive
                    ? (isDark
                        ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold shadow-[0_0_15px_rgba(201,255,61,0.35)]'
                        : 'bg-[#0F5132] text-white font-bold shadow-[0_0_12px_rgba(15,81,50,0.35)]')
                    : (isDark
                        ? 'text-[#8F9691] hover:text-[#F5F7F5] hover:bg-[#1D211F]/80'
                        : 'text-[#2D5A40] hover:text-[#0D2E1C] hover:bg-[#E8F2EA]')
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${
                  isActive
                    ? (isDark ? 'text-[#0D0F0E]' : 'text-white')
                    : (isDark ? 'text-[#8F9691]' : 'text-[#2D5A40]')
                }`} />
                <span>{item.label}</span>

                {/* Badge if present */}
                {item.badge !== undefined && !isActive && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] border ${
                    isDark
                      ? 'bg-[#1D211F] text-[#8F9691] border-[#292D2B]'
                      : 'bg-[#EBF2EC] text-[#2D5A40] border-[rgba(15,81,50,0.2)]'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {/* Sub-badge if critical */}
                {item.subBadge && !isActive && (
                  <span className="px-1.5 py-0.2 rounded text-[8px] bg-[#FF7777]/20 text-[#FF7777] font-bold border border-[#FF7777]/30">
                    {item.subBadge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Controls: (dark / light) pill, User avatar, Search 🔍 ˅ (as sketched!) */}
        <div className="flex items-center space-x-2.5 pr-2 flex-shrink-0">
          {/* Dark / Light Toggle Pill (matching the "(dark / light)" box in the sketch!) */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full border text-xs font-mono transition-all shadow-sm group ${
              isDark
                ? 'bg-[#171A18] hover:bg-[#1D211F] border-[#292D2B] hover:border-[#C9FF3D]/40 text-[#F5F7F5]'
                : 'bg-[#FFFFFF] hover:bg-[#F0F6F2] border-[rgba(15,81,50,0.25)] hover:border-[#0F5132] text-[#0D2E1C]'
            }`}
            title="Toggle Dark / Light theme"
          >
            {isDark ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#C9FF3D] transition-transform group-hover:-rotate-12" />
                <span className="text-[#F5F7F5] text-[11px] font-semibold">dark</span>
                <span className="text-[#8F9691] text-[10px]">/light</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-[#0F5132] transition-transform group-hover:rotate-45" />
                <span className="text-[#2D5A40] text-[10px]">dark/</span>
                <span className="text-[#0F5132] text-[11px] font-bold">light</span>
              </>
            )}
          </button>

          {/* User Profile Avatar */}
          <button
            type="button"
            onClick={onOpenProfile}
            className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-all shadow-sm group hover:scale-105 active:scale-95 ${
              isDark
                ? 'bg-[#171A18] border-[#292D2B] hover:border-[#C9FF3D]/80 text-[#C9FF3D]'
                : 'bg-[#FFFFFF] border-[rgba(15,81,50,0.2)] hover:border-[#0F5132] text-[#0F5132]'
            }`}
            title="Lead Underwriter Profile (Officer Arjun Mehta - CT-8842-BLR)"
          >
            <User className="w-4 h-4 transition-transform group-hover:scale-110" />
          </button>

          {/* Search Trigger with dropdown arrow */}
          <button
            onClick={onOpenSearch}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-xl border text-xs font-mono transition-all shadow-sm ${
              isDark
                ? 'bg-[#171A18] hover:bg-[#1D211F] border-[#292D2B] hover:border-[#C9FF3D]/50 text-[#8F9691] hover:text-[#C9FF3D]'
                : 'bg-[#FFFFFF] hover:bg-[#F0F6F2] border-[rgba(15,81,50,0.2)] hover:border-[#0F5132] text-[#2D5A40] hover:text-[#0F5132]'
            }`}
            title="Search & Command Center (⌘ K)"
          >
            <Search className={`w-3.5 h-3.5 ${isDark ? 'text-[#C9FF3D]' : 'text-[#0F5132]'}`} />
            <ChevronDown className={`w-3 h-3 ${isDark ? 'text-[#8F9691]' : 'text-[#2D5A40]'}`} />
          </button>
        </div>
      </div>

      {/* Mobile Nav Pills Row (on small screens) */}
      <div className="lg:hidden mt-2 flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none px-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1 rounded-full text-[11px] font-mono whitespace-nowrap ${
              activeTab === item.id
                ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold'
                : 'bg-[#171A18] text-[#8F9691] border border-[#292D2B]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
