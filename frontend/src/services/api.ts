import {
  SystemMetrics,
  DocumentItem,
  Finding,
  MissingInformation,
  TemporalNode,
  KnowledgeGraphData,
  CaseDecisionReport,
  QAResponse
} from '../types/nexus';

const BASE_URL = '/api';

export const nexusApi = {
  async getStatus(): Promise<any> {
    const res = await fetch(`${BASE_URL}/status`);
    if (!res.ok) throw new Error('Failed to fetch system status');
    return res.json();
  },

  async getMetrics(): Promise<SystemMetrics> {
    const res = await fetch(`${BASE_URL}/metrics`);
    if (!res.ok) throw new Error('Failed to fetch system metrics');
    return res.json();
  },

  async getDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${BASE_URL}/documents`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async pollProgress(): Promise<{ processingRemaining: number; documents: DocumentItem[] }> {
    const res = await fetch(`${BASE_URL}/documents/progress`);
    if (!res.ok) throw new Error('Failed to poll progress');
    return res.json();
  },

  async uploadDocuments(filenames: string[]): Promise<any> {
    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames })
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  async getFindings(): Promise<Finding[]> {
    const res = await fetch(`${BASE_URL}/findings`);
    if (!res.ok) throw new Error('Failed to fetch findings');
    return res.json();
  },

  async getMissingInfo(): Promise<MissingInformation[]> {
    const res = await fetch(`${BASE_URL}/missing`);
    if (!res.ok) throw new Error('Failed to fetch missing info');
    return res.json();
  },

  async getTimeline(): Promise<TemporalNode[]> {
    const res = await fetch(`${BASE_URL}/timeline`);
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },

  async getGraph(): Promise<KnowledgeGraphData> {
    const res = await fetch(`${BASE_URL}/graph`);
    if (!res.ok) throw new Error('Failed to fetch graph');
    return res.json();
  },

  async askQuestion(query: string): Promise<QAResponse> {
    const res = await fetch(`${BASE_URL}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error('Failed to execute query');
    return res.json();
  },

  async getReport(): Promise<CaseDecisionReport> {
    const res = await fetch(`${BASE_URL}/report`);
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  },

  async resetData(): Promise<any> {
    const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
    return res.json();
  }
};
