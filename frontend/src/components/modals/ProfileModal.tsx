import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Award,
  Clock,
  Download,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck,
  AlertTriangle
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportAudit?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onExportAudit
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
      if (onExportAudit) onExportAudit();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel-nexus rounded-3xl border border-[#C9FF3D]/30 p-6 sm:p-7 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#292D2B]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C9FF3D]/10 border border-[#C9FF3D]/30 flex items-center justify-center text-[#C9FF3D]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F7F5] font-mono">
                Underwriter Profile & Credentials
              </h3>
              <p className="text-xs text-[#8F9691] font-sans">
                Active commercial audit session credentials
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8F9691] hover:text-[#F5F7F5] hover:bg-[#1D211F] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Summary */}
        <div className="p-4 rounded-2xl bg-[#171A18] border border-[#292D2B] flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#111312] to-[#1D211F] border-2 border-[#C9FF3D] flex items-center justify-center text-[#C9FF3D] shadow-[0_0_15px_rgba(201,255,61,0.25)] flex-shrink-0">
            <span className="text-lg font-bold font-mono">CT</span>
          </div>

          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-[#F5F7F5] font-mono truncate">
                Officer Arjun Mehta
              </h4>
              <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-[#79DF9B]/15 text-[#79DF9B] border border-[#79DF9B]/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#8F9691] font-sans">
              Commercial Credit Underwriting Lead
            </p>
            <div className="flex items-center space-x-2 text-[10px] font-mono text-[#C9FF3D]">
              <span>ID: CT-8842-BLR</span>
              <span>•</span>
              <span>Branch: Bengaluru Commercial</span>
            </div>
          </div>
        </div>

        {/* Security & Access Badges */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#111312] border border-[#292D2B] space-y-1">
            <div className="flex items-center space-x-1.5 text-[#8F9691]">
              <Lock className="w-3.5 h-3.5 text-[#C9FF3D]" />
              <span className="text-[10px] uppercase">Clearance Level</span>
            </div>
            <span className="text-[#F5F7F5] font-bold block">Level 3 Dual-Signoff</span>
            <span className="text-[9px] text-[#8F9691] block">Commercial Loans &lt; ₹5.0 Cr</span>
          </div>

          <div className="p-3 rounded-xl bg-[#111312] border border-[#292D2B] space-y-1">
            <div className="flex items-center space-x-1.5 text-[#8F9691]">
              <Clock className="w-3.5 h-3.5 text-[#C9FF3D]" />
              <span className="text-[10px] uppercase">Session Sync</span>
            </div>
            <span className="text-[#F5F7F5] font-bold block">09:24 AM IST</span>
            <span className="text-[9px] text-[#79DF9B] block">Deterministic Pipeline Live</span>
          </div>
        </div>

        {/* Audit Session Metrics */}
        <div className="p-3.5 rounded-xl bg-[#111312] border border-[#292D2B] space-y-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#8F9691] block">
            Current Investigation Dossier
          </span>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 rounded-lg bg-[#171A18] border border-[#292D2B]">
              <span className="text-xs font-bold text-[#F5F7F5] block">24</span>
              <span className="text-[9px] text-[#8F9691]">Documents</span>
            </div>
            <div className="p-2 rounded-lg bg-[#171A18] border border-[#292D2B]">
              <span className="text-xs font-bold text-[#FF7777] block">7</span>
              <span className="text-[9px] text-[#8F9691]">Conflicts</span>
            </div>
            <div className="p-2 rounded-lg bg-[#171A18] border border-[#292D2B]">
              <span className="text-xs font-bold text-[#C9FF3D] block">186</span>
              <span className="text-[9px] text-[#8F9691]">Relationships</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 pt-1">
          <button
            onClick={handleExport}
            disabled={downloading}
            className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
              downloadSuccess
                ? 'bg-[#79DF9B] text-[#0D0F0E]'
                : 'bg-[#C9FF3D] hover:bg-[#bbf030] text-[#0D0F0E] shadow-[0_0_15px_rgba(201,255,61,0.25)]'
            }`}
          >
            {downloading ? (
              <span>Compiling Full Audit Dossier...</span>
            ) : downloadSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Audit Dossier Exported Successfully!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Audit Dossier (PDF & JSON)</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-[#171A18] hover:bg-[#1D211F] text-[#8F9691] hover:text-[#F5F7F5] border border-[#292D2B] font-mono text-xs transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
