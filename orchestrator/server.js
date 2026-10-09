/**
 * NEXUS AI — MEMBER 3 ORCHESTRATION SERVER
 * Handles reasoning, Q&A, dashboard metrics, evidence routing, and decision reporting.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
import { Member1Client } from './services/member1-client.js';
import { StorageManager } from './services/storage-manager.js';
import { DocumentIntelligenceGraph } from './graph/documentIntelligenceGraph.js';
import { ModelConfig } from './config/models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

const app = express();
const PORT = process.env.ORCHESTRATOR_PORT || (process.env.PORT === '8000' ? 5001 : process.env.PORT) || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Seed defaults
const seedData = {
  documents: mockDocuments,
  entities: mockEntities,
  facts: mockFacts,
  findings: mockFindings,
  missingInformation: mockMissingInformation,
  temporalTrajectory: mockTemporalTrajectory,
  graph: mockRelationshipGraph,
  metrics: mockSystemMetrics
};

// Durable session data store (persists across server restarts)
let sessionData = StorageManager.loadSession(seedData);

const agentGraph = new DocumentIntelligenceGraph(sessionData);
const reasoningEngine = new GroundedReasoningEngine(sessionData);
const reportGenerator = new CaseReportGenerator(sessionData);
const member2Client = new Member2Client();
const member1Client = new Member1Client();

// Initial background indexing of session documents into persistent vector store
agentGraph.indexAllDocuments().catch(() => {});

// Periodic check for Member 1 & 2 availability
setInterval(async () => {
  await member2Client.checkHealth();
  await member1Client.checkHealth();
}, 30000);
member2Client.checkHealth().catch(() => {});
member1Client.checkHealth().catch(() => {});

// ==========================================
// API ROUTES
// ==========================================

// 1. Health & System Status
app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'ok', service: 'nexus-orchestrator', port: PORT });
});

app.get('/api/status', (req, res) => {
  const m2Status = member2Client.getStatus();
  const m1Status = member1Client.getStatus();
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
    member1Integration: m1Status,
    member2Integration: m2Status,
    storagePersistence: {
      durable: true,
      ...StorageManager.getStats()
    },
    timestamp: new Date().toISOString()
  });
});

// Session Management & Persistence
app.get('/api/session/stats', (req, res) => {
  res.json({
    durable: true,
    ...StorageManager.getStats(),
    activeDocuments: sessionData.documents.length,
    activeFacts: sessionData.facts.length,
    activeFindings: sessionData.findings.length
  });
});

app.post('/api/session/reset', (req, res) => {
  sessionData = StorageManager.resetSession(seedData);
  reasoningEngine.dataSource = sessionData;
  reportGenerator.caseData = sessionData;
  res.json({ message: 'Session reset to initial seed state', stats: StorageManager.getStats() });
});

// 2. Dashboard Metrics
app.get('/api/metrics', (req, res) => {
  res.json(sessionData.metrics);
});

// 3. Document Management
function detectTags(name, category) {
  const n = (name || '').toLowerCase();
  const tags = [];
  
  if (n.includes('exp') || n.includes('lab') || n.includes('web programming') || n.includes('cn') || n.includes('uit') || n.includes('cse') || n.includes('code')) {
    tags.push('#academic-lab', '#coursework');
  }
  if (n.includes('resume') || n.includes('cv') || n.includes('portfolio') || n.includes('profile')) {
    tags.push('#resume-portfolio', '#identity');
  }
  if (n.includes('tax') || n.includes('itr') || n.includes('form16') || n.includes('gst')) {
    tags.push('#tax-filing', '#compliance');
  }
  if (n.includes('grant') || n.includes('subsidy') || n.includes('sanction') || n.includes('mnre')) {
    tags.push('#grant-subsidy', '#financial');
  }
  if (n.includes('kyc') || n.includes('pan') || n.includes('aadhaar') || n.includes('passport') || n.includes('identity')) {
    tags.push('#kyc-identity', '#verified-id');
  }
  if (n.includes('board') || n.includes('resolution') || n.includes('noc') || n.includes('agreement') || n.includes('legal')) {
    tags.push('#board-resolution', '#legal-instrument');
  }
  if (n.includes('audit') || n.includes('balance') || n.includes('financial') || n.includes('statement') || n.includes('term_loan')) {
    tags.push('#financial-statement', '#audit');
  }
  if (tags.length === 0) {
    tags.push(`#${(category || 'document').toLowerCase()}`, '#verified-doc');
  }
  return Array.from(new Set(tags));
}

app.get('/api/documents', (req, res) => {
  const enriched = sessionData.documents.map(doc => {
    if (!doc.report) {
      doc.report = reportGenerator.generateDocumentReport(doc.id);
    }
    if (!doc.tags || doc.tags.length === 0) {
      doc.tags = detectTags(doc.name, doc.documentCategory);
    }
    return doc;
  });
  res.json(enriched);
});

app.get('/api/documents/:id', (req, res) => {
  const doc = sessionData.documents.find(d => d.id === req.params.id || d.name === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  if (!doc.report) {
    doc.report = reportGenerator.generateDocumentReport(doc.id);
  }
  if (!doc.tags || doc.tags.length === 0) {
    doc.tags = detectTags(doc.name, doc.documentCategory);
  }
  res.json(doc);
});

app.get('/api/documents/:id/report', (req, res) => {
  const doc = sessionData.documents.find(d => d.id === req.params.id || d.name === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }
  const report = reportGenerator.generateDocumentReport(doc.id);
  doc.report = report;
  if (!doc.tags || doc.tags.length === 0) {
    doc.tags = detectTags(doc.name, doc.documentCategory);
  }
  res.json(report);
});

function detectCategory(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('tax') || n.includes('itr') || n.includes('form16') || n.includes('gst')) return 'TAX';
  if (n.includes('grant') || n.includes('subsidy') || n.includes('sanction') || n.includes('mnre')) return 'GRANT';
  if (n.includes('kyc') || n.includes('pan') || n.includes('aadhaar') || n.includes('passport') || n.includes('identity')) return 'IDENTITY';
  if (n.includes('legal') || n.includes('board') || n.includes('resolution') || n.includes('agreement') || n.includes('noc')) return 'LEGAL';
  return 'FINANCIAL';
}

// Processing upload with Member 1 & Member 2 cross-subsystem execution
// Processing upload with Member 1 & Member 2 cross-subsystem execution
app.post('/api/documents/upload', async (req, res) => {
  const incoming = req.body?.documents || req.body?.files || req.body?.filenames || [];
  const fileItems = Array.isArray(incoming) && incoming.length > 0 ? incoming : ['Financial_Audit_Addendum.pdf'];

  const batchId = req.body?.batchId || `batch-${Date.now()}`;
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const batchName = req.body?.batchName || `Batch ${nowTime} (${fileItems.length} file${fileItems.length > 1 ? 's' : ''})`;

  const UPLOAD_DIR = path.join(__dirname, '../data/documents');
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const ingestedResults = [];

  const BATCH_SIZE = 10;
  for (let i = 0; i < fileItems.length; i += BATCH_SIZE) {
    const chunk = fileItems.slice(i, i + BATCH_SIZE);
    const chunkPromises = chunk.map(async (item) => {
      const fileObj = typeof item === 'object' && item !== null ? item : { name: String(item) };
      
      // Physical file storage
      if (fileObj.content) {
        try {
          const filePath = path.join(UPLOAD_DIR, fileObj.name || `uploaded_${Date.now()}.txt`);
          if (typeof fileObj.content === 'string' && fileObj.content.includes(';base64,')) {
            const base64Part = fileObj.content.split(';base64,').pop();
            fs.writeFileSync(filePath, Buffer.from(base64Part, 'base64'));
          } else {
            fs.writeFileSync(filePath, typeof fileObj.content === 'string' ? fileObj.content : JSON.stringify(fileObj.content), 'utf-8');
          }
        } catch (err) {
          console.warn('[STORAGE] Failed to save physical file copy:', err.message);
        }
      }

      return member1Client.ingestDocument(fileObj);
    });

    const batchResults = await Promise.all(chunkPromises);
    ingestedResults.push(...batchResults);
  }

  const createdDocs = ingestedResults.map(r => ({
    ...r.document,
    batchId,
    batchName,
    status: 'PROCESSED',
    processingProgress: 100
  }));
  sessionData.documents.push(...createdDocs);

  const allRawEntities = ingestedResults.flatMap(r => r.rawEntities || []);
  const allRawFacts = ingestedResults.flatMap(r => r.rawFacts || []);

  // Register raw entities into session
  allRawEntities.forEach(re => {
    if (!sessionData.entities.some(e => e.name.toLowerCase() === re.raw_name.toLowerCase())) {
      sessionData.entities.push({
        id: re.mention_id || `ent-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        name: re.raw_name,
        type: re.entity_type || 'ORGANIZATION',
        aliases: [re.raw_name],
        verified: true,
        batchId
      });
    }
  });

  if (allRawFacts.length > 0) {
    const casePayload = {
      case_id: `CASE-UPLOAD-${Date.now()}`,
      case_type: 'LOAN_VERIFICATION',
      documents: createdDocs.map(d => ({
        document_id: d.id,
        document_name: d.name,
        doc_type: d.documentCategory,
        page_count: d.totalPages,
        batchId
      })),
      raw_entities: allRawEntities,
      raw_facts: allRawFacts
    };

    console.log(`[MEMBER 2] ANALYSIS_STARTED caseId=${casePayload.case_id} facts=${allRawFacts.length}`);
    const member2Report = await member2Client.processCase(casePayload);
    if (member2Report && member2Report.findings) {
      console.log(`[MEMBER 2] ANALYSIS_COMPLETED findings=${member2Report.findings.length}`);
      member2Report.findings.forEach(f => {
        const isDuplicate = sessionData.findings.some(sf => sf.title === f.title && sf.summary === (f.description || ''));
        if (!isDuplicate) {
          sessionData.findings.push({
            id: `finding-${Date.now()}-${Math.random().toString(36).substring(7)}`,
            batchId,
            category: f.type || 'DOCUMENT_INTELLIGENCE',
            severity: f.severity || 'HIGH',
            title: f.title || 'Cross-Document Intelligence Finding',
            summary: f.description || 'Verified cross-document evidence',
            impactScore: 75,
            conflictingFacts: (f.facts || []).map(fact => ({
              id: fact.fact_id,
              entityName: fact.entity_id || 'Entity',
              attribute: fact.attribute,
              declaredValue: fact.normalized_value?.formatted || String(fact.normalized_value?.raw_value || ''),
              source: {
                documentName: fact.evidence?.document_name || 'Uploaded File',
                pageNumber: fact.evidence?.page_number || 1,
                snippet: fact.evidence?.source_text || ''
              }
            })),
            discrepancyDelta: {
              metric: f.metadata?.attribute || 'Discrepancy',
              difference: f.description || 'Verified variance'
            },
            status: 'UNRESOLVED'
          });
        }
      });
    }

    allRawFacts.forEach((rf, i) => {
      sessionData.facts.push({
        id: rf.fact_id || `fact-${Date.now()}-${i}`,
        batchId,
        entityId: 'ent-1',
        entityName: rf.raw_entity_name,
        attribute: rf.attribute,
        value: String(rf.raw_value),
        confidence: 0.95,
        source: {
          documentId: rf.evidence.document_id,
          documentName: rf.evidence.document_name,
          pageNumber: rf.evidence.page_number,
          snippet: rf.evidence.source_text
        }
      });
    });
  }

  sessionData.metrics.totalDocuments = sessionData.documents.length;
  sessionData.metrics.processedDocuments = sessionData.documents.filter(d => d.status === 'PROCESSED').length;
  sessionData.metrics.totalFacts = sessionData.facts.length;
  sessionData.metrics.totalConflicts = sessionData.findings.length;

  // Index new documents into persistent vector store
  for (const doc of createdDocs) {
    agentGraph.vectorService.indexDocument(doc).catch(() => {});
  }

  // Update Grounded Reasoning and Report Generator with new state
  reasoningEngine.updateState(sessionData);
  reportGenerator.caseData = sessionData;

  // Generate and store report in each created doc
  createdDocs.forEach(doc => {
    doc.report = reportGenerator.generateDocumentReport(doc.id);
  });

  // Persist session state to disk
  StorageManager.saveSession(sessionData);
  console.log(`[STORAGE] DATABASE_SAVE_COMPLETED path=orchestrator/data/session-store.json docs=${sessionData.documents.length} facts=${sessionData.facts.length}`);

  res.status(202).json({
    message: `${createdDocs.length} document(s) accepted into batch ${batchName}`,
    batchId,
    batchName,
    documents: createdDocs,
    totalDocuments: sessionData.documents.length
  });
});

// Get batches grouping
app.get('/api/batches', (req, res) => {
  const batchMap = new Map();

  sessionData.documents.forEach(doc => {
    const bId = doc.batchId || 'batch-default';
    const bName = doc.batchName || 'Default Batch';
    if (!batchMap.has(bId)) {
      batchMap.set(bId, {
        batchId: bId,
        batchName: bName,
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
        documents: [],
        totalFiles: 0,
        totalSize: 0,
        status: 'PROCESSED',
        findingsCount: 0
      });
    }
    const b = batchMap.get(bId);
    b.documents.push(doc);
    b.totalFiles += 1;
    b.totalSize += (doc.fileSize || 0);
  });

  const batches = Array.from(batchMap.values()).map(b => {
    const bFindings = sessionData.findings.filter(f => f.batchId === b.batchId);
    return {
      ...b,
      findingsCount: bFindings.length
    };
  });

  res.json(batches);
});

// Delete an entire batch
app.delete('/api/batches/:batchId', (req, res) => {
  const { batchId } = req.params;
  const docsToDelete = sessionData.documents.filter(d => d.batchId === batchId);
  const docIds = docsToDelete.map(d => d.id);
  const docNames = docsToDelete.map(d => d.name);

  // Remove documents
  sessionData.documents = sessionData.documents.filter(d => d.batchId !== batchId);
  
  // Remove associated facts and findings
  sessionData.facts = sessionData.facts.filter(f => f.batchId !== batchId && !docIds.includes(f.source?.documentId) && !docNames.includes(f.source?.documentName));
  sessionData.findings = sessionData.findings.filter(f => f.batchId !== batchId);

  // Purge vectors
  agentGraph.vectorService.deleteFiles([...docIds, ...docNames]);

  sessionData.metrics.totalDocuments = sessionData.documents.length;
  sessionData.metrics.processedDocuments = sessionData.documents.filter(d => d.status === 'PROCESSED').length;
  sessionData.metrics.totalFacts = sessionData.facts.length;
  sessionData.metrics.totalConflicts = sessionData.findings.length;

  StorageManager.saveSession(sessionData);

  res.json({
    success: true,
    deletedBatchId: batchId,
    deletedDocumentsCount: docsToDelete.length,
    remainingDocumentsCount: sessionData.documents.length
  });
});

// Delete all documents (Clean Wipe / Clear Dossier)
app.delete(['/api/documents/all', '/api/files/all'], (req, res) => {
  const prevCount = sessionData.documents.length;
  sessionData.documents = [];
  sessionData.facts = [];
  sessionData.findings = [];
  sessionData.entities = [];
  sessionData.missingInformation = [];
  sessionData.temporalTrajectory = [];
  sessionData.metrics = {
    totalDocuments: 0,
    processedDocuments: 0,
    totalFacts: 0,
    totalEntities: 0,
    totalRelationships: 0,
    totalConflicts: 0,
    criticalConflicts: 0,
    missingDataCount: 0,
    evidenceCount: 0,
    averageConfidence: 0.95,
    systemStatus: 'ONLINE'
  };

  // Clear vector store
  agentGraph.vectorService.clearAll();

  // Persist empty state to disk
  StorageManager.saveSession(sessionData);
  console.log(`[STORAGE] ALL_DOCUMENTS_CLEARED prevCount=${prevCount}`);

  res.json({
    success: true,
    message: `All ${prevCount} documents and associated intelligence records purged successfully.`,
    totalDocuments: 0
  });
});

// Bulk delete specific documents by IDs
app.post('/api/documents/bulk-delete', (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (ids.length === 0) {
    return res.status(400).json({ error: 'Array of ids is required' });
  }

  const idsSet = new Set(ids);
  const deletedDocs = sessionData.documents.filter(d => idsSet.has(d.id) || idsSet.has(d.name));
  const deletedNames = deletedDocs.map(d => d.name);

  sessionData.documents = sessionData.documents.filter(d => !idsSet.has(d.id) && !idsSet.has(d.name));
  sessionData.facts = sessionData.facts.filter(f => !idsSet.has(f.source?.documentId) && !deletedNames.includes(f.source?.documentName));
  
  // Purge vectors
  agentGraph.vectorService.deleteFiles([...ids, ...deletedNames]);

  sessionData.metrics.totalDocuments = sessionData.documents.length;
  sessionData.metrics.processedDocuments = sessionData.documents.filter(d => d.status === 'PROCESSED').length;
  sessionData.metrics.totalFacts = sessionData.facts.length;
  sessionData.metrics.totalConflicts = sessionData.findings.length;

  StorageManager.saveSession(sessionData);

  res.json({
    success: true,
    deletedCount: deletedDocs.length,
    remainingDocumentsCount: sessionData.documents.length
  });
});

// Standard files routes for REST client compatibility
app.get('/api/files', (req, res) => {
  res.json({
    files: sessionData.documents,
    total: sessionData.documents.length,
    vectorStoreStats: agentGraph.vectorService.getStats()
  });
});

app.post('/api/files', async (req, res) => {
  req.url = '/api/documents/upload';
  return app._router.handle(req, res);
});

// Delete single document endpoint with vector store purging
app.delete(['/api/documents/:id', '/api/files/:id'], (req, res) => {
  const { id } = req.params;
  const initialLen = sessionData.documents.length;
  const targetDoc = sessionData.documents.find(d => d.id === id || d.name === id);
  const targetName = targetDoc?.name || id;

  sessionData.documents = sessionData.documents.filter(d => d.id !== id && d.name !== id);
  sessionData.facts = sessionData.facts.filter(f => f.source?.documentId !== id && f.source?.documentName !== targetName);
  
  sessionData.metrics.totalDocuments = sessionData.documents.length;
  sessionData.metrics.processedDocuments = sessionData.documents.filter(d => d.status === 'PROCESSED').length;
  sessionData.metrics.totalFacts = sessionData.facts.length;

  // Purge vectors
  agentGraph.vectorService.deleteFile(id);
  if (targetName !== id) agentGraph.vectorService.deleteFile(targetName);

  // Persist deletion to disk
  StorageManager.saveSession(sessionData);

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
  const { entityId, category, batchId, documentId } = req.query;
  let facts = sessionData.facts;
  if (entityId) {
    facts = facts.filter(f => f.entityId === entityId);
  }
  if (category) {
    facts = facts.filter(f => f.entityType === category);
  }
  if (batchId) {
    facts = facts.filter(f => f.batchId === batchId);
  }
  if (documentId) {
    facts = facts.filter(f => f.source?.documentId === documentId || f.source?.documentName === documentId);
  }
  res.json(facts);
});

// 5. Findings & Conflicts
app.get('/api/findings', (req, res) => {
  const { severity, category, batchId, documentId } = req.query;
  let findings = sessionData.findings;
  if (severity) {
    findings = findings.filter(f => f.severity.toLowerCase() === severity.toLowerCase());
  }
  if (category) {
    findings = findings.filter(f => f.category.toLowerCase() === category.toLowerCase());
  }
  if (batchId) {
    findings = findings.filter(f => f.batchId === batchId);
  }
  if (documentId) {
    findings = findings.filter(f => (f.conflictingFacts || []).some(cf => cf.source?.documentName === documentId));
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

// 9. Local Ollama Models & Health Endpoints
app.get(['/api/models/status', '/api/models/health'], async (req, res) => {
  const health = await agentGraph.ollama.checkHealth();
  res.json({
    ...health,
    vectorStore: agentGraph.vectorService.getStats(),
    config: ModelConfig
  });
});

// 10. Multi-Agent Natural Language Q&A / Chat
app.post(['/api/qa', '/api/chat', '/api/query', '/api/ai/query'], async (req, res) => {
  try {
    const query = req.body?.query || req.body?.question || req.body?.prompt || req.body?.message;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Valid query parameter is required.' });
    }

    const history = req.body?.history || [];
    const response = await agentGraph.runWorkflow(query, history);
    res.json(response);
  } catch (err) {
    res.status(500).json({
      error: 'Multi-agent graph execution failed.',
      details: err.message
    });
  }
});

// 10. Decision & Targeted Audit Case Report
app.get('/api/report', (req, res) => {
  const { documentId, batchId, targetType } = req.query;
  const report = reportGenerator.generateReport({ documentId, batchId, targetType });
  res.json(report);
});

app.post('/api/report/generate', (req, res) => {
  const { documentId, batchId, targetType, targetId } = req.body || {};
  const report = reportGenerator.generateReport({
    documentId: documentId || (targetType === 'DOCUMENT' ? targetId : undefined),
    batchId: batchId || (targetType === 'BATCH' ? targetId : undefined),
    targetType
  });
  res.json(report);
});

app.get('/api/report/markdown', (req, res) => {
  const { documentId, batchId, targetType } = req.query;
  const report = reportGenerator.generateReport({ documentId, batchId, targetType });
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
