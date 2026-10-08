/**
 * NEXUS AI — MEMBER 3 ORCHESTRATION SERVER
 * Handles reasoning, Q&A, dashboard metrics, evidence routing, and decision reporting.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  mockDocuments,
  mockEntities,
  mockFacts,
  mockFindings,
  mockMissingInformation,
  mockTemporalTrajectory,
  mockRelationshipGraph,
  mockSystemMetrics
} from './data/loan-case-data.js';
import { GroundedReasoningEngine } from './services/reasoning-engine.js';
import { CaseReportGenerator } from './services/report-generator.js';
import { Member2Client } from './services/member2-client.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory data store for the active session
let sessionData = {
  documents: [...mockDocuments],
  entities: [...mockEntities],
  facts: [...mockFacts],
  findings: [...mockFindings],
  missingInformation: [...mockMissingInformation],
  temporalTrajectory: [...mockTemporalTrajectory],
  graph: { ...mockRelationshipGraph },
  metrics: { ...mockSystemMetrics }
};

const reasoningEngine = new GroundedReasoningEngine(sessionData);
const reportGenerator = new CaseReportGenerator(sessionData);
const member2Client = new Member2Client();

// Periodic check for Member 2 availability
setInterval(async () => {
  await member2Client.checkHealth();
}, 30000);
member2Client.checkHealth().catch(() => {});

// ==========================================
// API ROUTES
// ==========================================

// 1. Health & System Status
app.get('/api/status', (req, res) => {
  const m2Status = member2Client.getStatus();
  res.json({
    status: 'ONLINE',
    orchestratorVersion: '1.0.0',
    nexusCorePipeline: [
      { step: 'Documents', status: 'COMPLETE', count: sessionData.documents.length },
      { step: 'Facts', status: 'COMPLETE', count: sessionData.facts.length },
      { step: 'Connections', status: 'COMPLETE', count: sessionData.graph.edges.length },
      { step: 'Validation', status: 'COMPLETE', count: sessionData.findings.length },
      { step: 'Intelligence', status: 'COMPLETE', confidence: sessionData.metrics.averageConfidence },
      { step: 'Decision', status: 'READY', verdict: 'REVIEW_REQUIRED' }
    ],
    member2Integration: m2Status,
    timestamp: new Date().toISOString()
  });
});

// 2. Dashboard Metrics
app.get('/api/metrics', (req, res) => {
  res.json(sessionData.metrics);
});

// 3. Document Management
app.get('/api/documents', (req, res) => {
  res.json(sessionData.documents);
});

function detectCategory(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('tax') || n.includes('itr') || n.includes('form16') || n.includes('gst')) return 'TAX';
  if (n.includes('grant') || n.includes('subsidy') || n.includes('sanction') || n.includes('mnre')) return 'GRANT';
  if (n.includes('kyc') || n.includes('pan') || n.includes('aadhaar') || n.includes('passport') || n.includes('identity')) return 'IDENTITY';
  if (n.includes('legal') || n.includes('board') || n.includes('resolution') || n.includes('agreement') || n.includes('noc')) return 'LEGAL';
  return 'FINANCIAL';
}

// Processing upload simulation
app.post('/api/documents/upload', (req, res) => {
  const incoming = req.body?.files || req.body?.filenames || [];
  const fileItems = Array.isArray(incoming) && incoming.length > 0 ? incoming : ['Financial_Audit_Addendum.pdf'];

  const newDocs = fileItems.map((item, i) => {
    const isObj = typeof item === 'object' && item !== null;
    const name = isObj ? item.name : String(item);
    const size = isObj && item.size ? item.size : Math.floor(1024 * 1024 * (1.5 + Math.random() * 3));
    const ext = name.split('.').pop()?.toLowerCase() || 'pdf';
    const category = isObj && item.category ? item.category : detectCategory(name);
    const pages = isObj && item.totalPages ? item.totalPages : Math.max(1, Math.min(40, Math.round(size / (250 * 1024)) || Math.floor(2 + Math.random() * 6)));

    return {
      id: `doc-${Date.now()}-${i}`,
      name,
      fileType: ext,
      fileSize: size,
      totalPages: pages,
      uploadedAt: new Date().toISOString(),
      status: 'PROCESSING',
      processingProgress: 15,
      documentCategory: category
    };
  });

  sessionData.documents.push(...newDocs);
  sessionData.metrics.totalDocuments = sessionData.documents.length;

  res.status(202).json({
    message: `${newDocs.length} document(s) accepted for pipeline ingestion`,
    documents: newDocs
  });
});

// Delete document endpoint
app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = sessionData.documents.length;
  sessionData.documents = sessionData.documents.filter(d => d.id !== id);
  sessionData.metrics.totalDocuments = sessionData.documents.length;
  sessionData.metrics.processedDocuments = sessionData.documents.filter(d => d.status === 'PROCESSED').length;
  res.json({ success: true, removed: initialLen > sessionData.documents.length });
});

// Real-time processing progress poller
app.get('/api/documents/progress', (req, res) => {
  let updatedAny = false;
  sessionData.documents = sessionData.documents.map(doc => {
    if (doc.status === 'PROCESSING') {
      const nextProgress = Math.min(100, (doc.processingProgress || 15) + 30);
      updatedAny = true;
      if (nextProgress >= 100) {
        return { ...doc, processingProgress: 100, status: 'PROCESSED' };
      }
      return { ...doc, processingProgress: nextProgress };
    }
    return doc;
  });

  const processingCount = sessionData.documents.filter(d => d.status === 'PROCESSING').length;
  sessionData.metrics.processedDocuments = sessionData.documents.filter(d => d.status === 'PROCESSED').length;

  res.json({
    processingRemaining: processingCount,
    documents: sessionData.documents
  });
});

// 4. Facts
app.get('/api/facts', (req, res) => {
  const { entityId, category } = req.query;
  let facts = sessionData.facts;
  if (entityId) {
    facts = facts.filter(f => f.entityId === entityId);
  }
  if (category) {
    facts = facts.filter(f => f.entityType === category);
  }
  res.json(facts);
});

// 5. Findings & Conflicts
app.get('/api/findings', (req, res) => {
  const { severity, category } = req.query;
  let findings = sessionData.findings;
  if (severity) {
    findings = findings.filter(f => f.severity.toLowerCase() === severity.toLowerCase());
  }
  if (category) {
    findings = findings.filter(f => f.category.toLowerCase() === category.toLowerCase());
  }
  res.json(findings);
});

app.get('/api/findings/:id', (req, res) => {
  const finding = sessionData.findings.find(f => f.id === req.params.id);
  if (!finding) {
    return res.status(404).json({ error: 'Finding not found' });
  }
  res.json(finding);
});

// 6. Missing Information
app.get('/api/missing', (req, res) => {
  res.json(sessionData.missingInformation);
});

// 7. Temporal View
app.get('/api/timeline', (req, res) => {
  res.json(sessionData.temporalTrajectory);
});

// 8. Knowledge & Relationship Graph
app.get('/api/graph', (req, res) => {
  res.json(sessionData.graph);
});

// 9. Grounded Natural Language Q&A
app.post('/api/qa', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Valid query parameter is required.' });
    }

    const response = await reasoningEngine.answerQuestion(query);
    res.json(response);
  } catch (err) {
    res.status(500).json({
      error: 'Reasoning engine failed to process question.',
      details: err.message
    });
  }
});

// 10. Decision Case Report
app.get('/api/report', (req, res) => {
  const report = reportGenerator.generateReport();
  res.json(report);
});

app.get('/api/report/markdown', (req, res) => {
  const report = reportGenerator.generateReport();
  const md = reportGenerator.generateMarkdown(report);
  res.type('text/markdown').send(md);
});

// 11. Reset to initial demo case
app.post('/api/reset', (req, res) => {
  sessionData = {
    documents: [...mockDocuments],
    entities: [...mockEntities],
    facts: [...mockFacts],
    findings: [...mockFindings],
    missingInformation: [...mockMissingInformation],
    temporalTrajectory: [...mockTemporalTrajectory],
    graph: { ...mockRelationshipGraph },
    metrics: { ...mockSystemMetrics }
  };
  reasoningEngine.updateState(sessionData);
  res.json({ message: 'Session reset to calibrated demonstration case.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[NEXUS ORCHESTRATOR] Member 3 Service active on port ${PORT}`);
  console.log(`[NEXUS ORCHESTRATOR] Environment: Local Hackathon Runner`);
});
