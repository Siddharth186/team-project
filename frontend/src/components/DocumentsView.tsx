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
  ArrowRight
} from 'lucide-react';
import { DocumentItem } from '../types/nexus';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onUpload: (files: Array<{ name: string; size: number; type: string } | string>) => void;
  onRefreshProgress: () => void;
  onDeleteDocument?: (id: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onUpload,
  onRefreshProgress,
  onDeleteDocument
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [lastUploadedCount, setLastUploadedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processingDocs = documents.filter(d => d.status === 'PROCESSING');
  const processedDocs = documents.filter(d => d.status === 'PROCESSED');
  const totalPages = documents.reduce((acc, d) => acc + (d.totalPages || 0), 0);
  
  const avgProgress = processingDocs.length > 0
    ? Math.round(processingDocs.reduce((acc, d) => acc + (d.processingProgress || 0), 0) / processingDocs.length)
    : 100;

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
      // Reset input value so same files can be re-selected if desired
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
        return <FileText className="w-4 h-4 text-lime-400 flex-shrink-0" />;
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
        <div className="p-4 rounded-xl bg-lime-400/15 border border-lime-400/40 text-lime-300 flex items-center justify-between text-xs font-mono animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-lime-400 flex-shrink-0" />
            <span>
              <strong>{lastUploadedCount} file(s)</strong> submitted simultaneously to Member 1 Ingestion & OCR pipeline!
            </span>
          </div>
          <span className="text-[11px] text-lime-400/80">Parsing in progress...</span>
        </div>
      )}

      {/* Processing Status Banner if active */}
      {processingDocs.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel-glow border border-lime-400/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-lime-400/20 text-lime-400 flex items-center justify-center animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  MEMBER 1 PARSING & OCR PIPELINE ACTIVE
                </h3>
                <p className="text-xs text-slate-300">
                  Processing {processingDocs.length} document(s) concurrently • Extracting tables & bounding boxes
                </p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-sm font-bold text-lime-400">{processingDocs.length} in progress</span>
              <p className="text-xs text-slate-400">Est. 12s remaining • {avgProgress}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-lime-400 h-2.5 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(204,255,0,0.5)]"
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
            ? 'border-lime-400 bg-lime-400/10 scale-[1.01]'
            : 'border-white/15 hover:border-lime-400/50 glass-panel hover:bg-slate-900/60'
        }`}
      >
        <div className="w-14 h-14 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(204,255,0,0.15)]">
          <UploadCloud className="w-7 h-7 text-lime-400" />
        </div>
        <h3 className="text-base font-bold text-white font-mono">
          Upload Multiple Documents at Once
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-lg">
          Click to browse your computer or drag and drop multiple files (PDF, DOCX, XLSX, Scanned Images). You can select <strong>multiple files simultaneously</strong> using Ctrl/Shift or box-select.
        </p>

        {/* Buttons */}
        <div
          className="mt-5 flex flex-wrap items-center justify-center gap-3"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleOpenFileDialog}
            className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs tracking-wider uppercase font-mono flex items-center space-x-2 transition-all shadow-lg shadow-lime-400/20"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Browse & Select Multiple Files</span>
          </button>

          <button
            type="button"
            onClick={handleBatchDemoUpload}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center space-x-1.5 border border-white/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-lime-400" />
            <span>Add Demo Batch (3 Files)</span>
          </button>

          <button
            type="button"
            onClick={onRefreshProgress}
            className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-mono text-xs flex items-center space-x-1 border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono mt-3">
          Supported: .pdf, .docx, .xlsx, .png, .jpg (Up to 50MB per batch)
        </span>
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
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Pages</span>
            <span className="text-lg font-bold text-white block font-mono">{totalPages}</span>
          </div>
          <FileText className="w-5 h-5 text-cyan-400" />
        </div>
        <div className="p-3.5 rounded-xl glass-panel border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Fully Processed</span>
            <span className="text-lg font-bold text-emerald-400 block font-mono">{processedDocs.length}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="p-3.5 rounded-xl glass-panel border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">In Ingestion Pipeline</span>
            <span className="text-lg font-bold text-lime-400 block font-mono">{processingDocs.length}</span>
          </div>
          <Clock className="w-5 h-5 text-lime-400" />
        </div>
      </div>

      {/* Filter and Document List */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-lime-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Ingested Verification Dossier ({documents.length} Files)
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 text-xs font-mono overflow-x-auto">
            {['ALL', 'FINANCIAL', 'GRANT', 'TAX', 'IDENTITY', 'LEGAL'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  filterCategory === cat
                    ? 'bg-lime-400/20 text-lime-400 border border-lime-400/40'
                    : 'text-slate-400 hover:text-white bg-slate-900/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] font-mono uppercase text-slate-400 border-b border-white/5">
              <tr>
                <th className="py-2.5 px-3">Document Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Size & Pages</th>
                <th className="py-2.5 px-3">Uploaded</th>
                <th className="py-2.5 px-3">Pipeline Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      {getFileIcon(doc.fileType)}
                      <div>
                        <span className="font-semibold text-slate-200 block truncate max-w-[280px]" title={doc.name}>
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {doc.id}</span>
                      </div>
                    </div>
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
                    {onDeleteDocument && (
                      <button
                        type="button"
                        onClick={() => onDeleteDocument(doc.id)}
                        title="Remove Document from Dossier"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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
    </div>
  );
};
