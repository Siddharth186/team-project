import React, { useState } from 'react';
import {
  Share2,
  Landmark,
  Coins,
  FileText,
  Shield,
  ArrowRight
} from 'lucide-react';
import { nexusData } from '../../data/demoData';

interface KnowledgeGraphMiniProps {
  onOpenFullGraph: () => void;
  onSelectNode?: (nodeId: string) => void;
}

export const KnowledgeGraphMini: React.FC<KnowledgeGraphMiniProps> = ({
  onOpenFullGraph,
  onSelectNode
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="glass-panel-nexus rounded-2xl p-5 border border-[#292D2B] flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#292D2B]">
        <div>
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-[#C9FF3D]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F7F5]">
              Knowledge Graph
            </h3>
          </div>
          <p className="text-[10px] text-[#8F9691] mt-0.5 font-sans">
            Explore relationships between entities and facts.
          </p>
        </div>

        <button
          onClick={onOpenFullGraph}
          className="text-xs font-mono text-[#8F9691] hover:text-[#C9FF3D] flex items-center space-x-1 transition-colors group flex-shrink-0"
        >
          <span>View graph</span>
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </button>
      </div>

      {/* Interactive Constellation Canvas Preview */}
      <div className="relative w-full h-44 bg-[#0D0F0E]/80 rounded-xl border border-[#292D2B] overflow-hidden flex items-center justify-center select-none">
        {/* Subtle Background Radial Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#292D2B_1px,transparent_1px)] [background-size:16px_16px] opacity-35" />

        {/* SVG Curved Edge Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 180">
          <defs>
            <linearGradient id="edgeLimeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C9FF3D" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#C9FF3D" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Connection to Bank Account (left top) */}
          <path
            d="M 200 90 C 140 90, 110 50, 80 50"
            stroke="#C9FF3D"
            strokeWidth={hoveredNode === 'bank_acc' ? "2" : "1.2"}
            strokeDasharray={hoveredNode === 'bank_acc' ? "none" : "3 3"}
            opacity={hoveredNode === 'bank_acc' ? "1" : "0.5"}
          />

          {/* Connection to Income ₹42,000 (left bottom) */}
          <path
            d="M 200 90 C 140 90, 110 130, 80 130"
            stroke="#C9FF3D"
            strokeWidth={hoveredNode === 'income' ? "2" : "1.2"}
            strokeDasharray={hoveredNode === 'income' ? "none" : "3 3"}
            opacity={hoveredNode === 'income' ? "1" : "0.5"}
          />

          {/* Connection to Application (right top) */}
          <path
            d="M 200 90 C 260 90, 290 50, 320 50"
            stroke="#C9FF3D"
            strokeWidth={hoveredNode === 'application' ? "2" : "1.2"}
            strokeDasharray={hoveredNode === 'application' ? "none" : "3 3"}
            opacity={hoveredNode === 'application' ? "1" : "0.5"}
          />

          {/* Connection to Policy (right bottom) */}
          <path
            d="M 200 90 C 260 90, 290 130, 320 130"
            stroke="#C9FF3D"
            strokeWidth={hoveredNode === 'policy' ? "2" : "1.2"}
            strokeDasharray={hoveredNode === 'policy' ? "none" : "3 3"}
            opacity={hoveredNode === 'policy' ? "1" : "0.5"}
          />
        </svg>

        {/* Central Node: Applicant */}
        <div
          onClick={onOpenFullGraph}
          className="absolute z-20 px-4 py-1.5 rounded-full bg-[#111312] border-2 border-[#C9FF3D] text-[#F5F7F5] font-mono text-xs font-bold shadow-[0_0_20px_rgba(201,255,61,0.35)] cursor-pointer hover:scale-105 transition-transform flex items-center space-x-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-[#C9FF3D] animate-ping" />
          <span>Applicant</span>
        </div>

        {/* Node 1: Bank Account (Top Left) */}
        <div
          onMouseEnter={() => setHoveredNode('bank_acc')}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={onOpenFullGraph}
          className="absolute left-6 top-6 z-10 px-2.5 py-1.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D] text-xs font-mono text-[#F5F7F5] flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg"
        >
          <Landmark className="w-3.5 h-3.5 text-[#C9FF3D]" />
          <div className="text-[10px]">
            <span className="block leading-tight font-semibold">Bank</span>
            <span className="text-[#8F9691] text-[9px]">Account</span>
          </div>
        </div>

        {/* Node 2: Income ₹42,000 (Bottom Left) */}
        <div
          onMouseEnter={() => setHoveredNode('income')}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={onOpenFullGraph}
          className="absolute left-6 bottom-6 z-10 px-2.5 py-1.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D] text-xs font-mono text-[#F5F7F5] flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg"
        >
          <Coins className="w-3.5 h-3.5 text-[#C9FF3D]" />
          <div className="text-[10px]">
            <span className="block leading-tight font-semibold">Income</span>
            <span className="text-[#C9FF3D] text-[9px] font-bold">₹42,000</span>
          </div>
        </div>

        {/* Node 3: Application (Top Right) */}
        <div
          onMouseEnter={() => setHoveredNode('application')}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={onOpenFullGraph}
          className="absolute right-6 top-6 z-10 px-2.5 py-1.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D] text-xs font-mono text-[#F5F7F5] flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg"
        >
          <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[10px] font-semibold">Application</span>
        </div>

        {/* Node 4: Policy (Bottom Right) */}
        <div
          onMouseEnter={() => setHoveredNode('policy')}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={onOpenFullGraph}
          className="absolute right-6 bottom-6 z-10 px-2.5 py-1.5 rounded-xl bg-[#171A18] hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D] text-xs font-mono text-[#F5F7F5] flex items-center space-x-1.5 transition-all cursor-pointer shadow-lg"
        >
          <Shield className="w-3.5 h-3.5 text-[#79DF9B]" />
          <span className="text-[10px] font-semibold">Policy</span>
        </div>
      </div>
    </div>
  );
};
