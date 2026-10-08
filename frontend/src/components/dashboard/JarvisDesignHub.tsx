import React, { useState } from 'react';
import {
  FileText,
  Share2,
  AlertTriangle,
  HelpCircle,
  ArrowUpRight,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { NexusHolographicCore } from '../core/NexusHolographicCore';
import { nexusData } from '../../data/demoData';

interface JarvisDesignHubProps {
  onOpenDocuments: () => void;
  onOpenRelationships: () => void;
  onOpenConflicts: () => void;
  onOpenMissing: () => void;
  counts?: {
    documents: number;
    relationships: number;
    conflicts: number;
    missingData: number;
  };
}

export const JarvisDesignHub: React.FC<JarvisDesignHubProps> = ({
  onOpenDocuments,
  onOpenRelationships,
  onOpenConflicts,
  onOpenMissing,
  counts = { documents: 24, relationships: 186, conflicts: 7, missingData: 4 }
}) => {
  const [hoveredSatellite, setHoveredSatellite] = useState<string | null>(null);

  return (
    <div className="relative glass-panel-nexus rounded-3xl p-6 sm:p-8 border border-[#292D2B] overflow-hidden flex flex-col items-center justify-center min-h-[440px] shadow-2xl">
      {/* Background Volumetric Ambient Glow */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-[#C9FF3D]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Top Banner Tag */}
      <div className="absolute top-4 left-6 flex items-center space-x-2 text-[10px] font-mono text-[#8F9691] uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-[#C9FF3D] animate-ping" />
        <span>JARVIS AI CORE • AUTONOMOUS INTELLIGENCE FIELD</span>
      </div>

      {/* Central SVG Connector Arrows radiating from center Jarvis Core to the 4 Satellites */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 700 440">
        <defs>
          <linearGradient id="jarvisLimeLine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9FF3D" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#C9FF3D" stopOpacity="0.2" />
          </linearGradient>

          <marker id="arrow-lime" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="#C9FF3D" />
          </marker>
          <marker id="arrow-red" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="#FF7777" />
          </marker>
          <marker id="arrow-amber" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="#FFBD59" />
          </marker>
        </defs>

        {/* 1. Arrow to "Missing" (Upper-Left: ~150, 90) */}
        <path
          d="M 310 180 C 260 160, 220 120, 190 95"
          stroke="#FFBD59"
          strokeWidth={hoveredSatellite === 'missing' ? "2.5" : "1.5"}
          strokeDasharray="4 4"
          markerEnd="url(#arrow-amber)"
          opacity={hoveredSatellite === 'missing' ? "1" : "0.65"}
        />

        {/* 2. Arrow to "relation" (Lower-Left: ~140, 330) */}
        <path
          d="M 310 240 C 250 260, 210 300, 190 325"
          stroke="#79DF9B"
          strokeWidth={hoveredSatellite === 'relation' ? "2.5" : "1.5"}
          strokeDasharray="4 4"
          markerEnd="url(#arrow-lime)"
          opacity={hoveredSatellite === 'relation' ? "1" : "0.65"}
        />

        {/* 3. Arrow to "conflicts" (Bottom-Center: ~350, 360) */}
        <path
          d="M 350 280 L 350 330"
          stroke="#FF7777"
          strokeWidth={hoveredSatellite === 'conflicts' ? "3" : "1.8"}
          strokeDasharray="5 3"
          markerEnd="url(#arrow-red)"
          opacity={hoveredSatellite === 'conflicts' ? "1" : "0.75"}
          className="animate-pulse"
        />

        {/* 4. Arrow to "Document" (Right: ~550, 210) */}
        <path
          d="M 420 210 L 500 210"
          stroke="#C9FF3D"
          strokeWidth={hoveredSatellite === 'document' ? "2.5" : "1.5"}
          strokeDasharray="4 4"
          markerEnd="url(#arrow-lime)"
          opacity={hoveredSatellite === 'document' ? "1" : "0.7"}
        />
      </svg>

      {/* Satellite 1: MISSING (Upper-Left, as in sketch) */}
      <div
        onMouseEnter={() => setHoveredSatellite('missing')}
        onMouseLeave={() => setHoveredSatellite(null)}
        onClick={onOpenMissing}
        className={`absolute top-8 left-4 sm:left-8 z-20 p-3.5 sm:p-4 rounded-2xl glass-card-interactive border transition-all duration-300 cursor-pointer select-none max-w-[170px] ${
          hoveredSatellite === 'missing'
            ? 'border-[#FFBD59] shadow-[0_0_20px_rgba(255,189,89,0.3)] scale-105'
            : 'border-[#292D2B]'
        }`}
      >
        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#FFBD59] mb-1">
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="font-bold uppercase tracking-wider">Missing</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-extrabold text-[#F5F7F5] font-mono">{counts.missingData}</span>
          <span className="text-[10px] font-mono text-[#FF7777] font-bold bg-[#FF7777]/10 px-1.5 py-0.5 rounded">
            1 critical
          </span>
        </div>
        <span className="text-[10px] text-[#8F9691] font-sans block mt-0.5">
          Required by policy
        </span>
      </div>

      {/* Satellite 2: RELATION / RELATIONSHIPS (Lower-Left, as in sketch) */}
      <div
        onMouseEnter={() => setHoveredSatellite('relation')}
        onMouseLeave={() => setHoveredSatellite(null)}
        onClick={onOpenRelationships}
        className={`absolute bottom-8 left-4 sm:left-8 z-20 p-3.5 sm:p-4 rounded-2xl glass-card-interactive border transition-all duration-300 cursor-pointer select-none max-w-[170px] ${
          hoveredSatellite === 'relation'
            ? 'border-[#79DF9B] shadow-[0_0_20px_rgba(121,223,155,0.3)] scale-105'
            : 'border-[#292D2B]'
        }`}
      >
        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#79DF9B] mb-1">
          <Share2 className="w-3.5 h-3.5" />
          <span className="font-bold uppercase tracking-wider">Relation</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-extrabold text-[#F5F7F5] font-mono">{counts.relationships}</span>
          <span className="text-[10px] font-mono text-[#79DF9B] font-bold">
            +32 today
          </span>
        </div>
        <span className="text-[10px] text-[#8F9691] font-sans block mt-0.5">
          Entity network mapped
        </span>
      </div>

      {/* Center Circle: JARVIS DESIGN CORE */}
      <div className="relative z-10 flex flex-col items-center justify-center my-4">
        {/* Holographic AI Core Orbitals */}
        <div className="relative p-2 rounded-full border border-[#C9FF3D]/30 bg-[#0D0F0E]/90 shadow-[0_0_40px_rgba(201,255,61,0.15)]">
          <NexusHolographicCore state="PROCESSING" size="lg" showWaveform={true} />

          {/* Central Overlay Label: Jarvis Design */}
          <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none">
            <span className="px-3 py-1 rounded-full bg-[#111312]/90 border border-[#C9FF3D]/40 text-[#C9FF3D] font-mono text-[10px] font-bold uppercase tracking-wider shadow-md">
              JARVIS CORE
            </span>
          </div>
        </div>
      </div>

      {/* Satellite 3: CONFLICTS (Bottom-Center, as in sketch) */}
      <div
        onMouseEnter={() => setHoveredSatellite('conflicts')}
        onMouseLeave={() => setHoveredSatellite(null)}
        onClick={onOpenConflicts}
        className={`absolute bottom-4 z-20 p-3 sm:p-3.5 rounded-2xl glass-card-interactive border transition-all duration-300 cursor-pointer select-none min-w-[190px] text-center ${
          hoveredSatellite === 'conflicts'
            ? 'border-[#FF7777] shadow-[0_0_25px_rgba(255,119,119,0.35)] scale-105'
            : 'border-[#292D2B]'
        }`}
      >
        <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-[#FF7777] mb-1">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span className="font-bold uppercase tracking-wider">Conflicts</span>
        </div>
        <div className="flex items-baseline justify-center space-x-2">
          <span className="text-2xl font-extrabold text-[#F5F7F5] font-mono">{counts.conflicts}</span>
          <span className="text-[10px] font-mono text-[#FF7777] font-bold bg-[#FF7777]/15 px-2 py-0.5 rounded-full border border-[#FF7777]/30">
            2 critical
          </span>
        </div>
        <span className="text-[10px] text-[#FF7777]/90 font-mono block mt-0.5">
          ₹3.4L & ₹10.5K variances
        </span>
      </div>

      {/* Satellite 4: DOCUMENT (Right, as in sketch) */}
      <div
        onMouseEnter={() => setHoveredSatellite('document')}
        onMouseLeave={() => setHoveredSatellite(null)}
        onClick={onOpenDocuments}
        className={`absolute top-1/2 -translate-y-1/2 right-4 sm:right-8 z-20 p-3.5 sm:p-4 rounded-2xl glass-card-interactive border transition-all duration-300 cursor-pointer select-none max-w-[180px] ${
          hoveredSatellite === 'document'
            ? 'border-[#C9FF3D] shadow-[0_0_20px_rgba(201,255,61,0.3)] scale-105'
            : 'border-[#292D2B]'
        }`}
      >
        <div className="flex items-center space-x-2 text-[11px] font-mono text-[#C9FF3D] mb-1">
          <FileText className="w-3.5 h-3.5" />
          <span className="font-bold uppercase tracking-wider">Document</span>
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-extrabold text-[#F5F7F5] font-mono">{counts.documents}</span>
          <span className="text-[10px] font-mono text-[#C9FF3D] font-bold">
            +6 today
          </span>
        </div>
        <span className="text-[10px] text-[#8F9691] font-sans block mt-0.5">
          6 in processing queue (78%)
        </span>
      </div>
    </div>
  );
};
