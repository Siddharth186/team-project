import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { DocumentsView } from './components/DocumentsView';
import { FindingsView } from './components/FindingsView';
import { TimelineView } from './components/TimelineView';
import { KnowledgeGraphView } from './components/KnowledgeGraphView';
import { QAView } from './components/QAView';
import { ReportView } from './components/ReportView';
import { EvidenceModal } from './components/EvidenceModal';
import { nexusApi } from './services/api';
import {
  SystemMetrics,
  DocumentItem,
  Finding,
  MissingInformation,
  TemporalNode,
  KnowledgeGraphData,
  CaseDecisionReport,
  QAResponse
} from './types/nexus';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [missingInfo, setMissingInfo] = useState<MissingInformation[]>([]);
  const [timeline, setTimeline] = useState<TemporalNode[]>([]);
  const [graphData, setGraphData] = useState<KnowledgeGraphData>({ nodes: [], edges: [] });
  const [report, setReport] = useState<CaseDecisionReport | null>(null);

  const [inspectingFinding, setInspectingFinding] = useState<Finding | null>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        metricsRes,
        docsRes,
        findingsRes,
        missingRes,
        timelineRes,
        graphRes,
        reportRes
      ] = await Promise.all([
        nexusApi.getMetrics(),
        nexusApi.getDocuments(),
        nexusApi.getFindings(),
        nexusApi.getMissingInfo(),
        nexusApi.getTimeline(),
        nexusApi.getGraph(),
        nexusApi.getReport()
      ]);

      setMetrics(metricsRes);
      setDocuments(docsRes);
      setFindings(findingsRes);
      setMissingInfo(missingRes);
      setTimeline(timelineRes);
      setGraphData(graphRes);
      setReport(reportRes);
    } catch (err: any) {
      console.error('Failed to load NEXUS data:', err);
      setError('Unable to connect to NEXUS Orchestration Server on port 5001. Please verify server status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Poll for document progress if any document is processing
  useEffect(() => {
    const hasProcessing = documents.some(d => d.status === 'PROCESSING');
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const res = await nexusApi.pollProgress();
        setDocuments(res.documents);
        if (res.processingRemaining === 0) {
          // Re-fetch metrics and report once finished
          const m = await nexusApi.getMetrics();
          setMetrics(m);
        }
      } catch (e) {
        console.error('Progress poll failed:', e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [documents]);

  const handleUpload = async (files: Array<{ name: string; size: number; type: string } | string>) => {
    try {
      await nexusApi.uploadDocuments(files);
      const updatedDocs = await nexusApi.getDocuments();
      setDocuments(updatedDocs);
      const updatedMetrics = await nexusApi.getMetrics();
      setMetrics(updatedMetrics);
    } catch (e) {
      console.error('Upload failed:', e);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await nexusApi.deleteDocument(id);
      const updatedDocs = await nexusApi.getDocuments();
      setDocuments(updatedDocs);
      const updatedMetrics = await nexusApi.getMetrics();
      setMetrics(updatedMetrics);
    } catch (e) {
      console.error('Delete failed:', e);
    }
  };

  const handleReset = async () => {
    try {
      await nexusApi.resetData();
      await loadAllData();
    } catch (e) {
      console.error('Reset failed:', e);
    }
  };

  const handleAskQuestion = async (query: string): Promise<QAResponse> => {
    return await nexusApi.askQuestion(query);
  };

  return (
    <div className="min-h-screen bg-[#080a0f] text-slate-100 flex flex-col font-sans selection:bg-lime-400 selection:text-black">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        metrics={metrics}
        onReset={handleReset}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadAllData}
              className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && !metrics ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="w-10 h-10 rounded-full border-2 border-lime-400 border-t-transparent animate-spin"></div>
            <p className="text-xs font-mono text-slate-400">
              Synchronizing with NEXUS Intelligence Pipeline...
            </p>
          </div>
        ) : (
          <div>
            {activeTab === 'dashboard' && (
              <DashboardView
                metrics={metrics}
                findings={findings}
                documents={documents}
                timeline={timeline}
                onOpenFinding={(f) => setInspectingFinding(f)}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'documents' && (
              <DocumentsView
                documents={documents}
                onUpload={handleUpload}
                onRefreshProgress={async () => {
                  const res = await nexusApi.pollProgress();
                  setDocuments(res.documents);
                }}
                onDeleteDocument={handleDeleteDocument}
              />
            )}

            {activeTab === 'findings' && (
              <FindingsView
                findings={findings}
                missingInfo={missingInfo}
                onOpenFinding={(f) => setInspectingFinding(f)}
              />
            )}

            {activeTab === 'timeline' && (
              <TimelineView timeline={timeline} />
            )}

            {activeTab === 'graph' && (
              <KnowledgeGraphView graphData={graphData} />
            )}

            {activeTab === 'qa' && (
              <QAView
                onAsk={handleAskQuestion}
                onInspectEvidence={(f) => setInspectingFinding(f)}
                findings={findings}
              />
            )}

            {activeTab === 'report' && (
              <ReportView
                report={report}
                onOpenFinding={(f) => setInspectingFinding(f)}
              />
            )}
          </div>
        )}
      </main>

      {/* Traceable Evidence Modal */}
      <EvidenceModal
        finding={inspectingFinding}
        onClose={() => setInspectingFinding(null)}
      />

      {/* Footer */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-slate-600 text-[11px] font-mono">
        NEXUS AI • Hackathon Team Member 3 (Reasoning + Orchestration + User Experience) • Strictly Evidence Grounded
      </footer>
    </div>
  );
}

export default App;
