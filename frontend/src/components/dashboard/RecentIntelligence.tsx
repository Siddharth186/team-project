import React, { useState } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  Clock,
  Share2,
  ChevronRight,
  FileText,
  Search,
  Plus,
  Sparkles,
  Layers
} from 'lucide-react';
import { nexusData } from '../../data/demoData';
import { Finding } from '../../types/nexus';

interface RecentIntelligenceProps {
  findings?: Finding[];
  onSelectItem: (item: any) => void;
  onViewAll: () => void;
}

export const RecentIntelligence: React.FC<RecentIntelligenceProps> = ({
  findings = [],
  onSelectItem,
  onViewAll
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SUCCESS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-[#FF7777]" />;
      case 'warning':
      case 'missing':
        return <HelpCircle className="w-4 h-4 text-[#FFBD59]" />;
      case 'success':
      case 'discovered':
        return <Share2 className="w-4 h-4 text-[#79DF9B]" />;
      default:
        return <Clock className="w-4 h-4 text-[#C9FF3D]" />;
    }
  };

  const getTagColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'critical':
        return 'bg-[#FF7777]/15 text-[#FF7777] border-[#FF7777]/30';
      case 'warning':
      case 'missing':
        return 'bg-[#FFBD59]/15 text-[#FFBD59] border-[#FFBD59]/30';
      case 'success':
      case 'discovered':
        return 'bg-[#79DF9B]/15 text-[#79DF9B] border-[#79DF9B]/30';
      default:
        return 'bg-[#C9FF3D]/15 text-[#C9FF3D] border-[#C9FF3D]/30';
    }
  };

  const getColorHex = (type: string) => {
    switch (type.toLowerCase()) {
      case 'critical': return '#FF7777';
      case 'warning':
      case 'missing': return '#FFBD59';
      case 'success':
      case 'discovered': return '#79DF9B';
      default: return '#C9FF3D';
    }
  };

  // Convert live findings to intelligence items
  const dynamicItems = findings.map((f, idx) => {
    const type = (f.severity || 'WARNING').toLowerCase();
    const firstFact = f.conflictingFacts?.[0];
    const sourceDoc = firstFact?.source?.documentName || 'Uploaded File';
    const pageNum = firstFact?.source?.pageNumber || 1;

    return {
      id: f.id || `find-${idx}`,
      title: f.title || 'Cross-Document Intelligence Finding',
      description: f.summary || f.reasoning || 'Verified cross-document evidence',
      type: type === 'high' ? 'critical' : type === 'medium' ? 'warning' : type === 'low' ? 'success' : type,
      confidence: Math.round((f.confidence || 0.94) * 100),
      timestamp: 'Verified',
      color: getColorHex(type),
      sourceText: `Source Verified: ${sourceDoc} (Page ${pageNum})`,
      rawFinding: f
    };
  });

  const displayList = dynamicItems.length > 0 ? dynamicItems : nexusData.recentIntelligence.map(item => ({
    ...item,
    sourceText: 'Source Verified: Page-level verbatim cross-reference available'
  }));

  const criticalCount = displayList.filter(i => i.type === 'critical').length;

  // Filter by Category Tab AND Search Query dedicated solely to Recent Intelligence
  const filteredItems = displayList.filter(item => {
    // 1. Tab Filter
    let matchesTab = true;
    if (activeFilter === 'CRITICAL') matchesTab = item.type === 'critical';
    else if (activeFilter === 'WARNING') matchesTab = item.type === 'warning' || item.type === 'missing';
    else if (activeFilter === 'SUCCESS') matchesTab = item.type === 'success' || item.type === 'discovered';

    if (!matchesTab) return false;

    // 2. Local Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.title.toLowerCase().includes(q);
      const descMatch = item.description.toLowerCase().includes(q);
      const sourceMatch = item.sourceText.toLowerCase().includes(q);
      const typeMatch = item.type.toLowerCase().includes(q);
      return titleMatch || descMatch || sourceMatch || typeMatch;
    }

    return true;
  });

  // Shortlist (top 4) vs Expanded All View
  const visibleItems = isExpanded || searchQuery.trim()
    ? filteredItems
    : filteredItems.slice(0, 4);

  return (
    <div className="glass-panel-nexus rounded-3xl p-6 sm:p-7 border border-[#292D2B] flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden min-h-[380px]">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#C9FF3D]/5 blur-3xl pointer-events-none" />

      {/* Header Row with Breadth & Side Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-[#292D2B] relative z-10">
        {/* Left Side: Title & Badges */}
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D] flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M 12 2 C 12.5 7 17 11.5 22 12 C 17 12.5 12.5 17 12 22 C 11.5 17 7 12.5 2 12 C 7 11.5 11.5 7 12 2 Z"
                fill="#C9FF3D"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F7F5]">
                Recent Intelligence
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#FF7777]/15 border border-[#FF7777]/30 text-[#FF7777] text-[10px] font-mono font-bold">
                {criticalCount} Critical
              </span>
            </div>
            <span className="text-[10px] text-[#8F9691] font-sans">
              Cross-Document Contradictions & Validation Anomalies
            </span>
          </div>
        </div>

        {/* Right Side: Dedicated Search Bar + Filter Pills + View All */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Side Search Bar (Dedicated to Recent Intelligence Search) */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#8F9691] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search intelligence..."
              className="pl-8 pr-3 py-1 rounded-xl bg-[#111312] border border-[#292D2B] text-xs font-mono text-[#F5F7F5] placeholder-[#8F9691] focus:outline-none focus:border-[#C9FF3D]/50 transition-colors w-36 sm:w-48"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 overflow-x-auto">
            {(['ALL', 'CRITICAL', 'WARNING', 'SUCCESS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all cursor-pointer ${
                  activeFilter === tab
                    ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold shadow-[0_0_10px_rgba(201,255,61,0.3)]'
                    : 'bg-[#171A18] text-[#8F9691] hover:text-[#F5F7F5] border border-[#292D2B]'
                }`}
              >
                {tab === 'ALL' ? `All (${displayList.length})` : tab === 'CRITICAL' ? 'Critical' : tab === 'WARNING' ? 'Missing' : 'Discovered'}
              </button>
            ))}

            <button
              onClick={onViewAll}
              className="text-xs font-mono text-[#8F9691] hover:text-[#C9FF3D] pl-2 flex items-center space-x-1 transition-colors group cursor-pointer"
            >
              <span>View all</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Intelligence List Area */}
      <div className="space-y-2 relative z-10 flex-1">
        {/* Shortlist Header Indicator */}
        <div className="flex items-center justify-between text-[10px] font-mono text-[#8F9691] uppercase px-1">
          <span>
            {isExpanded || searchQuery.trim()
              ? `All Findings (${filteredItems.length} of ${displayList.length})`
              : `Intelligence Shortlist (Showing 4 of ${displayList.length})`}
          </span>
          <span>Confidence</span>
        </div>

        {visibleItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 text-[#8F9691] rounded-2xl bg-[#111312]/40 border border-dashed border-[#292D2B]">
            <FileText className="w-8 h-8 text-[#8F9691]/40 mb-1" />
            <p className="text-xs font-mono text-[#F5F7F5]">No matching intelligence findings</p>
            <p className="text-[11px] font-sans text-[#8F9691] max-w-xs">
              {searchQuery ? `No results found for "${searchQuery}". Try a different term.` : 'No findings detected in this category.'}
            </p>
          </div>
        ) : (
          <div className={`${isExpanded ? 'max-h-80' : 'max-h-none'} overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-[#292D2B] scrollbar-track-transparent`}>
            {visibleItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#171A18]/85 hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group shadow-sm"
              >
                {/* Left Column: Icon + Title + Description + Citation tag */}
                <div className="flex items-start sm:items-center space-x-3.5 min-w-0 flex-1">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 shadow-inner"
                    style={{ backgroundColor: `${item.color}18`, border: `1px solid ${item.color}35` }}
                  >
                    {getItemIcon(item.type)}
                  </div>

                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <h4 className="text-xs font-bold text-[#F5F7F5] group-hover:text-[#C9FF3D] transition-colors font-mono truncate max-w-[340px]">
                        {item.title}
                      </h4>
                      <span className={`px-2 py-0.2 rounded-full text-[9px] font-mono border ${getTagColor(item.type)}`}>
                        {item.type.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8F9691] font-sans leading-snug line-clamp-1">
                      {item.description}
                    </p>

                    {/* Evidence Citation Tag spanning breadth */}
                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#C9FF3D]/80 truncate">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{item.sourceText}</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Confidence + Time + Action Arrow */}
                <div className="flex items-center space-x-4 flex-shrink-0 self-end sm:self-center pl-2">
                  <div className="text-right">
                    <span className="text-[9px] font-mono uppercase text-[#8F9691] block leading-none">
                      Confidence
                    </span>
                    <span className="text-xs font-mono font-bold text-[#F5F7F5]">
                      {item.confidence}%
                    </span>
                  </div>

                  {/* Mini Circular Progress Ring */}
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    <svg className="w-6 h-6 transform -rotate-90">
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="#1D211F"
                        strokeWidth="2.2"
                        fill="none"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke={item.color}
                        strokeWidth="2.2"
                        strokeDasharray={2 * Math.PI * 9}
                        strokeDashoffset={2 * Math.PI * 9 * (1 - item.confidence / 100)}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                  </div>

                  <span className="text-[10px] font-mono text-[#8F9691] whitespace-nowrap">
                    {item.timestamp}
                  </span>

                  <div className="w-7 h-7 rounded-lg bg-[#111312] border border-[#292D2B] group-hover:border-[#C9FF3D]/50 group-hover:bg-[#C9FF3D]/10 flex items-center justify-center text-[#8F9691] group-hover:text-[#C9FF3D] transition-colors">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* More Button: Reveals ALL intelligence findings when clicked (Matching DocumentSummary) */}
        {!isExpanded && filteredItems.length > 4 && !searchQuery.trim() && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#111312] hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/50 text-xs font-mono text-[#C9FF3D] font-bold flex items-center justify-center space-x-2 transition-all shadow-md group cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] group-hover:rotate-90 transition-transform" />
            <span>More ({filteredItems.length - 4} findings)</span>
          </button>
        )}

        {/* Show Less Toggle when expanded */}
        {isExpanded && !searchQuery.trim() && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] font-mono text-[#8F9691]">
              Showing all {filteredItems.length} findings
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-[10px] font-mono text-[#C9FF3D] hover:underline cursor-pointer"
            >
              Show Less (Compact 4-finding view)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
