import React, { useState } from 'react';
import {
  Send,
  Sparkles,
  ArrowRight,
  TrendingDown,
  FileQuestion,
  AlertOctagon,
  Share2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { NexusHolographicCore, AIState } from '../core/NexusHolographicCore';
import { nexusData } from '../../data/demoData';

interface NexusHudPanelProps {
  onAskQuestion: (query: string) => void;
  onOpenEvidence: (insightId?: string) => void;
  onOpenInsight: (insight: any) => void;
}

export const NexusHudPanel: React.FC<NexusHudPanelProps> = ({
  onAskQuestion,
  onOpenEvidence,
  onOpenInsight
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [hudState, setHudState] = useState<AIState>('PROCESSING');
  const [queryStage, setQueryStage] = useState<string | null>(null);

  const handleQuerySubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = queryInput.trim() || "Show critical findings";

    // Trigger animated AI query stages
    setHudState('ANALYZING');
    setQueryStage('Searching evidence...');

    setTimeout(() => {
      setHudState('VALIDATING');
      setQueryStage('Checking conflicts & confidence...');
    }, 800);

    setTimeout(() => {
      setHudState('COMPLETE');
      setQueryStage('Response synthesized!');
      onAskQuestion(q);
      setQueryInput('');
    }, 1600);

    setTimeout(() => {
      setQueryStage(null);
      setHudState('PROCESSING');
    }, 3200);
  };

  const getInsightIcon = (iconName: string) => {
    switch (iconName) {
      case 'TrendingDown':
        return <TrendingDown className="w-3.5 h-3.5 text-[#FF7777]" />;
      case 'FileQuestion':
        return <FileQuestion className="w-3.5 h-3.5 text-[#FFBD59]" />;
      case 'AlertOctagon':
        return <AlertOctagon className="w-3.5 h-3.5 text-[#FF7777]" />;
      default:
        return <Share2 className="w-3.5 h-3.5 text-[#79DF9B]" />;
    }
  };

  return (
    <div className="w-full lg:w-84 xl:w-92 flex flex-col space-y-4">
      {/* Main Holographic Intelligence Panel */}
      <div className="glass-panel-nexus rounded-2xl p-5 border border-[#292D2B] space-y-5 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-[#C9FF3D]/10 blur-3xl pointer-events-none" />

        {/* Panel Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#292D2B] relative z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-5 h-5 flex items-center justify-center text-[#C9FF3D]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 12 2 C 12.5 7 17 11.5 22 12 C 17 12.5 12.5 17 12 22 C 11.5 17 7 12.5 2 12 C 7 11.5 11.5 7 12 2 Z"
                  fill="#C9FF3D"
                />
              </svg>
            </div>
            <div>
              <span className="font-mono font-extrabold text-xs text-[#F5F7F5] tracking-wider block">
                NEXUS AI
              </span>
              <span className="text-[10px] text-[#8F9691] font-sans block leading-none">
                Your information, connected.
              </span>
            </div>
          </div>

          {/* ONLINE Status Pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#79DF9B]/10 border border-[#79DF9B]/30 text-[#79DF9B] text-[10px] font-mono font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#79DF9B] animate-pulse" />
            <span>ONLINE</span>
          </div>
        </div>

        {/* Floating HUD Metrics Around Center Core */}
        <div className="relative py-2 flex flex-col items-center justify-center">
          {/* Top Floating HUD metrics */}
          <div className="w-full flex justify-between px-3 text-[10px] font-mono text-[#8F9691] mb-1">
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider">DOCUMENTS</span>
              <span className="text-sm font-bold text-[#F5F7F5]">24</span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] uppercase tracking-wider">CONFLICTS</span>
              <span className="text-sm font-bold text-[#FF7777]">7</span>
            </div>
          </div>

          {/* Large Holographic AI Core with Audio Spectrum Waveform */}
          <div className="my-2">
            <NexusHolographicCore state={hudState} size="lg" showWaveform={true} />
          </div>

          {/* Middle Floating HUD metrics */}
          <div className="w-full flex justify-between px-3 text-[10px] font-mono text-[#8F9691] mt-1">
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider">FACTS</span>
              <span className="text-sm font-bold text-[#F5F7F5]">142</span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] uppercase tracking-wider">MISSING</span>
              <span className="text-sm font-bold text-[#FFBD59]">4</span>
            </div>
          </div>

          {/* Bottom Floating HUD metrics */}
          <div className="w-full flex justify-between px-3 text-[10px] font-mono text-[#8F9691] mt-2 pt-2 border-t border-[#292D2B]/60">
            <div className="text-left">
              <span className="block text-[9px] uppercase tracking-wider">RELATIONSHIPS</span>
              <span className="text-sm font-bold text-[#F5F7F5]">186</span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] uppercase tracking-wider">CONFIDENCE</span>
              <span className="text-sm font-bold text-[#C9FF3D]">94.2%</span>
            </div>
          </div>
        </div>

        {/* AI Conversational Intelligence Bubble */}
        <div className="p-3.5 rounded-xl bg-[#171A18] border border-[#292D2B] space-y-2 text-xs">
          {queryStage ? (
            <div className="flex items-center space-x-2 text-[#C9FF3D] font-mono text-xs py-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C9FF3D] border-t-transparent animate-spin" />
              <span>{queryStage}</span>
            </div>
          ) : (
            <p className="text-[#F5F7F5] font-sans text-xs leading-relaxed whitespace-pre-line">
              {nexusData.hud.aiMessage}
            </p>
          )}

          {/* Quick Inquiry Input Bar */}
          <form
            onSubmit={handleQuerySubmit}
            className="mt-3 pt-2 border-t border-[#292D2B] flex items-center space-x-2"
          >
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-[#111312] border border-[#292D2B] rounded-full px-3.5 py-1.5 text-xs text-[#F5F7F5] placeholder-[#8F9691] focus:outline-none focus:border-[#C9FF3D]/50 font-sans"
            />
            <button
              type="submit"
              className="w-8 h-8 rounded-full bg-[#C9FF3D] hover:bg-[#bbf030] text-[#0D0F0E] flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 shadow-[0_0_12px_rgba(201,255,61,0.3)]"
              title="Submit query"
            >
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* Key Insights Card (Bottom Right) */}
      <div className="glass-panel-nexus rounded-2xl p-5 border border-[#292D2B] space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-[#292D2B]">
          <div>
            <div className="flex items-center space-x-2">
              <div className="w-3.5 h-3.5 text-[#C9FF3D]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M 12 2 C 12.5 7 17 11.5 22 12 C 17 12.5 12.5 17 12 22 C 11.5 17 7 12.5 2 12 C 7 11.5 11.5 7 12 2 Z"
                    fill="#C9FF3D"
                  />
                </svg>
              </div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F7F5]">
                Key Insights
              </h3>
            </div>
            <p className="text-[10px] text-[#8F9691] mt-0.5">
              AI-powered analysis and recommendations.
            </p>
          </div>
        </div>

        {/* Insights Rows */}
        <div className="space-y-2">
          {nexusData.keyInsights.map((insight) => (
            <div
              key={insight.id}
              onClick={() => onOpenInsight(insight)}
              className="p-2.5 rounded-xl bg-[#171A18]/80 hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/30 flex items-center justify-between text-xs cursor-pointer group transition-all"
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <div className="p-1 rounded bg-[#1D211F] flex-shrink-0">
                  {getInsightIcon(insight.icon)}
                </div>
                <span className="text-xs text-[#F5F7F5] truncate group-hover:text-[#C9FF3D] transition-colors">
                  {insight.text}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#8F9691] group-hover:text-[#C9FF3D] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
            </div>
          ))}
        </div>

        {/* Footer Brand Quote */}
        <div className="pt-2 border-t border-[#292D2B]/80 text-center">
          <span className="text-[10px] text-[#8F9691] font-mono tracking-tight flex items-center justify-center space-x-1.5">
            <span className="text-[#C9FF3D]">✦</span>
            <span>From scattered information to connected intelligence.</span>
          </span>
        </div>
      </div>
    </div>
  );
};
