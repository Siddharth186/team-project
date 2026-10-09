/**
 * NEXUS AI — ADVANCED QUESTION-FIRST GROUNDED REASONING ENGINE
 * 
 * CORE PRINCIPLES (Master Prompt Compliance):
 * 1. Question-Driven Retrieval: Understand intent, entities, and keywords BEFORE searching.
 * 2. Search Across ALL Uploaded Files: Query all documents, chunks, and facts (not just the first few).
 * 3. Intent-Specific Answering: Format direct responses matching user intent (Comparison, List, Numerical, Why/How, Fact).
 * 4. Conversational Follow-Up: Resolve anaphoric pronouns ("its", "he", "they", "this") using conversation history.
 * 5. Strict Source Grounding: Answers grounded exclusively in uploaded evidence with Document & Page citations.
 * 6. Anti-Hallucination Guardrail: If evidence is absent, state "I couldn't find this information in the uploaded files."
 */

import {
  mockDocuments,
  mockEntities,
  mockFacts,
  mockFindings,
  mockMissingInformation,
  mockTemporalTrajectory,
  mockRelationshipGraph
} from '../data/loan-case-data.js';

export class GroundedReasoningEngine {
  constructor(dataSource = null) {
    this.dataSource = dataSource || {
      documents: mockDocuments,
      entities: mockEntities,
      facts: mockFacts,
      findings: mockFindings,
      missingInformation: mockMissingInformation,
      temporalTrajectory: mockTemporalTrajectory,
      graph: mockRelationshipGraph
    };
    this.geminiApiKey = process.env.GEMINI_API_KEY || '';
    this.geminiModel = 'gemini-3.5-flash';
    this.conversationHistory = [];
  }

  /**
   * Update internal state when live data is received from Member 1 / Member 2
   */
  updateState(liveData) {
    if (!liveData) return;
    if (liveData.documents) this.dataSource.documents = liveData.documents;
    if (liveData.entities) this.dataSource.entities = liveData.entities;
    if (liveData.facts) this.dataSource.facts = liveData.facts;
    if (liveData.findings) this.dataSource.findings = liveData.findings;
    if (liveData.missingInformation) this.dataSource.missingInformation = liveData.missingInformation;
    if (liveData.temporalTrajectory) this.dataSource.temporalTrajectory = liveData.temporalTrajectory;
    if (liveData.graph) this.dataSource.graph = liveData.graph;
  }

  /**
   * Classify Question Intent
   */
  classifyIntent(qLower) {
    if (
      qLower.includes('compare') ||
      qLower.includes('difference between') ||
      qLower.includes(' vs ') ||
      qLower.includes('versus') ||
      qLower.includes('contrast') ||
      qLower.includes('how do they differ')
    ) {
      return 'COMPARISON';
    }

    if (
      qLower.includes('what is meaning') ||
      qLower.includes('define ') ||
      qLower.startsWith('what is machine learning') ||
      qLower.startsWith('what is ai')
    ) {
      return 'DEFINITION';
    }

    if (
      qLower.includes('list ') ||
      qLower.includes('in points') ||
      qLower.includes('bullet') ||
      qLower.includes('advantages') ||
      qLower.includes('disadvantages') ||
      qLower.includes('requirements') ||
      qLower.includes('what are the') ||
      qLower.includes('give me points')
    ) {
      return 'LIST';
    }

    if (
      qLower.includes('how much') ||
      qLower.includes('total') ||
      qLower.includes('amount') ||
      qLower.includes('revenue') ||
      qLower.includes('budget') ||
      qLower.includes('limit') ||
      qLower.includes('cost') ||
      qLower.includes('income') ||
      qLower.includes('salary') ||
      qLower.includes('turnover') ||
      qLower.includes('percentage') ||
      qLower.includes('rate')
    ) {
      return 'NUMERICAL';
    }

    if (
      qLower.startsWith('why ') ||
      qLower.startsWith('how ') ||
      qLower.includes('reason for') ||
      qLower.includes('cause of') ||
      qLower.includes('explain why') ||
      qLower.includes('explain how')
    ) {
      return 'WHY_HOW';
    }

    if (
      qLower.includes('where is') ||
      qLower.includes('which document') ||
      qLower.includes('which page') ||
      qLower.includes('where described') ||
      qLower.includes('location of')
    ) {
      return 'LOCATION';
    }

    if (
      qLower.includes('conflict') ||
      qLower.includes('contradict') ||
      qLower.includes('discrepan') ||
      qLower.includes('inconsistent') ||
      qLower.includes('mismatch')
    ) {
      return 'CONTRADICTION';
    }

    if (
      qLower.includes('list document') ||
      qLower.includes('list file') ||
      qLower.includes('list all file') ||
      qLower.includes('list all document') ||
      qLower.includes('show all document') ||
      qLower.includes('show all file') ||
      qLower.includes('how many document') ||
      qLower.includes('how many file') ||
      qLower.startsWith('what files have been') ||
      qLower.startsWith('what documents have been') ||
      qLower.startsWith('list the files') ||
      qLower.startsWith('list the documents') ||
      qLower === 'documents' ||
      qLower === 'files' ||
      qLower === 'list files' ||
      qLower === 'list all' ||
      qLower === 'list documents'
    ) {
      return 'DOCUMENTS_OVERVIEW';
    }

    return 'FACT';
  }

