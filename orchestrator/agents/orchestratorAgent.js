/**
 * NEXUS AI — AGENT 1: ORCHESTRATOR AGENT
 * Responsibilities:
 *  - Understand user's question and determine intent
 *  - Resolve follow-up conversational references ("its", "that file", "the project")
 *  - Plan workflow, select tools, and route tasks
 */

export class OrchestratorAgent {
  /**
   * Classify user question into intent categories
   */
  classifyIntent(query) {
    const q = (query || '').toLowerCase().trim();

    if (/\b(compare|difference|versus|vs|contrast|between)\b/i.test(q)) {
      return 'COMPARISON';
    }
    if (/\b(total|sum|average|avg|calculate|calculation|percentage|how much|how many|math|ratio)\b/i.test(q)) {
      return 'NUMERICAL';
    }
    if (/\b(list|bullet|what are all|advantages|disadvantages|features|steps)\b/i.test(q)) {
      return 'LIST';
    }
    if (q.includes('why') || q.includes('how does') || q.includes('cause') || q.includes('reason') || q.includes('explain how')) {
      return 'WHY_HOW';
    }
    if (q.includes('where') || q.includes('location') || q.includes('which city') || q.includes('address')) {
      return 'LOCATION';
    }
    if (q.includes('summarize all') || q.includes('overview of files') || q.includes('list all files') || q.includes('show all documents') || q.includes('what files')) {
      return 'DOCUMENTS_OVERVIEW';
    }
    if (q.includes('summarize') || q.includes('summary') || q.includes('briefly describe')) {
      return 'SUMMARY';
    }
    if (q.includes('conflict') || q.includes('contradict') || q.includes('discrepancy') || q.includes('mismatch') || q.includes('inconsistent')) {
      return 'CONTRADICTION';
    }
    if (q.includes('missing') || q.includes('unanswered') || q.includes('absent') || q.includes('gap')) {
      return 'MISSING_INFO';
    }
    if (q.startsWith('what is') || q.startsWith('define') || q.startsWith('meaning of')) {
      return 'DEFINITION';
    }
    return 'FACT';
  }

  /**
   * Resolve anaphoric pronouns and follow-up conversational context
   */
  resolveFollowUp(query, history = []) {
    if (!Array.isArray(history) || history.length === 0) return query;

    const q = query.trim();
    const qLower = q.toLowerCase();

    // Check for follow-up triggers
    const followUpPronouns = ['its', 'it', 'they', 'their', 'this project', 'that report', 'the applicant', 'these documents', 'the second file'];
    const hasPronoun = followUpPronouns.some(p => qLower.startsWith(p) || qLower.includes(` ${p} `) || qLower.includes(` ${p}?`));

    if (!hasPronoun) return query;

    // Find the last user query or assistant answer in history
    let lastQueryText = '';
    let lastAnswerText = '';

    for (let i = history.length - 1; i >= 0; i--) {
      const msg = history[i];
      if ((msg.sender === 'user' || msg.role === 'user') && !lastQueryText) {
        lastQueryText = msg.text || msg.content || '';
      }
      if ((msg.sender === 'ai' || msg.sender === 'bot' || msg.role === 'assistant') && !lastAnswerText) {
        lastAnswerText = msg.text || msg.content || '';
      }
      if (lastQueryText && lastAnswerText) break;
    }

    if (!lastQueryText) return query;

    // Extract core subject from last query (e.g., "Project Alpha", "Loan Case", "Income Certificate")
    const cleanLast = lastQueryText
      .replace(/^(what is|tell me about|explain|who is|can you show|details of)\s+/i, '')
      .replace(/[?!.]/g, '')
      .trim();

    return `${q} (Referencing: ${cleanLast || 'previously discussed subject'})`;
  }

  /**
   * Plan execution graph routing
   */
  planWorkflow(query, history = [], documentsCount = 0) {
    const resolvedQuery = this.resolveFollowUp(query, history);
    const intent = this.classifyIntent(resolvedQuery);

    const requiresTools = intent === 'NUMERICAL';
    const requiresCrossComparison = intent === 'COMPARISON' || intent === 'CONTRADICTION';
    const requiresVerification = intent === 'COMPARISON' || intent === 'CONTRADICTION' || intent === 'NUMERICAL';

    return {
      originalQuery: query,
      resolvedQuery,
      intent,
      requiresTools,
      requiresCrossComparison,
      requiresVerification,
      maxRetries: 2,
      documentsCount
    };
  }
}
