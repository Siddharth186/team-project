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

  async uploadDocuments(files: Array<{ name: string; size?: number; type?: string; category?: string } | string>): Promise<any> {
    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files })
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  async deleteDocument(id: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/documents/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return res.json();
  },

  async deleteMultipleDocuments(ids: string[]): Promise<any> {
    const res = await fetch(`${BASE_URL}/documents/bulk-delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });
    if (!res.ok) throw new Error('Failed to delete selected documents');
    return res.json();
  },

  async deleteBatch(batchId: string): Promise<any> {
    const res = await fetch(`${BASE_URL}/batches/${batchId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete batch');
    return res.json();
  },

  async deleteAllDocuments(): Promise<any> {
    const res = await fetch(`${BASE_URL}/documents/all`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to clear all documents');
    return res.json();
  },

  async getBatches(): Promise<any[]> {
    const res = await fetch(`${BASE_URL}/batches`);
    if (!res.ok) throw new Error('Failed to fetch batches');
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

  async askQuestion(query: string, history?: any[]): Promise<QAResponse> {
    const res = await fetch(`${BASE_URL}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, history: history || [] })
    });
    if (!res.ok) throw new Error('Failed to execute query');
    return res.json();
  },

  async getReport(options?: { documentId?: string; batchId?: string; targetType?: string }): Promise<any> {
    const params = new URLSearchParams();
    if (options?.documentId) params.append('documentId', options.documentId);
    if (options?.batchId) params.append('batchId', options.batchId);
    if (options?.targetType) params.append('targetType', options.targetType);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${BASE_URL}/report${queryStr}`);
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  },

  async resetData(): Promise<any> {
    const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
    return res.json();
  },

  async getModelStatus(): Promise<any> {
    const res = await fetch(`${BASE_URL}/models/status`);
    if (!res.ok) throw new Error('Failed to fetch model status');
    return res.json();
  }
};
