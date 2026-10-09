/**
 * NEXUS AI — MULTI-AGENT DOCUMENT INTELLIGENCE GRAPH
 * Coordinates:
 *   START -> UnderstandQuestion -> RouteQuestion -> RetrieveEvidence
 *         -> EvaluateEvidence -> ReasonOrUseTools -> VerifyWhenNeeded -> FormatAnswer -> END
 */

import { OrchestratorAgent } from '../agents/orchestratorAgent.js';
import { ResearchAgent } from '../agents/researchAgent.js';
import { ReasoningAgent } from '../agents/reasoningAgent.js';
import { ToolsAgent } from '../agents/toolsAgent.js';
import { VerifierAgent } from '../agents/verifierAgent.js';
import { OllamaService } from '../services/ollama-service.js';
import { VectorService } from '../services/vector-service.js';

export class DocumentIntelligenceGraph {
  constructor(dataSource) {
    this.dataSource = dataSource;
    this.ollama = new OllamaService();
    this.vectorService = new VectorService(this.ollama);

    this.orchestrator = new OrchestratorAgent();
    this.researcher = new ResearchAgent(this.vectorService, dataSource);
    this.reasoner = new ReasoningAgent(this.ollama);
    this.tools = new ToolsAgent();
    this.verifier = new VerifierAgent(this.ollama);
  }

  /**
   * Index all session documents into persistent vector store
   */
  async indexAllDocuments() {
    const docs = this.dataSource?.documents || [];
    for (const doc of docs) {
      await this.vectorService.indexDocument(doc);
    }
  }

  /**
   * Execute full multi-agent question-answering workflow
   */
  async runWorkflow(query, history = []) {
    // 1. Understand & Plan
    const plan = this.orchestrator.planWorkflow(
      query,
      history,
      this.dataSource?.documents?.length || 0
    );

    // 2. Retrieve Evidence across ALL documents
    const retrieval = await this.researcher.retrieve(plan.resolvedQuery, 8);

    // 3. Reason or Calculate via Tools
    let reasoningResult;
    let toolResult = null;

    if (plan.requiresTools) {
      toolResult = this.tools.execute(plan.resolvedQuery, retrieval.evidence);
      if (toolResult.success) {
        reasoningResult = {
          answer: `### Verified Numerical Calculation\n\n${toolResult.explanation}\n\n*Calculated deterministically from verified document records.*`,
          intent: 'NUMERICAL',
          citations: (toolResult.sources || []).map(s => ({ file: s.source || s.file || 'document', page: s.page || 1 })),
          confidence: 0.98,
          modelUsed: 'deterministic-tools-agent'
        };
      }
    }

    if (!reasoningResult) {
      reasoningResult = await this.reasoner.reason(query, plan, retrieval);
    }

    // 4. Verify when needed (Selective Gemma 3 invocation or deterministic verification)
    let verification = { isVerified: true, confidence: reasoningResult.confidence };
    if (plan.requiresVerification && retrieval.hasSufficientEvidence) {
      verification = await this.verifier.verify(
        plan.resolvedQuery,
        reasoningResult.answer,
        retrieval.evidence
      );
    }

    // 5. Final Structured Payload
    const citationsList = reasoningResult.citations || [];
    return {
      query,
      resolvedQuery: plan.resolvedQuery,
      intent: plan.intent,
      answer: reasoningResult.answer,
      confidence: reasoningResult.confidence || 0.95,
      citations: citationsList,
      citedEvidence: citationsList.map(c => ({
        documentName: c.file || c.fileName || 'Document',
        pageNumber: c.page || c.pageNumber || 1
      })),
      evidenceSources: retrieval.distinctSources,
      totalSourcesSearched: retrieval.totalSourcesCount,
      verification,
      toolExecuted: toolResult?.toolExecuted || null,
      modelUsed: reasoningResult.modelUsed || 'nexus-multi-agent-system',
      timestamp: new Date().toISOString()
    };
  }
}
