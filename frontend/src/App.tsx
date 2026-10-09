import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { ChatBoxTerminal } from './components/chat/ChatBoxTerminal';
import { DocumentProcessingPanel } from './components/dashboard/DocumentProcessingPanel';
import { RecentIntelligence } from './components/dashboard/RecentIntelligence';
import { DocumentSummary } from './components/dashboard/DocumentSummary';
import { DocumentsView } from './components/DocumentsView';
import { BlackHoleCursor, CursorMode } from './components/cursor/BlackHoleCursor';
import { AntigravityScene } from './components/background/AntigravityScene';
import { EvidenceDrawer } from './components/modals/EvidenceDrawer';
import { UploadModal } from './components/modals/UploadModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { KnowledgeGraphModal } from './components/modals/KnowledgeGraphModal';
import { TimelineModal } from './components/modals/TimelineModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { ReportModal } from './components/modals/ReportModal';
import { nexusData } from './data/demoData';
import { nexusApi } from './services/api';
import { DocumentItem } from './types/nexus';
import { Sparkles, Calendar, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDark, setIsDark] = useState(true);
  const [cursorMode, setCursorMode] = useState<CursorMode>('NORMAL');
  const [liveNow, setLiveNow] = useState<Date>(new Date());

  // Real-time ticking clock for live synchronization
  useEffect(() => {
    const timer = setInterval(() => setLiveNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modals & Drawers state
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [evidenceInitialFilter, setEvidenceInitialFilter] = useState<'ALL' | 'CONFLICTS' | 'MISSING_DATA' | 'INTELLIGENCE' | 'EVIDENCE'>('ALL');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [graphModalOpen, setGraphModalOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTargetType, setReportTargetType] = useState<'ALL' | 'DOCUMENT' | 'BATCH'>('ALL');
  const [reportTargetId, setReportTargetId] = useState<string>('all');
  const [reportTargetName, setReportTargetName] = useState<string>('Full Dossier');

  // Dynamic document records & counts
  const [documentsList, setDocumentsList] = useState<DocumentItem[]>([]);
  const [findingsList, setFindingsList] = useState<any[]>([]);
  const [docCount, setDocCount] = useState(nexusData.kpis.documents.value);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const refreshData = async () => {
    try {
      const [docs, findings] = await Promise.all([
        nexusApi.getDocuments(),
        nexusApi.getFindings().catch(() => [])
      ]);
      if (docs) {
        setDocumentsList(docs);
        setDocCount(docs.length);
      }
      if (findings) {
        setFindingsList(findings);
      }
    } catch {
      // Ignore network glitch
    }
  };

  // Keyboard shortcut listener for Command Palette (⌘ K / Ctrl K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize light / dark theme class with root document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.remove('light-theme');
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.classList.add('light-theme');
    }
  }, [isDark]);

  // Load live verification dossier and findings on mount
  useEffect(() => {
    refreshData();
  }, []);

  const handleUploadSuccess = (files: Array<{ name: string; size: number; type: string }>) => {
    setDocCount(prev => prev + files.length);
    setCursorMode('SUCCESS');

    // Refresh live documents and findings from backend
    refreshData();

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: isDark ? ['#C9FF3D', '#79DF9B', '#FFFFFF'] : ['#0F5132', '#166534', '#FFFFFF']
      });
    } catch {
      // Fallback
    }

    setToastMessage(`Successfully ingested ${files.length} document(s) into pipeline!`);
    setTimeout(() => {
      setToastMessage(null);
      setCursorMode('NORMAL');
    }, 4500);
  };

  const handleOpenEvidence = (item?: any) => {
    setSelectedEvidence(item || null);
    setEvidenceInitialFilter('ALL');
    setCursorMode('CONFLICT');
    setEvidenceOpen(true);
  };

  const handleOpenReport = (type: 'ALL' | 'DOCUMENT' | 'BATCH' = 'ALL', id: string = 'all', name: string = 'Full Ingested Dossier') => {
    setReportTargetType(type);
    setReportTargetId(id);
    setReportTargetName(name);
    setReportModalOpen(true);
  };

  const handleActionSelect = (type: string, payload?: any) => {
    if (type === 'evidence') {
      handleOpenEvidence(payload);
    } else if (type === 'graph') {
      setGraphModalOpen(true);
    } else if (type === 'timeline') {
      setTimelineOpen(true);
    } else if (type === 'doc') {
      setUploadOpen(true);
    } else if (type === 'qa') {
      const el = document.getElementById('chat-terminal-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (type === 'report') {
      handleOpenReport('ALL', 'all', 'Full Ingested Dossier');
    }
  };

  const handleNavTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      setActiveTab('overview');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'documents') {
      setActiveTab('documents');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'intelligence') {
      setActiveTab('overview');
      setTimeout(() => {
        const el = document.getElementById('recent-intelligence-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-[#C9FF3D]', 'shadow-[0_0_25px_rgba(201,255,61,0.25)]', 'transition-all');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-[#C9FF3D]', 'shadow-[0_0_25px_rgba(201,255,61,0.25)]');
          }, 2000);
        }
      }, 50);
      setToastMessage('Navigated to Recent Intelligence findings');
      setTimeout(() => setToastMessage(null), 2500);
    } else if (tab === 'conflicts') {
      setEvidenceInitialFilter('CONFLICTS');
      setCursorMode('CONFLICT');
      setEvidenceOpen(true);
    } else if (tab === 'missing-data') {
      setEvidenceInitialFilter('MISSING_DATA');
      setCursorMode('CONFLICT');
      setEvidenceOpen(true);
    } else if (tab === 'evidence') {
      setEvidenceInitialFilter('EVIDENCE');
      setEvidenceOpen(true);
    } else if (tab === 'knowledge-graph') {
      setGraphModalOpen(true);
    } else if (tab === 'timeline') {
      setTimelineOpen(true);
    } else if (tab === 'report') {
      handleOpenReport('ALL', 'all', 'Full Ingested Dossier');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans relative transition-colors duration-300 ${
        isDark
          ? 'bg-[#0D0F0E] text-[#F5F7F5] selection:bg-[#C9FF3D] selection:text-[#0D0F0E]'
          : 'bg-[#F8FAF8] text-[#0D2E1C] light-theme selection:bg-[#0F5132] selection:text-white'
      }`}
    >
      {/* 1. Miniature Gravitational Black Hole Cursor */}
      <BlackHoleCursor mode={cursorMode} />

      {/* 2. Three.js 3D Antigravity Information Field Background */}
      <AntigravityScene isProcessing={cursorMode === 'PROCESSING'} />

      {/* 3. Top Header / Navbar (as sketched: [Icon] NEXUS AI | Home Documents Intelligence Conflicts Missing data... | (dark/light) | 👤 | 🔍 ˅) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavTab}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        onOpenUpload={() => setUploadOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        counts={{
          documents: documentsList.length || docCount,
          intelligence: findingsList.length || 3,
          conflicts: findingsList.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH' || f.type === 'CONTRADICTION').length || 7,
          missingData: findingsList.filter(f => f.type === 'MISSING_DATA' || (f.title && f.title.toLowerCase().includes('missing'))).length || 4
        }}
      />

      {/* 4. Confirmation Toast Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-2xl bg-[#171A18]/95 border border-[#C9FF3D]/40 text-[#F5F7F5] flex items-center space-x-3 text-xs font-mono shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="w-6 h-6 rounded-lg bg-[#C9FF3D]/20 text-[#C9FF3D] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 5. Main Content Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-4 space-y-6 z-10">
        {/* Sub-header / Paragraph Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F5F7F5] font-sans">
              {liveNow.getHours() < 12 ? 'Good morning' : liveNow.getHours() < 18 ? 'Good afternoon' : 'Good evening'}, <span className="text-[#C9FF3D] font-mono drop-shadow-[0_0_15px_rgba(201,255,61,0.35)]">Team</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8F9691] mt-1 font-sans max-w-3xl leading-relaxed">
              Here's what <span className="text-[#F5F7F5] font-semibold">NEXUS</span> discovered from your documents. {documentsList.length || 6} multi-format files analyzed with {findingsList.length || 7} detected findings, and real-time knowledge graph projections across primary sources.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#171A18]/90 border border-[#292D2B] shadow-sm text-xs font-mono text-[#8F9691] self-start sm:self-auto flex-shrink-0 select-none">
            <Calendar className="w-3.5 h-3.5 text-[#C9FF3D]" />
            <span className="text-slate-200 font-medium">
              {liveNow.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-[#292D2B]">|</span>
            <div className="flex items-center space-x-1.5 text-[#F5F7F5] font-semibold">
              <Clock className="w-3 h-3 text-[#79DF9B] animate-pulse" />
              <span className="tabular-nums">
                {liveNow.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
              </span>
            </div>
          </div>
        </div>

        {/* Active Tab View */}
        {activeTab === 'documents' ? (
          <DocumentsView
            documents={documentsList}
            onUpload={async (files) => {
              await nexusApi.uploadDocuments(files as any);
              await refreshData();
            }}
            onRefreshProgress={refreshData}
            onDeleteDocument={async (id) => {
              await nexusApi.deleteDocument(id);
              await refreshData();
            }}
            onDeleteBatch={async (batchId) => {
              await nexusApi.deleteBatch(batchId);
              await refreshData();
              setToastMessage('Upload batch removed from dossier');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            onDeleteMultiple={async (ids) => {
              await nexusApi.deleteMultipleDocuments(ids);
              await refreshData();
              setToastMessage(`Removed ${ids.length} selected document(s)`);
              setTimeout(() => setToastMessage(null), 3000);
            }}
            onDeleteAll={async () => {
              await nexusApi.deleteAllDocuments();
              await refreshData();
              setToastMessage('All dossier files and intelligence records purged');
              setTimeout(() => setToastMessage(null), 3000);
            }}
            onSelectDocument={(doc) => {
              handleOpenReport('DOCUMENT', doc.id, doc.name);
            }}
            onOpenReport={handleOpenReport}
          />
        ) : (
          <>
            {/* 6. Top Core Focal Row: Chat Terminal (left) + Document Processing (right) with Equal 50/50 Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Block A: Chat Terminal with embedded "+ upload Document" button (50% width) */}
              <div id="chat-terminal-section" className="flex flex-col">
                <ChatBoxTerminal
                  onOpenUpload={() => setUploadOpen(true)}
                  onOpenEvidence={handleOpenEvidence}
                />
              </div>

              {/* Block B: Document Processing Ingestion Engine (50% width) */}
              <div className="flex flex-col">
                <DocumentProcessingPanel
                  documents={documentsList}
                  findings={findingsList}
                  onExplorePipeline={() => setUploadOpen(true)}
                  onOpenReport={handleOpenReport}
                  onSelectDocument={(doc) => {
                    handleOpenReport('DOCUMENT', doc.id, doc.name);
                  }}
                />
              </div>
            </div>

            {/* 7. Bottom Section: Recent Intelligence & Document Summary (Expanded in Breadth as Wide Rectangles) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8 items-stretch">
              <div id="recent-intelligence-section">
                <RecentIntelligence
                  findings={findingsList}
                  onSelectItem={(item) => handleOpenEvidence(item)}
                  onViewAll={() => handleOpenEvidence()}
                />
              </div>

              <DocumentSummary
                documents={documentsList}
                onViewAll={() => setUploadOpen(true)}
                onSelectDocument={(doc) => {
                  handleOpenReport('DOCUMENT', doc.id, doc.name);
                }}
              />
            </div>
          </>
        )}
      </main>

      {/* 8. Modals & Drawers */}
      <EvidenceDrawer
        isOpen={evidenceOpen}
        onClose={() => {
          setEvidenceOpen(false);
          setCursorMode('NORMAL');
          setActiveTab('overview');
        }}
        evidenceData={selectedEvidence}
        initialFilter={evidenceInitialFilter}
        documents={documentsList}
        findings={findingsList}
        onOpenReport={handleOpenReport}
      />

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setActiveTab('overview');
        }}
        onUploadSuccess={handleUploadSuccess}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => {
          setCommandPaletteOpen(false);
          setActiveTab('overview');
        }}
        onSelectAction={handleActionSelect}
      />

      <KnowledgeGraphModal
        isOpen={graphModalOpen}
        onClose={() => {
          setGraphModalOpen(false);
          setActiveTab('overview');
        }}
        onInspectEvidence={() => {
          setGraphModalOpen(false);
          handleOpenEvidence();
        }}
        documents={documentsList}
        onOpenReport={handleOpenReport}
      />

      <TimelineModal
        isOpen={timelineOpen}
        onClose={() => {
          setTimelineOpen(false);
          setActiveTab('overview');
        }}
        onInspectEvidence={(item) => {
          setTimelineOpen(false);
          handleOpenEvidence(item);
        }}
        documents={documentsList}
        onOpenReport={handleOpenReport}
      />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => {
          setProfileOpen(false);
          setActiveTab('overview');
        }}
        onExportAudit={() => {
          setToastMessage('Exporting complete underwriter audit dossier (PDF + JSON)...');
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setActiveTab('overview');
        }}
        targetType={reportTargetType}
        targetId={reportTargetId}
        targetName={reportTargetName}
        documents={documentsList}
      />
    </div>
  );
}

export default App;
