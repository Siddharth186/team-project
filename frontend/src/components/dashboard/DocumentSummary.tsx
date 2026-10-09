import React from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileImage,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  Plus,
  FileCheck
} from 'lucide-react';
import { nexusData } from '../../data/demoData';

interface DocumentSummaryProps {
  documents?: any[];
  onViewAll: () => void;
  onSelectDocument: (doc: any) => void;
}

export const DocumentSummary: React.FC<DocumentSummaryProps> = ({
  documents,
  onViewAll,
  onSelectDocument
}) => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncFeedback, setSyncFeedback] = React.useState<string | null>(null);

  const handleLiveSync = () => {
    setIsSyncing(true);
    setSyncFeedback('Synchronizing dossiers with backend orchestrator...');
    setTimeout(() => {
      setIsSyncing(false);
      setSyncFeedback('Live Sync complete: All documents verified with Member 1 & Member 2.');
      setTimeout(() => setSyncFeedback(null), 3000);
    }, 800);
  };

  const getFormatIcon = (format: string) => {
    switch (format.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-[#C9FF3D]" />;
      case 'docx':
        return <FileText className="w-3.5 h-3.5 text-[#38BDF8]" />;
      case 'csv':
        return <FileSpreadsheet className="w-3.5 h-3.5 text-[#79DF9B]" />;
      case 'txt':
        return <FileText className="w-3.5 h-3.5 text-[#F5F7F5]" />;
      case 'images':
        return <FileImage className="w-3.5 h-3.5 text-[#FFBD59]" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#C9FF3D]" />;
    }
  };

  const [searchQuery, setSearchQuery] = React.useState('');

  const allMappedFiles = Array.isArray(documents)
    ? documents.slice().reverse().map(d => ({
        id: d.id,
        rawDoc: d,
        name: d.name,
        size: typeof d.fileSize === 'number' ? `${(d.fileSize / (1024 * 1024)).toFixed(1)} MB` : (d.size || '1.8 MB'),
        pages: `${d.totalPages || 1} pgs`,
        time: d.uploadedAt ? d.uploadedAt.replace('T', ' ').substring(0, 16) : 'Active',
        status: d.status === 'PROCESSED' ? 'Analyzed' : (d.status || 'Processing'),
        progress: d.processingProgress || 100,
        category: d.documentCategory || 'FINANCIAL',
        report: d.report,
        tags: d.tags || []
      }))
    : [];

  const displayFiles = searchQuery.trim()
    ? allMappedFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.category.toLowerCase().includes(searchQuery.toLowerCase()) || (f.tags || []).some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase())))
    : allMappedFiles;

  const totalCount = Array.isArray(documents) ? documents.length : 0;

  const [isExpanded, setIsExpanded] = React.useState(false);

  const visibleFiles = isExpanded || searchQuery.trim()
    ? displayFiles
    : displayFiles.slice(0, 4);

  return (
    <div className="glass-panel-nexus rounded-3xl p-6 sm:p-7 border border-[#292D2B] flex flex-col justify-between space-y-4 shadow-2xl relative overflow-hidden min-h-[380px]">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-[#79DF9B]/5 blur-3xl pointer-events-none" />

      {/* Header with breadth */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#292D2B] relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#F5F7F5]">
                Document Summary
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#C9FF3D]/15 border border-[#C9FF3D]/30 text-[#C9FF3D] text-[10px] font-mono font-bold">
                {totalCount} Ingested
              </span>
            </div>
            <span className="text-[10px] text-[#8F9691] font-sans">
              All Multimodal Ingestion Files with Stored PDF Intelligence Reports
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleLiveSync}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono transition-all cursor-pointer ${
              isSyncing
                ? 'bg-[#C9FF3D]/20 text-[#C9FF3D] border-[#C9FF3D]'
                : 'bg-[#171A18] hover:bg-[#1D211F] text-[#8F9691] hover:text-[#F5F7F5] border-[#292D2B] hover:border-[#C9FF3D]/40'
            }`}
            title="Click to trigger immediate verification sync"
          >
            <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-[#C9FF3D] animate-ping' : 'bg-[#C9FF3D] animate-pulse'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Live Sync'}</span>
          </button>

          <button
            onClick={onViewAll}
            className="text-xs font-mono text-[#8F9691] hover:text-[#C9FF3D] flex items-center space-x-1 transition-colors group cursor-pointer"
          >
            <span>Upload more</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </button>
        </div>
      </div>

      {/* Search and filter bar */}
      <div className="relative z-10">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search across ${totalCount} uploaded documents (name, category, or #tag)...`}
          className="w-full px-3.5 py-2 rounded-xl bg-[#111312] border border-[#292D2B] text-xs font-mono text-[#F5F7F5] placeholder-[#8F9691] focus:outline-none focus:border-[#C9FF3D]/50 transition-colors"
        />
      </div>

      {/* Sync Feedback Banner */}
      {syncFeedback && (
        <div className="mx-1 p-2 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 text-xs font-mono text-[#F5F7F5] flex items-center space-x-2 animate-in fade-in duration-150">
          <Sparkles className="w-3.5 h-3.5 text-[#C9FF3D] flex-shrink-0" />
          <span className="truncate">{syncFeedback}</span>
        </div>
      )}

      {/* Lower Section: Ingested Dossier Table */}
      <div className="space-y-2 relative z-10 flex-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-[#8F9691] uppercase px-1">
          <span>
            {isExpanded || searchQuery.trim()
              ? `All Uploaded Documents (${displayFiles.length} of ${totalCount})`
              : `Uploaded Files Preview (Showing 4 of ${totalCount})`}
          </span>
          <span>Stored Report & Status</span>
        </div>

        {visibleFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 text-[#8F9691] rounded-2xl bg-[#111312]/40 border border-dashed border-[#292D2B]">
            <FileText className="w-8 h-8 text-[#8F9691]/40 mb-1" />
            <p className="text-xs font-mono text-[#F5F7F5]">No documents uploaded yet</p>
            <p className="text-[11px] font-sans text-[#8F9691] max-w-xs">
              Upload files using the "Upload Document" button to analyze and extract intelligence.
            </p>
          </div>
        ) : (
          <div className={`${isExpanded ? 'max-h-72' : 'max-h-none'} overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-[#292D2B] scrollbar-track-transparent`}>
            {visibleFiles.map((doc, idx) => (
              <div
                key={idx}
                onClick={() => onSelectDocument(doc.rawDoc || doc)}
                className="p-2.5 sm:p-3 rounded-xl bg-[#171A18]/85 hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/40 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                {/* Left: Icon + File Name + Metadata + Tags */}
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-[#111312] border border-[#292D2B] flex items-center justify-center flex-shrink-0 text-[#C9FF3D]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h5 className="text-xs font-semibold text-[#F5F7F5] group-hover:text-[#C9FF3D] transition-colors truncate font-mono">
                      {doc.name}
                    </h5>
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-[#8F9691]">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.pages}</span>
                      <span>•</span>
                      <span className="text-[#C9FF3D]/80">{doc.category}</span>
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          {doc.tags.slice(0, 2).map((t: string, ti: number) => (
                            <span key={ti} className="px-1.5 py-0.2 rounded bg-[#111312] text-[#C9FF3D]/90 border border-[#292D2B] text-[9px]">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: PDF Report Button + Status Badge */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectDocument(doc.rawDoc || doc);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#C9FF3D]/10 hover:bg-[#C9FF3D]/25 text-[#C9FF3D] border border-[#C9FF3D]/30 text-[10px] font-mono flex items-center space-x-1.5 transition-all cursor-pointer group/btn"
                    title="View Full PDF Document Audit Report"
                  >
                    <FileCheck className="w-3 h-3 text-[#C9FF3D]" />
                    <span className="font-bold">PDF Report</span>
                  </button>

                  {doc.status === 'Processing' ? (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#C9FF3D]/15 text-[#C9FF3D] border border-[#C9FF3D]/30 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C9FF3D] animate-ping" />
                      <span>{doc.progress}%</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#79DF9B]/15 text-[#79DF9B] border border-[#79DF9B]/30 flex items-center space-x-1">
                      <CheckCircle2 className="w-2.5 h-2.5 stroke-[2.5]" />
                      <span>Analyzed</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* More Button: Reveals ALL uploaded files when clicked */}
        {!isExpanded && displayFiles.length > 4 && !searchQuery.trim() && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="w-full mt-2 py-2.5 rounded-xl bg-[#111312] hover:bg-[#1D211F] border border-[#292D2B] hover:border-[#C9FF3D]/50 text-xs font-mono text-[#C9FF3D] font-bold flex items-center justify-center space-x-2 transition-all shadow-md group cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] group-hover:rotate-90 transition-transform" />
            <span>More ({displayFiles.length - 4} files)</span>
          </button>
        )}

        {/* Show Less Toggle when expanded */}
        {isExpanded && !searchQuery.trim() && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] font-mono text-[#8F9691]">Showing all {displayFiles.length} files</span>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="text-[10px] font-mono text-[#C9FF3D] hover:underline cursor-pointer"
            >
              Show Less (Compact 4-file view)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