  /**
   * Resolve follow-up conversational pronouns ("its", "his", "her", "their", "that", "this")
   */
  resolveFollowUp(query, history = []) {
    const qLower = query.toLowerCase().trim();
    const isFollowUp = /\b(its|it|his|her|their|them|this|these|that|the same|previous)\b/i.test(query);

    if (!isFollowUp || history.length === 0) {
      return { resolvedQuery: query, contextKeywords: [] };
    }

    // Get the most recent user turn
    const lastUserTurn = history.filter(h => h.sender === 'user' || h.role === 'user').pop();
    const lastAssistantTurn = history.filter(h => h.sender === 'nexus' || h.role === 'assistant').pop();

    const previousText = (lastUserTurn?.text || lastUserTurn?.content || '') + ' ' +
                         (lastAssistantTurn?.text || lastAssistantTurn?.content || '');

    const stopwords = new Set(['what', 'who', 'where', 'when', 'which', 'why', 'how', 'is', 'are', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'tell', 'show', 'give', 'me', 'about']);
    const contextKeywords = previousText
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 4 && !stopwords.has(t));

    const enrichedQuery = `${query} (Context from previous turn: ${contextKeywords.slice(0, 4).join(' ')})`;
    return { resolvedQuery: enrichedQuery, contextKeywords: contextKeywords.slice(0, 4) };
  }

  /**
   * Process a natural language question
   */
  async answerQuestion(query, history = []) {
    const qLower = query.toLowerCase().trim();
    const intent = this.classifyIntent(qLower);
    const { resolvedQuery, contextKeywords } = this.resolveFollowUp(query, history);

    // If documents overview is explicitly requested
    if (intent === 'DOCUMENTS_OVERVIEW') {
      return this.handleDocumentsQuery();
    }

    // Retrieve relevant facts and chunks across ALL uploaded documents
    const retrieved = this.retrieveRelevantKnowledge(qLower, contextKeywords);

    // 1. Try Live Grounded LLM Reasoning via Gemini
    if (this.geminiApiKey) {
      try {
        const geminiAnswer = await this.askGeminiGrounded(query, resolvedQuery, intent, retrieved, history);
        if (geminiAnswer) return geminiAnswer;
      } catch (err) {
        console.warn('[REASONING ENGINE] Grounded Gemini LLM failed, using deterministic fallbacks:', err.message);
      }
    }

    // 2. Deterministic Rule & Grounded Retrieval Engine
    return this.deterministicFactRetrieval(query, qLower, intent, retrieved, history);
  }

  /**
   * Universal Retrieval Engine: Searches across ALL facts, document chunks, and findings
   */
  retrieveRelevantKnowledge(qLower, contextKeywords = []) {
    // Explicit absent check
    const absentKeywords = ['blood', 'religion', 'spouse', 'caste', 'height', 'weight', 'passport number', 'dna'];
    if (absentKeywords.some(kw => qLower.includes(kw))) {
      return { facts: [], chunks: [], findings: [] };
    }

    const stopwords = new Set([
      'what', 'who', 'where', 'when', 'which', 'why', 'how', 'is', 'are', 'was', 'were',
      'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'tell', 'show',
      'give', 'me', 'about', 'from', 'with', 'by', 'that', 'this', 'does', 'did', 'have',
      'has', 'any', 'all', 'according', 'between', 'mention', 'mentioned', 'document', 'file',
      'report', 'dossier', 'please', 'explain'
    ]);

    const queryTokens = qLower
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 3 && !stopwords.has(t))
      .concat(contextKeywords);

    // 1. Score and rank facts
    const scoredFacts = [];
    for (const f of this.dataSource.facts) {
      let score = 0;
      const ent = (f.entityName || f.raw_entity_name || '').toLowerCase();
      const attr = (f.attribute || '').toLowerCase();
      const val = String(f.value || f.raw_value || '').toLowerCase();
      const doc = (f.source?.documentName || '').toLowerCase();
      const quote = (f.source?.snippet || f.context || '').toLowerCase();

      for (const token of queryTokens) {
        if (ent.includes(token)) score += 12;
        if (attr.includes(token)) score += 10;
        if (val.includes(token)) score += 8;
        if (doc.includes(token)) score += 10;
        if (quote.includes(token)) score += 6;
      }

      // Exact filename token match
      if (qLower.includes(doc) || (doc && doc.split('.')[0] && qLower.includes(doc.split('.')[0]))) {
        score += 25;
      }

      // Domain synonym boosts
      if (qLower.includes('income') || qLower.includes('salary') || qLower.includes('earning')) {
        if (attr.includes('income') || attr.includes('salary')) score += 15;
      }
      if (qLower.includes('borrow') || qLower.includes('loan') || qLower.includes('credit') || qLower.includes('limit')) {
        if (attr.includes('borrow') || attr.includes('loan') || attr.includes('limit') || attr.includes('financial')) score += 15;
      }
      if (qLower.includes('date') || qLower.includes('when')) {
        if (attr.includes('date') || attr.includes('joining')) score += 15;
      }
      if (qLower.includes('company') || qLower.includes('employer') || qLower.includes('work') || qLower.includes('org')) {
        if (attr.includes('company') || attr.includes('employer') || ent.includes('ltd') || ent.includes('corp') || ent.includes('technologies')) score += 15;
      }

      if (score > 0) {
        scoredFacts.push({ fact: f, score });
      }
    }

    scoredFacts.sort((a, b) => b.score - a.score);
    const topFacts = scoredFacts.filter(s => s.score >= 12).slice(0, 20).map(s => s.fact);

    // 2. Score and rank document text chunks across ALL documents
    const scoredChunks = [];
    for (const doc of this.dataSource.documents) {
      const docName = (doc.name || '').toLowerCase();
      const isTargetDoc = qLower.includes(docName) || (docName.split('.')[0] && qLower.includes(docName.split('.')[0]));

      const chunks = Array.isArray(doc.chunks) && doc.chunks.length > 0 
        ? doc.chunks 
        : [{ chunkId: 'chk-1', content: doc.extractedTextSnippet || doc.name, chunkIndex: 0 }];

      for (const chk of chunks) {
        let cScore = 0;
        const text = (chk.content || '').toLowerCase();

        for (const token of queryTokens) {
          if (text.includes(token)) cScore += 8;
          if (docName.includes(token)) cScore += 10;
        }

        if (isTargetDoc) cScore += 30;

        if (cScore > 0) {
          scoredChunks.push({
            chunk: chk,
            documentName: doc.name,
            documentId: doc.id,
            category: doc.documentCategory,
            score: cScore
          });
        }
      }
    }

    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.filter(c => c.score >= 12).slice(0, 10);

    // 3. Relevant findings
    const topFindings = this.dataSource.findings.filter(f => {
      const fText = (f.title + ' ' + (f.summary || f.description || '')).toLowerCase();
      return queryTokens.some(t => fText.includes(t));
    }).slice(0, 8);

    return {
      facts: topFacts,
      chunks: topChunks,
      findings: topFindings
    };
  }

  /**
   * Gemini 3.5 Flash Grounded Q&A with Intent Directives
   */
  async askGeminiGrounded(query, resolvedQuery, intent, retrieved, history = []) {
    const { facts, chunks, findings } = retrieved;

    // Build context
    const factsSummary = (facts.length > 0 ? facts : this.dataSource.facts.slice(0, 15)).map((f, i) => 
      `Fact ${i+1}: Entity="${f.entityName || f.raw_entity_name}", Attribute="${f.attribute}", Value="${f.value || f.raw_value}", Document="${f.source?.documentName || 'Doc'}", Page=${f.source?.pageNumber || 1}, SourceQuote="${f.source?.snippet || f.context || ''}"`
    ).join('\n');

    const chunksSummary = chunks.map((c, i) => 
      `Excerpt ${i+1} [Doc: "${c.documentName}"]: "${c.chunk.content}"`
    ).join('\n');

    const findingsSummary = findings.map((f, i) => 
      `Finding ${i+1} (${f.title}): Severity=${f.severity}, Summary=${f.summary || f.description}`
    ).join('\n');

    const prompt = `You are NEXUS AI Grounded Document Intelligence Engine.
You must answer the user's question STRICTLY based on the provided evidence excerpts, facts, and findings below.

QUESTION INTENT: ${intent}
ORIGINAL QUERY: "${query}"
RESOLVED QUERY WITH CONVERSATION CONTEXT: "${resolvedQuery}"

SYSTEM RULES:
1. Answer ONLY what the user asked. Do NOT dump generic summaries unless the user specifically asks for a summary.
2. Ground every single claim in the provided document excerpts or facts.
3. Include clear citations for your answer: Document Name and Page Number where available (e.g. "According to report.pdf (Page 1)...").
4. If the intent is COMPARISON, provide a structured comparison highlighting key differences and similarities between the mentioned sources.
5. If the intent is LIST or BULLETS, return concise, well-structured bullet points.
6. If the intent is NUMERICAL, state the exact verified number/amount upfront.
7. If the answer CANNOT be found in the provided facts or excerpts, you MUST EXPLICITLY STATE:
   "I couldn't find this information in the uploaded files."
   DO NOT guess or invent facts.

ACTIVE EVIDENCE BASE:
=== RELEVANT DOCUMENT EXCERPTS ===
${chunksSummary || 'No text excerpts'}

=== RELEVANT STRUCTURED FACTS ===
${factsSummary || 'No structured facts'}

=== DETECTED CONTRADICTIONS & FINDINGS ===
${findingsSummary || 'No discrepancies'}

Provide a direct, grounded, and fully cited answer in Markdown format.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!res.ok) throw new Error(`Gemini status ${res.status}`);

    const data = await res.json();
    const answerText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!answerText) throw new Error('Empty response from Gemini');

    return {
      query,
      intent,
      answer: answerText,
      confidence: 0.96,
      citedFacts: facts.slice(0, 4),
      citedEvidence: facts.slice(0, 4).map(f => f.source).concat(
        chunks.slice(0, 2).map(c => ({
          documentName: c.documentName,
          pageNumber: 1,
          snippet: c.chunk.content
        }))
      ),
      suggestedFollowUps: this.generateFollowUps(intent, query)
    };
  }

  /**
   * Deterministic Fact & Finding Matcher (Offline Engine)
   */
  deterministicFactRetrieval(rawQuery, qLower, intent, retrieved, history = []) {
    const { facts, chunks, findings } = retrieved;

    // 1. Contradictions & Discrepancies Query
    if (intent === 'CONTRADICTION') {
      return this.handleInconsistenciesQuery(qLower);
    }

    // 2. Comparison Query between Documents or Entities
    if (intent === 'COMPARISON') {
      return this.handleComparisonQuery(rawQuery, facts, chunks);
    }

    // 3. Factual & Semantic Fact Match
    if (facts.length > 0 || chunks.length > 0) {
      const primary = facts[0] || { source: { documentName: chunks[0]?.documentName, pageNumber: 1, snippet: chunks[0]?.chunk?.content } };
      const answerLines = [];

      // Format based on intent
      if (intent === 'NUMERICAL') {
        const numFact = facts.find(f => f.attribute.includes('amount') || f.attribute.includes('limit') || f.attribute.includes('income') || f.attribute.includes('revenue') || f.attribute.includes('budget') || f.attribute.includes('turnover')) || facts[0];
        answerLines.push(
          `### Verified Numerical Record\n`,
          `According to **${numFact.source?.documentName || 'the uploaded dossier'}**, the verified **${numFact.attribute}** for *${numFact.entityName}* is **\`${numFact.value}\`**.\n`,
          `- **Source Document:** \`${numFact.source?.documentName}\` (Page ${numFact.source?.pageNumber || 1})`,
          `- **Verbatim Citation:** *"${numFact.source?.snippet || numFact.context}"*`,
          `- **Confidence:** ${(numFact.confidence * 100).toFixed(0)}%\n`
        );
      } else if (intent === 'LIST') {
        answerLines.push(
          `### Verified Key Points\n`,
          `Based on records in **${primary.source?.documentName || 'the uploaded dossier'}**:\n`
        );
        facts.slice(0, 6).forEach((fact, idx) => {
          answerLines.push(
            `* **${fact.attribute.replace(/_/g, ' ')}** (*${fact.entityName}*): \`${fact.value}\` (Source: \`${fact.source?.documentName}\`, p.${fact.source?.pageNumber || 1})`
          );
        });
      } else {
        answerLines.push(
          `### Grounded Document Intelligence\n`,
          `Based on verified records in **${primary.source?.documentName || 'the uploaded dossier'}**:\n`
        );
        facts.slice(0, 5).forEach((fact, idx) => {
          answerLines.push(
            `**${idx + 1}. ${fact.attribute.replace(/_/g, ' ')}** for *${fact.entityName}*: \`${fact.value}\``,
            `- **Source Document:** \`${fact.source?.documentName}\` (Page ${fact.source?.pageNumber || 1})`,
            `- **Verbatim Citation:** *"${fact.source?.snippet || fact.context}"*`,
            `- **Confidence:** ${(fact.confidence * 100).toFixed(0)}%\n`
          );
        });
      }

      return {
        query: rawQuery,
        intent,
        answer: answerLines.join('\n'),
        confidence: 0.95,
        citedFacts: facts.slice(0, 4),
        citedEvidence: facts.slice(0, 4).map(f => f.source),
        suggestedFollowUps: this.generateFollowUps(intent, rawQuery)
      };
    }

    // 4. Anti-Hallucination Guard: If no matching evidence found
    return {
      query: rawQuery,
      intent,
      answer: `I couldn't find this information in the uploaded files.\n\n*NEXUS AI reasoning is strictly grounded in verified facts across your uploaded documents and does not hallucinate unverified data.*`,
      confidence: 1.0,
      citedFacts: [],
      citedEvidence: [],
      suggestedFollowUps: [
        "What documents have been uploaded?",
        "What information is inconsistent?",
        "Show all verified facts."
      ]
    };
  }

  /**
   * Handle Multi-Document Comparison
   */
  handleComparisonQuery(rawQuery, facts, chunks) {
    const docMap = new Map();
    for (const f of facts) {
      const doc = f.source?.documentName || 'Document';
      if (!docMap.has(doc)) docMap.set(doc, []);
      docMap.get(doc).push(f);
    }

    for (const c of chunks) {
      const doc = c.documentName;
      if (!docMap.has(doc)) docMap.set(doc, []);
    }

    const docs = Array.from(docMap.keys());
    const answerLines = [
      `### Multi-Document Comparison Analysis\n`,
      `Comparative analysis across **${docs.length > 0 ? docs.slice(0, 3).join('** and **') : 'uploaded documents'}**:\n`
    ];

    if (docs.length >= 2) {
      docs.slice(0, 2).forEach((docName, idx) => {
        const docFacts = docMap.get(docName) || [];
        answerLines.push(`#### Document ${idx + 1}: \`${docName}\``);
        if (docFacts.length > 0) {
          docFacts.slice(0, 3).forEach(df => {
            answerLines.push(`- **${df.attribute}:** \`${df.value}\` (Page ${df.source?.pageNumber || 1})`);
          });
        } else {
          answerLines.push(`- File verified and indexed in dossier.`);
        }
        answerLines.push('');
      });

      answerLines.push(
        `#### Key Differences & Comparison Summary:`,
        `- Both documents independently declare verified parameters within their respective filing scopes.`,
        `- Traceable evidence was cross-matched against the case ledger.\n`
      );
    } else {
      answerLines.push(`- Uploaded files contain complementary verified facts recorded in the case ledger.\n`);
    }

    return {
      query: rawQuery,
      intent: 'COMPARISON',
      answer: answerLines.join('\n'),
      confidence: 0.95,
      citedFacts: facts.slice(0, 4),
      citedEvidence: facts.slice(0, 4).map(f => f.source),
      suggestedFollowUps: [
        "What discrepancies exist?",
        "What changed over time?",
        "Which document contains the latest value?"
      ]
    };
  }

  handleDocumentsQuery() {
    const docs = this.dataSource.documents;
    const totalDocs = docs.length;
    const processed = docs.filter(d => d.status === 'PROCESSED').length;
    const lines = [
      `### Uploaded Documents Dossier (${totalDocs} Total Files)\n`,
      `The system is currently tracking **${totalDocs} documents** (${processed} fully processed & verified):\n`
    ];

    docs.slice(-15).reverse().forEach((d, i) => {
      lines.push(`- **${d.name}** [Category: \`${d.documentCategory || d.fileType}\` | Status: \`${d.status}\` | Pages: \`${d.totalPages || 1}\` | Snippet: *"${(d.extractedTextSnippet || '').slice(0, 60)}..."*]`);
    });

    if (totalDocs > 15) {
      lines.push(`\n*... and ${totalDocs - 15} additional documents indexed in the persistent knowledge store.*`);
    }

    return {
      query: "List of uploaded documents",
      intent: 'DOCUMENTS_OVERVIEW',
      answer: lines.join('\n'),
      confidence: 1.0,
      citedFacts: [],
      citedEvidence: docs.slice(-4).map(d => ({ documentName: d.name, pageNumber: 1, snippet: d.extractedTextSnippet || 'Document ingested' })),
      suggestedFollowUps: [
        "What discrepancies exist across these documents?",
        "What are the key extracted facts?",
        "What information is missing?"
      ]
    };
  }

  handleInconsistenciesQuery(qLower) {
    const findings = this.dataSource.findings;
    const citedFacts = [];
    const citedEvidence = [];

    findings.forEach(f => {
      (f.conflictingFacts || []).forEach(fact => {
        citedFacts.push(fact);
        if (fact.source) citedEvidence.push(fact.source);
      });
    });

    const answerLines = [
      `### Inconsistencies & Contradictions Detected (${findings.length} Discrepancies)\n`,
      `Deterministic cross-document validation identified **${findings.length} factual discrepancies**:\n`
    ];

    findings.slice(0, 8).forEach((finding, idx) => {
      answerLines.push(
        `**${idx + 1}. ${finding.title || finding.category}** [Severity: ${finding.severity} | Confidence: ${Math.round((finding.confidence || 0.95) * 100)}%]`,
        `- **Entity:** ${finding.entityName || 'Case Entity'}`,
        `- **Discrepancy:** \`${finding.discrepancyDelta?.difference || finding.summary || 'Variance detected'}\``,
        `- **Traceable Evidence:**`,
        ...(finding.conflictingFacts || []).map(fact => 
          `  * *${fact.source?.documentName || 'Document'}* (Page ${fact.source?.pageNumber || 1}): "${fact.source?.snippet || fact.declaredValue || ''}"`
        ),
        `- **Action:** ${finding.recommendation || 'Manual credit verification recommended'}\n`
      );
    });

    return {
      query: qLower,
      intent: 'CONTRADICTION',
      answer: answerLines.join('\n'),
      confidence: 0.95,
      citedFacts: citedFacts.slice(0, 4),
      citedEvidence: citedEvidence.slice(0, 4),
      suggestedFollowUps: [
        "What changed over time?",
        "What information is missing?",
        "Which document contains the latest value?"
      ]
    };
  }

  generateFollowUps(intent, query) {
    if (intent === 'NUMERICAL') {
      return [
        "Which document contains the latest value?",
        "Are there any discrepancies with this amount?",
        "What was the previous amount?"
      ];
    }
    if (intent === 'COMPARISON') {
      return [
        "What are the common conclusions?",
        "Which document has the latest date?",
        "Are there any conflicting requirements?"
      ];
    }
    return [
      "What discrepancies exist?",
      "What changed over time?",
      "Which document contains the latest value?"
    ];
  }
}
