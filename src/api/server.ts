/**
 * NEXUS AI — Member 2 Intelligence REST API Server
 *
 * Exposes validated intelligence endpoints to Member 3 (Reasoning / Orchestration / UI):
 *   - POST /api/v1/intelligence/process   (Ingest and evaluate case payload)
 *   - GET  /api/v1/intelligence/:case_id  (Get full intelligence report)
 *   - GET  /api/v1/findings               (Get filtered findings)
 *   - GET  /api/v1/evidence/:finding_id   (Get traceable evidence cards)
 *   - GET  /api/v1/timeline/:entity_id    (Get entity timelines)
 *   - GET  /api/v1/health                 (Subsystem health check)
 */

import http from 'node:http';
import { URL } from 'node:url';
import { IntelligencePipeline } from '../intelligence_pipeline.ts';
import type { IngestedCasePayload, IntelligenceReport } from '../models/types.ts';

export class IntelligenceServer {
  private pipeline: IntelligencePipeline;
  private reportsStore: Map<string, IntelligenceReport> = new Map();
  private server: http.Server | null = null;

  constructor() {
    this.pipeline = new IntelligencePipeline();
  }

  public getPipeline(): IntelligencePipeline {
    return this.pipeline;
  }

  public storeReport(report: IntelligenceReport): void {
    this.reportsStore.set(report.case_id, report);
  }

  public getReport(caseId: string): IntelligenceReport | undefined {
    return this.reportsStore.get(caseId);
  }

  public createHttpServer(): http.Server {
    const server = http.createServer(async (req, res) => {
      // CORS headers for local/cross-origin frontends
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      const pathname = reqUrl.pathname;

      try {
        // Health check
        if (pathname === '/api/v1/health' && req.method === 'GET') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              status: 'ok',
              subsystem: 'MEMBER_2_INTELLIGENCE_ENGINE',
              active_cases_cached: this.reportsStore.size,
              timestamp: new Date().toISOString(),
            })
          );
          return;
        }

        // POST /api/v1/intelligence/process
        if (pathname === '/api/v1/intelligence/process' && req.method === 'POST') {
          const body = await this.readRequestBody(req);
          const payload = JSON.parse(body) as IngestedCasePayload;

          if (!payload.case_id) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing required field: case_id' }));
            return;
          }

          const report = this.pipeline.processCase(payload);
          this.reportsStore.set(report.case_id, report);

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(report, null, 2));
          return;
        }

        // GET /api/v1/intelligence/:case_id
        const intelligenceMatch = pathname.match(/^\/api\/v1\/intelligence\/([a-zA-Z0-9_-]+)$/);
        if (intelligenceMatch && req.method === 'GET') {
          const caseId = intelligenceMatch[1];
          const report = this.reportsStore.get(caseId);

          if (!report) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Case not found: ${caseId}` }));
            return;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(report, null, 2));
          return;
        }

        // GET /api/v1/findings?case_id=...&type=...&severity=...
        if (pathname === '/api/v1/findings' && req.method === 'GET') {
          const caseId = reqUrl.searchParams.get('case_id');
          const type = reqUrl.searchParams.get('type');
          const severity = reqUrl.searchParams.get('severity');

          let findings = Array.from(this.reportsStore.values()).flatMap(r => r.findings);
          if (caseId) {
            const r = this.reportsStore.get(caseId);
            findings = r ? r.findings : [];
          }

          if (type) {
            findings = findings.filter(f => f.type === type);
          }
          if (severity) {
            findings = findings.filter(f => f.severity === severity);
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ total: findings.length, findings }, null, 2));
          return;
        }

        // GET /api/v1/evidence/:finding_id
        const evidenceMatch = pathname.match(/^\/api\/v1\/evidence\/([a-zA-Z0-9_-]+)$/);
        if (evidenceMatch && req.method === 'GET') {
          const findingId = evidenceMatch[1];
          const allFindings = Array.from(this.reportsStore.values()).flatMap(r => r.findings);
          const finding = allFindings.find(f => f.finding_id === findingId);

          if (!finding) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Finding not found: ${findingId}` }));
            return;
          }

          const card = this.pipeline.getEvidenceEngine().generateEvidenceCard(finding);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(card, null, 2));
          return;
        }

        // GET /api/v1/timeline/:entity_id
        const timelineMatch = pathname.match(/^\/api\/v1\/timeline\/([a-zA-Z0-9_-]+)$/);
        if (timelineMatch && req.method === 'GET') {
          const entityId = timelineMatch[1];
          const caseId = reqUrl.searchParams.get('case_id');

          let timelines = Array.from(this.reportsStore.values()).flatMap(r => r.timelines);
          if (caseId) {
            const r = this.reportsStore.get(caseId);
            timelines = r ? r.timelines : [];
          }

          const entityTimelines = timelines.filter(t => t.entity_id === entityId);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ entity_id: entityId, timelines: entityTimelines }, null, 2));
          return;
        }

        // 404 Route Not Found
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Route not found: ${req.method} ${pathname}` }));
      } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
      }
    });

    this.server = server;
    return server;
  }

  public async start(port = 3002): Promise<number> {
    const s = this.createHttpServer();
    return new Promise((resolve, reject) => {
      s.listen(port, () => {
        resolve(port);
      });
      s.on('error', reject);
    });
  }

  public async stop(): Promise<void> {
    if (this.server) {
      return new Promise(resolve => {
        this.server!.close(() => resolve());
      });
    }
  }

  private readRequestBody(req: http.IncomingMessage): Promise<string> {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });
  }
}
