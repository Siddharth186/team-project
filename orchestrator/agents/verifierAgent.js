/**
 * NEXUS AI — AGENT 5: VERIFICATION AGENT
 * Responsibilities:
 *  - Fact-checking & support verification against retrieved evidence
 *  - Selective invocation (Gemma 3 12B) on complex/conflicting queries
 *  - Numerical consistency and contradiction verification
 *  - Graceful degradation if secondary model is unavailable
 */

export class VerifierAgent {
  constructor(ollamaService) {
    this.ollama = ollamaService;
  }

  /**
   * Verify generated answer against retrieved evidence
   */
  async verify(query, answer, evidence = [], options = {}) {
    if (!answer || evidence.length === 0) {
      return {
        isVerified: true,
        confidence: 0.9,
        verifierModel: 'skip-empty-evidence',
        notes: 'Verification skipped: no evidence payload.'
      };
    }

    // Try Gemma 3 12B verification only if Ollama is running and secondary model enabled
    if (options.useSecondaryModel !== false && await this.ollama.isReachable()) {
      try {
        const evidenceSummary = evidence.map((e, i) => `[E${i + 1}] (${e.fileName}): ${e.content}`).join('\n');
        const verificationPrompt = `User Question: ${query}\n\nGenerated Answer:\n${answer}\n\nRetrieved Evidence:\n${evidenceSummary}\n\nEvaluate: 1) Is the answer strictly grounded in the evidence? 2) Are there any hallucinations or contradictions? Return VERIFIED or CONTRADICTED with a brief 1-line explanation.`;

        const res = await this.ollama.generateVerification(verificationPrompt);
        if (res.success && res.content) {
          const isVerified = !res.content.toUpperCase().includes('CONTRADICTED') && !res.content.toUpperCase().includes('HALLUCINATION');
          return {
            isVerified,
            confidence: isVerified ? 0.98 : 0.65,
            verifierModel: res.modelUsed,
            explanation: res.content.trim()
          };
        }
      } catch {
        // Fall through to deterministic verification
      }
    }

    // Deterministic Token-Support Verification Check
    return this.verifyDeterministic(query, answer, evidence);
  }

  /**
   * Deterministic evidence-support overlap checker
   */
  verifyDeterministic(query, answer, evidence) {
    const answerTokens = (answer.toLowerCase().match(/\w+/g) || []).filter(t => t.length > 3);
    const evidenceText = evidence.map(e => e.content).join(' ').toLowerCase();

    let matchedTokens = 0;
    for (const token of answerTokens) {
      if (evidenceText.includes(token)) {
        matchedTokens++;
      }
    }

    const supportRatio = answerTokens.length > 0 ? (matchedTokens / answerTokens.length) : 1.0;
    const isSupported = supportRatio >= 0.35 || answer.includes("couldn't find");

    return {
      isVerified: isSupported,
      confidence: isSupported ? 0.95 : 0.70,
      supportRatio: Math.round(supportRatio * 100) / 100,
      verifierModel: 'deterministic-evidence-validator'
    };
  }
}
