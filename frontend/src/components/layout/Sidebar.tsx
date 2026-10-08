import React from 'react';
import {
  Layers,
  FileText,
  ShieldAlert,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Share2,
  Clock,
  Settings,
  Plus,
  ChevronRight,
  Sparkles,
  ChevronLeft,
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenUpload: () => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  counts?: {
    documents: number;
    intelligence: number;
    conflicts: number;
    missingData: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  collapsed,
  setCollapsed,
  counts = { documents: 24, intelligence: 3, conflicts: 7, missingData: 4 }
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Layers },
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
      label: 'Missing Data',
      icon: HelpCircle,
      badge: counts.missingData,
      subBadge: '1 critical',
      subBadgeColor: '#FF7777'
    },
    { id: 'evidence', label: 'Evidence', icon: FileCheck, hasArrow: true },
    { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Share2, hasArrow: true },
    { id: 'timeline', label: 'Timeline', icon: Clock, hasArrow: true },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside
      className={`relative z-30 h-screen flex flex-col justify-between border-r border-[#292D2B] bg-[#111312] transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Top Header & Brand */}
      <div className="p-4 flex flex-col space-y-5">
        {/* Logo Lockup */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* 4-Pointed Star Symbol */}
            <div className="w-9 h-9 rounded-xl bg-[#171A18] border border-[#292D2B] flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(201,255,61,0.2)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 12 2 C 12.5 7 17 11.5 22 12 C 17 12.5 12.5 17 12 22 C 11.5 17 7 12.5 2 12 C 7 11.5 11.5 7 12 2 Z"
                  fill="#C9FF3D"
                />
              </svg>
            </div>

            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-base tracking-wider text-[#F5F7F5] font-mono">
                    NEXUS <span className="text-[#C9FF3D]">AI</span>
                  </span>
                </div>
                <span className="text-[10px] text-[#8F9691] font-sans truncate">
                  Information Intelligence Engine
                </span>
              </div>
            )}
          </div>

          {/* Collapse Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-[#8F9691] hover:text-[#C9FF3D] hover:bg-[#171A18] border border-transparent hover:border-[#292D2B] transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Primary Action Button: + Upload Documents */}
        <button
          onClick={onOpenUpload}
          className={`w-full py-2.5 px-4 rounded-full bg-[#C9FF3D] hover:bg-[#bbf030] text-[#0D0F0E] font-bold text-xs tracking-wider uppercase font-mono flex items-center justify-center space-x-2 transition-all duration-200 shadow-[0_0_20px_rgba(201,255,61,0.25)] hover:shadow-[0_0_25px_rgba(201,255,61,0.4)] ${
            collapsed ? 'px-2' : ''
          }`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          {!collapsed && <span>Upload Documents</span>}
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1 pt-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative w-full group flex items-center justify-between py-2.5 px-3.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#171A18] text-[#F5F7F5] font-semibold border border-[#292D2B] shadow-[0_4px_16px_rgba(0,0,0,0.4)]'
                    : 'text-[#8F9691] hover:text-[#F5F7F5] hover:bg-[#171A18]/60 border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                {/* Sliding Active Lime Indicator Bar on Left */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#C9FF3D] shadow-[0_0_10px_#C9FF3D]" />
                )}

                <div className="flex items-center space-x-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 ${
                      isActive ? 'text-[#C9FF3D] drop-shadow-[0_0_8px_rgba(201,255,61,0.6)]' : 'text-[#8F9691] group-hover:text-[#F5F7F5]'
                    }`}
                  />
                  {!collapsed && (
                    <span className="truncate tracking-wide">{item.label}</span>
                  )}
                </div>

                {!collapsed && (
                  <div className="flex items-center space-x-1.5 ml-2">
                    {/* Main Badge */}
                    {item.badge !== undefined && (
                      <span className="px-2 py-0.5 rounded-full bg-[#1D211F] text-[#8F9691] text-[10px] font-mono border border-[#292D2B]">
                        {item.badge}
                      </span>
                    )}

                    {/* Sub Badge (e.g., 2 critical) */}
                    {item.subBadge && (
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                        style={{
                          backgroundColor: 'rgba(255, 119, 119, 0.15)',
                          color: item.subBadgeColor,
                          border: `1px solid rgba(255, 119, 119, 0.3)`
                        }}
                      >
                        {item.subBadge}
                      </span>
                    )}

                    {/* Arrow Chevron */}
                    {item.hasArrow && (
                      <ChevronRight className="w-3.5 h-3.5 text-[#8F9691]/60 group-hover:text-[#C9FF3D] transition-colors" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Cards */}
      {!collapsed && (
        <div className="p-4 space-y-3 border-t border-[#292D2B]/80 bg-[#0D0F0E]/40">
          {/* AI ENGINE Progress Widget */}
          <div className="p-3.5 rounded-xl bg-[#171A18] border border-[#292D2B] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#C9FF3D] animate-pulse" />
                <span className="font-mono font-bold text-[11px] text-[#F5F7F5] uppercase tracking-wider">
                  AI Engine
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#C9FF3D] font-bold">78%</span>
            </div>
            
            <p className="text-[11px] text-[#8F9691] truncate font-sans">
              Processing documents...
            </p>

            {/* Glowing Lime Progress Bar */}
            <div className="w-full bg-[#1D211F] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#C9FF3D] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#C9FF3D]"
                style={{ width: '78%' }}
              />
            </div>

            <div className="text-[10px] text-[#8F9691] font-mono flex justify-between">
              <span>6 documents</span>
              <span>2 min left</span>
            </div>
          </div>

          {/* System Online Status Card */}
          <div className="p-3 rounded-xl bg-[#171A18]/70 border border-[#292D2B] flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="relative flex items-center justify-center w-3 h-3">
                <span className="absolute w-3 h-3 rounded-full bg-[#79DF9B] radar-ping opacity-75" />
                <span className="w-2 h-2 rounded-full bg-[#79DF9B]" />
              </div>
              <div>
                <span className="font-semibold text-[#F5F7F5] text-xs block leading-tight">System Online</span>
                <span className="text-[10px] text-[#8F9691]">All systems operational</span>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="p-1.5 rounded-lg text-[#8F9691] hover:text-[#F5F7F5] hover:bg-[#1D211F] transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
