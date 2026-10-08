import React from 'react';
import {
  Layers,
  FileText,
  AlertTriangle,
  Clock,
  Share2,
  MessageSquare,
  FileCheck,
  Activity,
  RotateCcw,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  metrics: any;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  metrics,
  onReset
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'documents', label: 'Documents', icon: FileText, badge: metrics?.totalDocuments },
    { id: 'findings', label: 'Findings', icon: AlertTriangle, badge: metrics?.totalConflicts, badgeColor: 'crimson' },
    { id: 'timeline', label: 'Temporal View', icon: Clock },
    { id: 'graph', label: 'Knowledge Graph', icon: Share2 },
    { id: 'qa', label: 'Ask NEXUS', icon: MessageSquare, highlight: true },
    { id: 'report', label: 'Decision Report', icon: FileCheck }
  ];

  const pipelineStages = [
    { name: 'Documents', active: true },
    { name: 'Facts', active: true },
    { name: 'Connections', active: true },
    { name: 'Validation', active: true },
    { name: 'Intelligence', active: true },
    { name: 'Decision', active: true, accent: true }
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 backdrop-blur-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-400/20 via-emerald-400/20 to-teal-500/10 border border-lime-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.25)]">
              <Layers className="w-6 h-6 text-lime-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-wider text-white font-mono">NEXUS<span className="text-lime-400">.AI</span></span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-lime-400/10 text-lime-400 border border-lime-400/30 font-mono">
                  MEMBER 3 EXP
                </span>
              </div>
              <p className="text-xs text-slate-400 tracking-wide font-sans">
                Evidence-Centric Information Intelligence
              </p>
            </div>
          </div>

          {/* Pipeline stages */}
          <div className="hidden lg:flex items-center bg-slate-900/80 px-4 py-1.5 rounded-full border border-white/10 text-xs font-mono">
            <span className="text-slate-500 mr-2 text-[11px] uppercase tracking-wider">Pipeline:</span>
            {pipelineStages.map((stage, idx) => (
              <React.Fragment key={stage.name}>
                <span className={`px-2 py-0.5 rounded ${stage.accent ? 'text-lime-400 font-semibold bg-lime-400/10' : 'text-slate-300'}`}>
                  {stage.name}
                </span>
                {idx < pipelineStages.length - 1 && (
                  <span className="text-slate-600 px-1 font-bold">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Status & Action */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span>NEXUS CORE ONLINE</span>
            </div>
            <button
              onClick={onReset}
              title="Reset Demo State"
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-400 hover:text-white border border-white/10 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 mt-4 overflow-x-auto pb-1 scrollbar-none border-t border-white/5 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? 'bg-lime-400/15 text-lime-400 border border-lime-400/40 shadow-[0_0_15px_rgba(204,255,0,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-lime-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    tab.badgeColor === 'crimson' 
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && !isActive && (
                  <span className="w-2 h-2 rounded-full bg-lime-400 animate-ping"></span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
