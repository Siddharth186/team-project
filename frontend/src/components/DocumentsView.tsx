import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Plus,
  RefreshCw,
  FolderOpen,
  Trash2,
  FileSpreadsheet,
  FileImage,
  Layers,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  AlertTriangle,
  Boxes,
  ListFilter
} from 'lucide-react';
import { DocumentItem, BatchGroup } from '../types/nexus';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onUpload: (files: Array<{ name: string; size: number; type: string } | string>) => void;
  onRefreshProgress: () => void;
  onDeleteDocument?: (id: string) => void;
  onDeleteBatch?: (batchId: string) => void;
  onDeleteMultiple?: (ids: string[]) => void;
  onDeleteAll?: () => void;
  onSelectDocument?: (doc: DocumentItem) => void;
  onOpenReport?: (type: 'ALL' | 'DOCUMENT' | 'BATCH', id: string, name: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onUpload,
  onRefreshProgress,
  onDeleteDocument,
  onDeleteBatch,
  onDeleteMultiple,
  onDeleteAll,
  onSelectDocument,
  onOpenReport
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'BATCHES' | 'ALL_FILES'>('BATCHES');
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [lastUploadedCount, setLastUploadedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processingDocs = documents.filter(d => d.status === 'PROCESSING');
  const processedDocs = documents.filter(d => d.status === 'PROCESSED');
  const totalPages = documents.reduce((acc, d) => acc + (d.totalPages || 0), 0);
  
  const avgProgress = processingDocs.length > 0
    ? Math.round(processingDocs.reduce((acc, d) => acc + (d.processingProgress || 0), 0) / processingDocs.length)
    : 100;

  // Group documents into batches
  const batchMap = new Map<string, BatchGroup>();
  documents.forEach((doc, idx) => {
    const bId = doc.batchId || `batch-${doc.uploadedAt ? doc.uploadedAt.substring(0, 16) : 'default'}`;
    const timeStr = doc.uploadedAt ? doc.uploadedAt.replace('T', ' ').substring(0, 16) : 'Recent';
    const bName = doc.batchName || `Upload Batch (${timeStr})`;

    if (!batchMap.has(bId)) {
      batchMap.set(bId, {
        batchId: bId,
        batchName: bName,
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
        documents: [],
        totalFiles: 0,
        totalSize: 0,
        status: doc.status
      });
    }
    const b = batchMap.get(bId)!;
    b.documents.push(doc);
    b.totalFiles += 1;
    b.totalSize += (doc.fileSize || 0);
  });

  const batches = Array.from(batchMap.values());

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFileList = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const items = Array.from(fileList).map(file => ({
      name: file.name,
      size: file.size,
      type: file.name.split('.').pop() || 'pdf'
    }));

    setLastUploadedCount(items.length);
    setTimeout(() => setLastUploadedCount(null), 5000);
    onUpload(items);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(e.target.files);
      e.target.value = '';
    }
  };

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleBatchDemoUpload = () => {
    const demoBatch = [
      { name: 'Board_Resolution_Authorizing_Term_Loan.pdf', size: 1845000, type: 'pdf' },
      { name: 'Electricity_Tariff_Subsidy_NOC.pdf', size: 920000, type: 'pdf' },
      { name: 'Director_Aadhaar_PAN_KYC_Verification.pdf', size: 1420000, type: 'pdf' }
    ];
    setLastUploadedCount(demoBatch.length);
    setTimeout(() => setLastUploadedCount(null), 5000);
    onUpload(demoBatch);
  };

  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedDocIds.size === filteredDocs.length) {
      setSelectedDocIds(new Set());
    } else {
      setSelectedDocIds(new Set(filteredDocs.map(d => d.id)));
    }
  };

  const toggleBatchExpand = (batchId: string) => {
    setExpandedBatches(prev => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedDocIds.size === 0) return;
    if (onDeleteMultiple) {
      onDeleteMultiple(Array.from(selectedDocIds));
    } else if (onDeleteDocument) {
      selectedDocIds.forEach(id => onDeleteDocument(id));
    }
    setSelectedDocIds(new Set());
  };

  const handleConfirmClearAll = () => {
    if (onDeleteAll) {
      onDeleteAll();
    }
    setShowClearConfirm(false);
    setSelectedDocIds(new Set());
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'xlsx':
      case 'xls':
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
        return <FileImage className="w-4 h-4 text-cyan-400 flex-shrink-0" />;
      default:
        return <FileText className="w-4 h-4 text-[#C9FF3D] flex-shrink-0" />;
    }
  };

  const filteredDocs = filterCategory === 'ALL'
    ? documents
    : documents.filter(d => d.documentCategory === filterCategory);

  return (
    <div className="space-y-6">
      {/* Hidden Native File Input supporting MULTIPLE file selection */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Confirmation Toast if files were just added */}
      {lastUploadedCount !== null && (
        <div className="p-4 rounded-xl bg-[#C9FF3D]/15 border border-[#C9FF3D]/40 text-[#C9FF3D] flex items-center justify-between text-xs font-mono animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#C9FF3D] flex-shrink-0" />
            <span>
              <strong>{lastUploadedCount} file(s)</strong> submitted in a single shot to Member 1 Ingestion & OCR pipeline!
            </span>
          </div>
          <span className="text-[11px] text-[#C9FF3D]/80">Grouped into dedicated Upload Batch</span>
        </div>
      )}

      {/* Processing Status Banner if active */}
      {processingDocs.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel-glow border border-[#C9FF3D]/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-[#C9FF3D]/20 text-[#C9FF3D] flex items-center justify-center animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  MEMBER 1 PARSING & INGESTION PIPELINE ACTIVE
                </h3>
                <p className="text-xs text-slate-300">
                  Processing {processingDocs.length} document(s) concurrently • Extracting text, tables & atomic facts
                </p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-sm font-bold text-[#C9FF3D]">{processingDocs.length} in progress</span>
              <p className="text-xs text-slate-400">{avgProgress}% completed</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-[#C9FF3D] h-2.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(201,255,61,0.5)]"
              style={{ width: `${avgProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Main Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleOpenFileDialog}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center cursor-pointer ${
          dragActive
            ? 'border-[#C9FF3D] bg-[#C9FF3D]/10 scale-[1.01]'
            : 'border-white/15 hover:border-[#C9FF3D]/50 glass-panel hover:bg-slate-900/60'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(201,255,61,0.15)]">
          <UploadCloud className="w-7 h-7 text-[#C9FF3D]" />
        </div>
        <h3 className="text-base font-bold text-white font-mono">
          Upload Single or Multiple Documents
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-lg">
          Click to browse or drag & drop files. Each upload event is recorded as a dedicated <strong>Batch</strong> for organized tracking, targeted review, and quick bulk removal.
        </p>

        {/* Buttons */}
        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleOpenFileDialog}
            className="px-5 py-2.5 rounded-xl bg-[#C9FF3D] hover:bg-[#bbf030] text-[#0D0F0E] font-bold text-xs tracking-wider uppercase font-mono flex items-center space-x-2 transition-all shadow-lg shadow-[#C9FF3D]/20 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Select Multiple Files</span>
          </button>

          <button
            type="button"
            onClick={handleBatchDemoUpload}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center space-x-1.5 border border-white/10 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#C9FF3D]" />
            <span>Add Test Batch (3 Files)</span>
          </button>

          <button
            type="button"
            onClick={onRefreshProgress}
            className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-xs flex items-center space-x-1 border border-white/10 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl glass-panel border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Dossier Files</span>
            <span className="text-lg font-bold text-white block font-mono">{documents.length}</span>
          </div>
          <FolderOpen className="w-5 h-5 text-slate-400" />
        </div>
        <div className="p-3.5 rounded-xl glass-panel border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Upload Batches</span>
            <span className="text-lg font-bold text-[#C9FF3D] block font-mono">{batches.length}</span>
          </div>
          <Boxes className="w-5 h-5 text-[#C9FF3D]" />
        </div>
        <div className="p-3.5 rounded-xl glass-panel border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Pages</span>
            <span className="text-lg font-bold text-cyan-400 block font-mono">{totalPages}</span>
          </div>
          <FileText className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="p-3.5 rounded-xl glass-panel border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Processed Docs</span>
            <span className="text-lg font-bold text-emerald-400 block font-mono">{processedDocs.length}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Clear All Confirmation Modal / Banner */}
      {showClearConfirm && (
        <div className="p-5 rounded-2xl bg-[#FF7777]/10 border border-[#FF7777]/40 text-[#F5F7F5] space-y-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#FF7777] flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold font-mono text-[#FF7777]">
                Clear All {documents.length} Documents & Intelligence Records?
              </h4>
              <p className="text-xs text-slate-300">
                This will delete all uploaded files, vector indexes, extracted facts, and conflict findings in 1 shot.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 justify-end pt-2">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmClearAll}
              className="px-4 py-1.5 rounded-xl bg-[#FF7777] hover:bg-rose-600 text-black font-bold font-mono text-xs shadow-lg shadow-rose-900/40 cursor-pointer"
            >
              Yes, Delete All Documents
            </button>
          </div>
        </div>
      )}

      {/* Main Container with View Mode Toggle & Bulk Delete Controls */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <FileCheck className="w-4 h-4 text-[#C9FF3D]" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Ingested Verification Dossier ({documents.length} Files)
            </h3>
          </div>

          {/* Action Toolbar: View Mode + Bulk Delete + Clear All */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#171A18] rounded-xl p-1 border border-[#292D2B]">
              <button
                onClick={() => setViewMode('BATCHES')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'BATCHES'
                    ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Batches ({batches.length})</span>
              </button>
              <button
                onClick={() => setViewMode('ALL_FILES')}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center space-x-1.5 ${
                  viewMode === 'ALL_FILES'
                    ? 'bg-[#C9FF3D] text-[#0D0F0E] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>All Files ({documents.length})</span>
              </button>
            </div>

            {/* Bulk Delete Selected Button */}
            {selectedDocIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-3 py-1.5 rounded-xl bg-[#FF7777]/20 hover:bg-[#FF7777]/30 text-[#FF7777] border border-[#FF7777]/40 font-mono text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedDocIds.size})</span>
              </button>
            )}

            {/* Dossier Report Button */}
            {documents.length > 0 && onOpenReport && (
              <button
                onClick={() => onOpenReport('ALL', 'all', 'Full Ingested Dossier')}
                className="px-3 py-1.5 rounded-xl bg-[#C9FF3D]/15 hover:bg-[#C9FF3D]/25 text-[#C9FF3D] border border-[#C9FF3D]/30 font-mono text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Generate comprehensive intelligence report for all documents"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Dossier Report</span>
              </button>
            )}

            {/* Clear All Button */}
            {documents.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-3 py-1.5 rounded-xl bg-[#FF7777]/10 hover:bg-[#FF7777]/20 text-[#FF7777] border border-[#FF7777]/30 font-mono text-xs flex items-center space-x-1.5 transition-colors cursor-pointer"
                title="Clear all documents from dossier"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All</span>
              </button>
            )}
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-1.5 text-xs font-mono overflow-x-auto pb-1">
          <span className="text-slate-500 text-[11px] uppercase mr-1">Category:</span>
          {['ALL', 'FINANCIAL', 'GRANT', 'TAX', 'IDENTITY', 'LEGAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filterCategory === cat
                  ? 'bg-[#C9FF3D]/20 text-[#C9FF3D] border border-[#C9FF3D]/40'
                  : 'text-slate-400 hover:text-white bg-slate-900/60 border border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl space-y-3">
            <FolderOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-mono text-slate-300">No documents uploaded yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Upload PDF documents or add a demo batch above to initialize intelligence indexing and cross-file verification.
            </p>
          </div>
        )}

        {/* MODE A: BATCHES VIEW */}
        {viewMode === 'BATCHES' && documents.length > 0 && (
          <div className="space-y-3">
            {batches.map((batch) => {
              const isExpanded = expandedBatches.has(batch.batchId);
              const batchDocs = filterCategory === 'ALL'
                ? batch.documents
                : batch.documents.filter(d => d.documentCategory === filterCategory);

              return (
                <div
                  key={batch.batchId}
                  className="rounded-2xl bg-[#171A18]/80 border border-[#292D2B] overflow-hidden transition-all duration-200"
                >
                  {/* Batch Header Bar */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1D211F] transition-colors">
                    <div
                      onClick={() => toggleBatchExpand(batch.batchId)}
                      className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0"
                    >
                      <button className="p-1 rounded bg-[#111312] text-slate-400 hover:text-[#C9FF3D]">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-[#C9FF3D]" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div className="w-8 h-8 rounded-lg bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D] flex-shrink-0">
                        <Boxes className="w-4 h-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-xs font-bold text-white font-mono truncate">
                            {batch.batchName}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full bg-[#C9FF3D]/15 text-[#C9FF3D] border border-[#C9FF3D]/30 text-[10px] font-mono">
                            {batch.totalFiles} file{batch.totalFiles > 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Uploaded: {batch.uploadedAt ? batch.uploadedAt.replace('T', ' ').substring(0, 16) : 'Just now'} • {(batch.totalSize / (1024 * 1024)).toFixed(2)} MB
                        </span>
                      </div>
                    </div>

                    {/* Batch Actions */}
                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      {onOpenReport && (
                        <button
                          onClick={() => onOpenReport('BATCH', batch.batchId, batch.batchName)}
                          className="px-2.5 py-1 rounded-lg bg-[#C9FF3D]/10 hover:bg-[#C9FF3D]/20 text-[#C9FF3D] border border-[#C9FF3D]/30 font-mono text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                          title="Generate Batch Report"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Batch Report</span>
                        </button>
                      )}

                      <button
                        onClick={() => toggleBatchExpand(batch.batchId)}
                        className="px-3 py-1 rounded-lg bg-[#111312] hover:bg-[#202522] text-slate-300 font-mono text-[11px] border border-[#292D2B] transition-colors cursor-pointer"
                      >
                        {isExpanded ? 'Hide Files' : 'View Files'}
                      </button>

                      {onDeleteBatch && (
                        <button
                          onClick={() => onDeleteBatch(batch.batchId)}
                          title="Delete entire batch"
                          className="px-2.5 py-1 rounded-lg bg-[#FF7777]/10 hover:bg-[#FF7777]/25 text-[#FF7777] border border-[#FF7777]/30 font-mono text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Batch</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded File List for this Batch */}
                  {isExpanded && (
                    <div className="border-t border-[#292D2B] bg-[#111312]/60 p-3 space-y-2">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-[10px] font-mono uppercase text-slate-400 border-b border-white/5">
                            <tr>
                              <th className="py-2 px-3">File Name</th>
                              <th className="py-2 px-3">Category</th>
                              <th className="py-2 px-3">Size & Pages</th>
                              <th className="py-2 px-3">Status</th>
                              <th className="py-2 px-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {batchDocs.map((doc) => (
                              <tr
                                key={doc.id}
                                className="hover:bg-slate-800/40 transition-colors"
                              >
                                <td className="py-2.5 px-3">
                                  <div
                                    onClick={() => onSelectDocument && onSelectDocument(doc)}
                                    className="flex items-center space-x-2 cursor-pointer group"
                                  >
                                    {getFileIcon(doc.fileType)}
                                    <div>
                                      <span className="font-semibold text-slate-200 group-hover:text-[#C9FF3D] block truncate max-w-[260px]" title={doc.name}>
                                        {doc.name}
                                      </span>
                                      <span className="text-[9px] text-slate-500 font-mono">ID: {doc.id}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-white/5">
                                    {doc.documentCategory}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                                  {(doc.fileSize / (1024 * 1024)).toFixed(2)} MB • {doc.totalPages} pages
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono inline-flex items-center space-x-1">
                                    <CheckCircle2 className="w-2.5 h-2.5" />
                                    <span>PROCESSED</span>
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-right">
                                  {onOpenReport && (
                                    <button
                                      type="button"
                                      onClick={() => onOpenReport('DOCUMENT', doc.id, doc.name)}
                                      title="Generate Document Report"
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#C9FF3D] hover:bg-[#C9FF3D]/10 transition-colors cursor-pointer mr-1"
                                    >
                                      <FileCheck className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                  {onDeleteDocument && (
                                    <button
                                      type="button"
                                      onClick={() => onDeleteDocument(doc.id)}
                                      title="Remove Document"
                                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* MODE B: ALL FILES FLAT LIST VIEW (with Checkbox Selection) */}
        {viewMode === 'ALL_FILES' && documents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-mono uppercase text-slate-400 border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-3 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="p-1 text-slate-400 hover:text-[#C9FF3D] cursor-pointer"
                    >
                      {selectedDocIds.size > 0 && selectedDocIds.size === filteredDocs.length ? (
                        <CheckSquare className="w-4 h-4 text-[#C9FF3D]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3">Document Name</th>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Size & Pages</th>
                  <th className="py-2.5 px-3">Uploaded</th>
                  <th className="py-2.5 px-3">Pipeline Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredDocs.map((doc) => {
                  const isSelected = selectedDocIds.has(doc.id);
                  return (
                    <tr
                      key={doc.id}
                      className={`hover:bg-slate-800/30 transition-colors ${
                        isSelected ? 'bg-[#C9FF3D]/5' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleSelectDoc(doc.id)}
                          className="p-1 text-slate-400 hover:text-[#C9FF3D] cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#C9FF3D]" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <div
                          onClick={() => onSelectDocument && onSelectDocument(doc)}
                          className="flex items-center space-x-2.5 cursor-pointer group"
                        >
                          {getFileIcon(doc.fileType)}
                          <div>
                            <span className="font-semibold text-slate-200 group-hover:text-[#C9FF3D] block truncate max-w-[260px]" title={doc.name}>
                              {doc.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">ID: {doc.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px] block" title={doc.batchName || 'Default'}>
                          {doc.batchName || 'Default Batch'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-white/5">
                          {doc.documentCategory}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {(doc.fileSize / (1024 * 1024)).toFixed(1)} MB • {doc.totalPages} pages
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-400">
                        {doc.uploadedAt ? doc.uploadedAt.replace('T', ' ').substring(0, 16) : 'Just now'}
                      </td>
                      <td className="py-3 px-3">
                        {doc.status === 'PROCESSED' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono inline-flex items-center space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PROCESSED (100%)</span>
                          </span>
                        ) : doc.status === 'PROCESSING' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/30 text-[10px] font-mono inline-flex items-center space-x-1 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>PROCESSING ({doc.processingProgress || 45}%)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono inline-flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>FAILED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {onOpenReport && (
                          <button
                            type="button"
                            onClick={() => onOpenReport('DOCUMENT', doc.id, doc.name)}
                            title="Generate Document Report"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#C9FF3D] hover:bg-[#C9FF3D]/10 transition-colors cursor-pointer mr-1"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDeleteDocument && (
                          <button
                            type="button"
                            onClick={() => onDeleteDocument(doc.id)}
                            title="Remove Document from Dossier"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
