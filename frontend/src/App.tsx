import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { KpiCard } from './components/dashboard/KpiCard';
import { DocumentProcessingPanel } from './components/dashboard/DocumentProcessingPanel';
import { RecentIntelligence } from './components/dashboard/RecentIntelligence';
import { DocumentSummary } from './components/dashboard/DocumentSummary';
import { KnowledgeGraphMini } from './components/dashboard/KnowledgeGraphMini';
import { TimelineMini } from './components/dashboard/TimelineMini';
import { NexusHudPanel } from './components/hud/NexusHudPanel';
import { BlackHoleCursor, CursorMode } from './components/cursor/BlackHoleCursor';
import { AntigravityScene } from './components/background/AntigravityScene';
import { EvidenceDrawer } from './components/modals/EvidenceDrawer';
import { UploadModal } from './components/modals/UploadModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { KnowledgeGraphModal } from './components/modals/KnowledgeGraphModal';
import { nexusData } from './data/demoData';
import {
  FileText,
  Share2,
  AlertTriangle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function App() {
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const handleUploadSuccess = (files: Array<{ name: string; size: number; type: string }>) => {
    setDocCount(prev => prev + files.length);
    setCursorMode('SUCCESS');

    // Trigger subtle celebratory particle burst
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#C9FF3D', '#79DF9B', '#FFFFFF']
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

  const handleAskQuestion = (query: string) => {
    setCursorMode('SEARCH');
    setTimeout(() => {
      handleOpenEvidence(nexusData.recentIntelligence[0]);
    }, 1200);
  };

  const handleActionSelect = (type: string, payload?: any) => {
    if (type === 'evidence') {
      handleOpenEvidence();
    } else if (type === 'graph') {
      setGraphModalOpen(true);
    } else if (type === 'qa') {
      handleAskQuestion(payload?.query || '');
    } else if (type === 'timeline') {
      setToastMessage('Navigated to Chronological Audit Timeline.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0F0E] text-[#F5F7F5] flex overflow-x-hidden font-sans relative selection:bg-[#C9FF3D] selection:text-[#0D0F0E]">
      {/* 1. Miniature Gravitational Black Hole Cursor */}
      <BlackHoleCursor mode={cursorMode} />

      {/* 2. Three.js 3D Antigravity Information Field Background */}
      <AntigravityScene isProcessing={cursorMode === 'PROCESSING'} />

      {/* 3. Confirmation Toast Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-[#171A18]/95 border border-[#C9FF3D]/40 text-[#F5F7F5] flex items-center space-x-3 text-xs font-mono shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4">
          <div className="w-6 h-6 rounded-lg bg-[#C9FF3D]/20 text-[#C9FF3D] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 4. Left Sidebar */}
      <Sidebar
        activeTab={activeNav}
        setActiveTab={(tab) => {
          setActiveNav(tab);
          if (tab === 'evidence') handleOpenEvidence();
          if (tab === 'knowledge-graph') setGraphModalOpen(true);
          if (tab === 'documents') setUploadOpen(true);
        }}
        onOpenUpload={() => setUploadOpen(true)}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        counts={{
          documents: docCount,
          intelligence: 3,
          conflicts: 7,
          missingData: 4
        }}
      />

      {/* 5. Main Center Dashboard & Right AI HUD */}
      <div className="flex-1 min-w-0 flex flex-col lg:flex-row h-screen overflow-y-auto z-10">
        {/* Center Main Intelligence Column */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-7 space-y-6 max-w-7xl">
          {/* Top Search Bar & Hero Header */}
          <TopBar
            onSearchOpen={() => setCommandPaletteOpen(true)}
            onNotificationsOpen={() => handleOpenEvidence()}
          />

          {/* 4 KPI Animated Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Documents"
              value={docCount}
              change="+6 today"
              icon={<FileText className="w-4 h-4 text-[#C9FF3D]" />}
              iconBg="rgba(201, 255, 61, 0.12)"
              iconColor="#C9FF3D"
              onClick={() => setUploadOpen(true)}
            />

            <KpiCard
              label="Relationships"
              value={186}
              change="+32 today"
              icon={<Share2 className="w-4 h-4 text-[#79DF9B]" />}
              iconBg="rgba(121, 223, 155, 0.12)"
              iconColor="#79DF9B"
              onClick={() => setGraphModalOpen(true)}
            />

            <KpiCard
              label="Conflicts"
              value={7}
              criticalText="2 critical"
              icon={<AlertTriangle className="w-4 h-4 text-[#FF7777]" />}
              iconBg="rgba(255, 119, 119, 0.12)"
              iconColor="#FF7777"
              onClick={() => handleOpenEvidence()}
            />

            <KpiCard
              label="Missing Data"
              value={4}
              criticalText="1 critical"
              icon={<HelpCircle className="w-4 h-4 text-[#FFBD59]" />}
              iconBg="rgba(255, 189, 89, 0.12)"
              iconColor="#FFBD59"
              onClick={() => handleOpenEvidence()}
            />
          </div>

          {/* Document Processing Hero Panel with Holographic Core */}
          <DocumentProcessingPanel
            onExplorePipeline={() => setUploadOpen(true)}
          />

          {/* Middle Row: Recent Intelligence & Document Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <RecentIntelligence
              onSelectItem={(item) => handleOpenEvidence(item)}
              onViewAll={() => handleOpenEvidence()}
            />

            <DocumentSummary
              onViewAll={() => setUploadOpen(true)}
              onSelectDocument={() => setUploadOpen(true)}
            />
          </div>

          {/* Bottom Row: Knowledge Graph & Timeline Mini Previews */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-6">
            <KnowledgeGraphMini
              onOpenFullGraph={() => setGraphModalOpen(true)}
            />

            <TimelineMini
              onOpenFullTimeline={() => handleOpenEvidence()}
            />
          </div>
        </main>

        {/* Right Column: Holographic NEXUS AI HUD Panel */}
        <aside className="p-4 sm:p-6 lg:p-7 lg:pl-0 border-t lg:border-t-0 lg:border-l border-[#292D2B] bg-[#0D0F0E]/70 flex-shrink-0">
          <NexusHudPanel
            onAskQuestion={handleAskQuestion}
            onOpenEvidence={() => handleOpenEvidence()}
            onOpenInsight={(insight) => handleOpenEvidence()}
          />
        </aside>
      </div>

      {/* 6. Modals & Drawers */}
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
