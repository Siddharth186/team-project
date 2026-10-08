import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { DocumentItem } from '../types/nexus';

interface DocumentsViewProps {
  documents: DocumentItem[];
  onUpload: (files: string[]) => void;
  onRefreshProgress: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onUpload,
  onRefreshProgress
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const processingDocs = documents.filter(d => d.status === 'PROCESSING');
  const processedDocs = documents.filter(d => d.status === 'PROCESSED');
  const failedDocs = documents.filter(d => d.status === 'FAILED');
  const pendingDocs = documents.filter(d => d.status === 'PENDING');

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const names = Array.from(e.dataTransfer.files).map(f => f.name);
      onUpload(names);
    }
  };

  const handleSimulateAdd = () => {
    const demoFiles = [
      'Board_Resolution_Authorizing_Borrowing.pdf',
      'Electricity_Bill_KYC_Verification.pdf'
    ];
    onUpload(demoFiles);
  };

  const filteredDocs = filterCategory === 'ALL'
    ? documents
    : documents.filter(d => d.documentCategory === filterCategory);

  return (
    <div className="space-y-6">
      {/* Processing Status Banner if active */}
      {processingDocs.length > 0 && (
        <div className="p-5 rounded-2xl glass-panel-glow border border-lime-400/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-lime-400/20 text-lime-400 flex items-center justify-center animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  MEMBER 1 PARSING & OCR PIPELINE ACTIVE
                </h3>
                <p className="text-xs text-slate-300">
                  Extracting tabular schemas, normalizing key-value pairs, and computing embeddings
                </p>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-sm font-bold text-lime-400">{processingDocs.length} document(s) in queue</span>
              <p className="text-xs text-slate-400">Est. 18s remaining • {avgProgress}%</p>
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

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-8 rounded-2xl border-2 border-dashed transition-all duration-200 text-center flex flex-col items-center justify-center ${
          dragActive
            ? 'border-lime-400 bg-lime-400/10'
            : 'border-white/10 hover:border-lime-400/40 glass-panel'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/30 flex items-center justify-center mb-3">
          <UploadCloud className="w-6 h-6 text-lime-400" />
        </div>
        <h3 className="text-base font-bold text-white font-mono">
          Upload Multi-Format Documents to Ingestion Pipeline
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Drag and drop PDF reports, scanned loan forms, bank statements, or tax filings. Member 1 extracts tables, text, and bounding coordinates.
        </p>

        <div className="mt-4 flex items-center space-x-3">
          <button
            onClick={handleSimulateAdd}
            className="px-4 py-2 rounded-lg bg-lime-400 hover:bg-lime-300 text-black font-semibold text-xs tracking-wider uppercase font-mono flex items-center space-x-1.5 transition-all shadow-md shadow-lime-400/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Verification Document</span>
          </button>
          <button
            onClick={onRefreshProgress}
            className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center space-x-1 border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Progress</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl glass-panel border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Files</span>
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
            <span className="text-[10px] font-mono text-slate-400 uppercase">Processed</span>
            <span className="text-lg font-bold text-emerald-400 block font-mono">{processedDocs.length}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="p-3.5 rounded-xl glass-panel border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase">In Pipeline</span>
            <span className="text-lg font-bold text-lime-400 block font-mono">{processingDocs.length + pendingDocs.length}</span>
          </div>
          <Clock className="w-5 h-5 text-lime-400" />
        </div>
      </div>

      {/* Filter and Document List */}
      <div className="p-5 rounded-2xl glass-panel space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-lime-400" />
            <span>Ingested Verification Dossier</span>
          </h3>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 text-xs font-mono overflow-x-auto">
            {['ALL', 'FINANCIAL', 'GRANT', 'TAX'].map((cat) => (
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
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center space-x-2.5">
                      <FileText className="w-4 h-4 text-lime-400 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-200 block">{doc.name}</span>
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
                    ) : doc.status === 'FAILED' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-mono inline-flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>FAILED</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
                        PENDING
                      </span>
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
