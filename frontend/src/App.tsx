import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { ChatBoxTerminal } from './components/chat/ChatBoxTerminal';
import { DocumentProcessingPanel } from './components/dashboard/DocumentProcessingPanel';
import { RecentIntelligence } from './components/dashboard/RecentIntelligence';
import { DocumentSummary } from './components/dashboard/DocumentSummary';
import { BlackHoleCursor, CursorMode } from './components/cursor/BlackHoleCursor';
import { AntigravityScene } from './components/background/AntigravityScene';
import { EvidenceDrawer } from './components/modals/EvidenceDrawer';
import { UploadModal } from './components/modals/UploadModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { KnowledgeGraphModal } from './components/modals/KnowledgeGraphModal';
import { nexusData } from './data/demoData';
import { Sparkles, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDark, setIsDark] = useState(true);
  const [cursorMode, setCursorMode] = useState<CursorMode>('NORMAL');

  // Modals & Drawers state
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [graphModalOpen, setGraphModalOpen] = useState(false);

  // Dynamic document counts
  const [docCount, setDocCount] = useState(nexusData.kpis.documents.value);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const handleUploadSuccess = (files: Array<{ name: string; size: number; type: string }>) => {
    setDocCount(prev => prev + files.length);
    setCursorMode('SUCCESS');

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
    setSelectedEvidence(item || nexusData.recentIntelligence[0]);
    setCursorMode('CONFLICT');
    setEvidenceOpen(true);
  };

  const handleActionSelect = (type: string) => {
    if (type === 'evidence') {
      handleOpenEvidence();
    } else if (type === 'graph') {
      setGraphModalOpen(true);
    } else if (type === 'timeline') {
      handleOpenEvidence();
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
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'evidence') handleOpenEvidence();
          if (tab === 'knowledge-graph') setGraphModalOpen(true);
          if (tab === 'documents') setUploadOpen(true);
        }}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenSearch={() => setCommandPaletteOpen(true)}
        onOpenUpload={() => setUploadOpen(true)}
        counts={{
          documents: docCount,
          intelligence: 3,
          conflicts: 7,
          missingData: 4
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
              Good morning, <span className="text-[#C9FF3D] font-mono drop-shadow-[0_0_15px_rgba(201,255,61,0.35)]">Team</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#8F9691] mt-1 font-sans max-w-3xl leading-relaxed">
              Here's what <span className="text-[#F5F7F5] font-semibold">NEXUS</span> discovered from your documents. 6 multi-format files analyzed with 7 detected conflicts, 4 missing requirements, and 186 relationships mapped across primary sources.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#171A18]/80 border border-[#292D2B] text-xs font-mono text-[#8F9691] self-start sm:self-auto flex-shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#C9FF3D]" />
            <span>Oct 8, 2026</span>
            <span className="text-[#292D2B]">|</span>
            <span className="text-[#F5F7F5]">09:24 AM</span>
          </div>
        </div>

        {/* 6. Top Core Focal Row: Chat Terminal (left) + Document Processing (right in Jarvis place) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Block A: Chat Terminal with embedded "+ upload Document" button (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <ChatBoxTerminal
              onOpenUpload={() => setUploadOpen(true)}
              onOpenEvidence={handleOpenEvidence}
            />
          </div>

          {/* Block B: Document Processing Ingestion Engine in Jarvis's place (7 cols) */}
          <div className="lg:col-span-7 flex flex-col">
            <DocumentProcessingPanel
              onExplorePipeline={() => setUploadOpen(true)}
            />
          </div>
        </div>

        {/* 7. Bottom Section: Recent Intelligence & Document Summary (Expanded in Breadth as Wide Rectangles) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8 items-stretch">
          <RecentIntelligence
            onSelectItem={(item) => handleOpenEvidence(item)}
            onViewAll={() => handleOpenEvidence()}
          />

          <DocumentSummary
            onViewAll={() => setUploadOpen(true)}
            onSelectDocument={() => setUploadOpen(true)}
          />
        </div>
      </main>

      {/* 8. Modals & Drawers */}
      <EvidenceDrawer
        isOpen={evidenceOpen}
        onClose={() => {
          setEvidenceOpen(false);
          setCursorMode('NORMAL');
        }}
        evidenceData={selectedEvidence}
      />

      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectAction={handleActionSelect}
      />

      <KnowledgeGraphModal
        isOpen={graphModalOpen}
        onClose={() => setGraphModalOpen(false)}
        onInspectEvidence={() => {
          setGraphModalOpen(false);
          handleOpenEvidence();
        }}
      />
    </div>
  );
}

export default App;
