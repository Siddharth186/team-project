import React, { useState } from 'react';
import {
  Share2,
  Filter,
  Info,
  Layers,
  FileText,
  User,
  Building,
  Target,
  Zap,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { KnowledgeGraphData, GraphNode, GraphEdge } from '../types/nexus';

interface KnowledgeGraphViewProps {
  graphData: KnowledgeGraphData;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ graphData }) => {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(graphData.nodes[0] || null);
  const [filterType, setFilterType] = useState<string>('ALL');

  // Node position map for clean deterministic SVG graph layout
  const nodePositions: Record<string, { x: number; y: number }> = {
    'ent-1': { x: 380, y: 220 }, // Nexus Solar (Central Org)
    'ent-2': { x: 160, y: 120 }, // Arjun Mehta (Person)
    'ent-3': { x: 600, y: 150 }, // Project Alpha (Project)
    'ent-4': { x: 740, y: 80 },  // MNRE (Gov)
    'ent-5': { x: 180, y: 340 }, // HDFC Bank Account
    'ent-6': { x: 580, y: 340 }, // R.K. & Associates (Auditor)
    'doc-1': { x: 260, y: 40 },  // Doc 1 (Loan App)
    'doc-2': { x: 760, y: 240 }, // Doc 2 (Grant Sanction)
    'doc-3': { x: 80, y: 240 },  // Doc 3 (Bank Statement)
    'doc-4': { x: 480, y: 410 }, // Doc 4 (Audited Fin)
    'doc-5': { x: 340, y: 410 }, // Doc 5 (ITR-V)
    'fact-1': { x: 460, y: 60 },  // Fact 1: Req Loan ₹18.4L
    'fact-2': { x: 660, y: 60 },  // Fact 2: Cap ₹15.0L
    'fact-3': { x: 100, y: 40 },  // Fact 3: Stated Sal ₹1.8L
    'fact-4': { x: 40, y: 140 },  // Fact 4: Bank Sal ₹1.25L
  };

  const getNodeColor = (node: GraphNode) => {
    switch (node.type) {
      case 'ORGANIZATION': return '#38bdf8'; // Sky blue
      case 'PERSON': return '#a855f7';       // Purple
      case 'PROJECT': return '#34d399';      // Emerald
      case 'GOVERNMENT_BODY': return '#f59e0b'; // Amber
      case 'DOCUMENT': return '#94a3b8';     // Slate
      case 'FACT': return '#ccff00';         // Neon Lime
      default: return '#10b981';
    }
  };

  const filteredNodes = filterType === 'ALL'
    ? graphData.nodes
    : graphData.nodes.filter(n => {
        if (filterType === 'ENTITY') return n.category === 'entity';
        if (filterType === 'DOCUMENT') return n.category === 'document';
        if (filterType === 'FACT') return n.category === 'fact';
        return true;
      });

  const connectedEdges = selectedNode
    ? graphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-lime-400 font-mono text-xs uppercase tracking-wider">
              <Share2 className="w-4 h-4" />
              <span>Multi-Source Entity & Fact Relationship Graph</span>
            </div>
            <h2 className="text-xl font-bold text-white font-mono mt-1">
              Deterministic Knowledge Fabric
            </h2>
            <p className="text-xs text-slate-400">
              Interactive relationship network linking Persons, Organizations, Projects, Documents, and Facts.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="text-slate-500 text-[11px]">Filter:</span>
            {['ALL', 'ENTITY', 'DOCUMENT', 'FACT'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-md transition-all ${
                  filterType === type
                    ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40 font-semibold'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Graph Grid: Interactive Canvas + Node Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Visual Graph Viewport (3 cols) */}
        <div className="lg:col-span-3 p-4 rounded-2xl glass-panel border border-white/10 relative overflow-hidden bg-[#0a0d14]/90 min-h-[500px]">
          <svg className="w-full h-[480px]" viewBox="0 0 850 480">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="6"
                refX="20"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="rgba(255,255,255,0.3)" />
              </marker>
              <marker
                id="arrowhead-red"
                markerWidth="8"
                markerHeight="6"
                refX="20"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#f43f5e" />
              </marker>
            </defs>

            {/* Edges */}
            {graphData.edges.map((edge) => {
              const srcPos = nodePositions[edge.source] || { x: 400, y: 240 };
              const tgtPos = nodePositions[edge.target] || { x: 400, y: 240 };
              const isContradiction = edge.label.includes('CONTRADICTS');
              const isHighlighted = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);

              return (
                <g key={edge.id} className="transition-all duration-200">
                  <line
                    x1={srcPos.x}
                    y1={srcPos.y}
                    x2={tgtPos.x}
                    y2={tgtPos.y}
                    stroke={isContradiction ? '#f43f5e' : isHighlighted ? '#ccff00' : 'rgba(255,255,255,0.18)'}
                    strokeWidth={isContradiction ? 2.5 : isHighlighted ? 2.5 : 1.5}
                    strokeDasharray={isContradiction ? '4 3' : 'none'}
                    markerEnd={isContradiction ? 'url(#arrowhead-red)' : 'url(#arrowhead)'}
                  />
                  {/* Edge Label on midpoint */}
                  <text
                    x={(srcPos.x + tgtPos.x) / 2}
                    y={(srcPos.y + tgtPos.y) / 2 - 4}
                    fill={isContradiction ? '#fca5a5' : isHighlighted ? '#ccff00' : '#64748b'}
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const pos = nodePositions[node.id] || { x: 400, y: 240 };
              const isSelected = selectedNode?.id === node.id;
              const nodeColor = getNodeColor(node);

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-transform duration-200 hover:scale-110"
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 18 : 14}
                    fill="#111827"
                    stroke={isSelected ? '#ffffff' : nodeColor}
                    strokeWidth={isSelected ? 3 : 2}
                    className="drop-shadow-lg"
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 8 : 6}
                    fill={nodeColor}
                  />
                  <text
                    x={pos.x}
                    y={pos.y + 28}
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize="10"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="monospace"
                    textAnchor="middle"
                    className="select-none pointer-events-none"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="absolute bottom-3 left-4 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-400 bg-black/60 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-sm">
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block"></span>
              <span>Organization</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
              <span>Person</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
              <span>Project</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block"></span>
              <span>Document</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400 inline-block"></span>
              <span>Fact</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-400">
              <span className="w-3 h-0.5 border-t border-rose-500 border-dashed inline-block"></span>
              <span>Contradiction</span>
            </span>
          </div>
        </div>

        {/* Selected Node Details Panel (1 col) */}
        <div className="p-5 rounded-2xl glass-panel space-y-4">
          <div className="pb-3 border-b border-white/10">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Selected Node Inspector</span>
            {selectedNode ? (
              <div className="mt-1">
                <span className="text-sm font-bold text-white block font-mono">{selectedNode.label}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-lime-400 font-mono inline-block mt-1">
                  {selectedNode.type}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Click a node to inspect relationships</span>
            )}
          </div>

          {selectedNode && (
            <div className="space-y-3">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>Node ID:</span>
                <strong className="text-slate-200">{selectedNode.id}</strong>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block mb-2">
                  Connected Edges ({connectedEdges.length})
                </span>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {connectedEdges.map((edge) => (
                    <div
                      key={edge.id}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-white/5 text-xs font-mono space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={edge.label.includes('CONTRADICTS') ? 'text-rose-400 font-bold' : 'text-lime-400'}>
                          {edge.label}
                        </span>
                        <span className="text-slate-500">{(edge.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {edge.source} → {edge.target}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
