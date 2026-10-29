/**
 * NEXUS AI — AGENT 2: RESEARCH & RETRIEVAL AGENT
 * Responsibilities:
 *  - Search entire document index across ALL uploaded files
 *  - Combine semantic vector retrieval with intelligent keyword & fuzzy scoring
 *  - Handle technical typos (e.g., 'serverlet' -> 'servlet') and conversational queries
 *  - Deduplicate passages and preserve file + page metadata
 *  - Detect evidence sufficiency and evidence gaps with strict anti-hallucination guard
 */

function normalizeTerm(term) {
  if (!term || typeof term !== 'string') return '';
  let s = term.toLowerCase().trim();
  // Common phonetic / typo corrections in technical queries
  s = s.replace(/serverlet/g, 'servlet')
       .replace(/databse/g, 'database')
       .replace(/conect/g, 'connect')
       .replace(/conection/g, 'connection')
       .replace(/properti/g, 'props');
  // Stemming (simple English suffixes)
  if (s.endsWith('ies')) s = s.slice(0, -3) + 'y';
  else if (s.endsWith('es') && !s.endsWith('yes')) s = s.slice(0, -2);
  else if (s.endsWith('s') && !s.endsWith('ss')) s = s.slice(0, -1);
  return s;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
}

export class ResearchAgent {
  constructor(vectorService, dataSource) {
    this.vectorService = vectorService;
    this.dataSource = dataSource;
  }

  /**
   * Search across all files, chunks, facts, and findings
   */
  async retrieve(query, limit = 8) {
    const q = (query || '').toLowerCase().trim();

    // Comprehensive conversational & formatting stopwords
    const conversationalStopWords = new Set([
      'the', 'is', 'are', 'what', 'which', 'who', 'where', 'how', 'why',
      'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'a', 'an', 'this',
      'that', 'from', 'with', 'document', 'documents', 'file', 'files',
      'please', 'tell', 'show', 'give', 'about', 'format', 'given',
      'pdfs', 'pdf', 'analysing', 'analyzing', 'analyze', 'me', 'it', 'by',
      'can', 'you', 'explain', 'details', 'find', 'get', 'see', 'look'
    ]);

    const rawTokens = (q.match(/\w+/g) || []).filter(t => t.length > 2);
    // Topical tokens (stripped of conversational filler)
    const topicalTokens = rawTokens.filter(t => !conversationalStopWords.has(t));
    const normTokens = topicalTokens.map(normalizeTerm);

    // 1. Detect target documents by title match (exact or fuzzy)
    const allDocs = this.dataSource?.documents || [];
    const highPriorityDocNames = new Set();

    allDocs.forEach(doc => {
      const docNameLower = (doc.name || doc.filename || '').toLowerCase();
      const docTokens = (docNameLower.match(/[a-z0-9]+/g) || []).map(normalizeTerm);
      
      // Direct string containment for full document base name
      const baseClean = docNameLower.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      if (q.includes(docNameLower) || (baseClean.length > 4 && q.includes(baseClean))) {
        highPriorityDocNames.add(doc.name);
      }

      // Normalized & exact/fuzzy token match (require length >= 4)
      normTokens.forEach(qt => {
        if (qt.length < 4) return;
        docTokens.forEach(dt => {
          if (dt === qt) {
            highPriorityDocNames.add(doc.name);
          } else if (qt.length >= 6 && dt.length >= 6 && levenshtein(qt, dt) <= 1) {
            highPriorityDocNames.add(doc.name);
          }
        });
      });
    });

    // 2. Retrieve from persistent vector store (all indexed chunks)
    const expandedQuery = `${query} ${normTokens.join(' ')}`;
    const vectorResults = await this.vectorService.search(expandedQuery, limit * 2);

    // 3. Score chunks with high priority for matched document & code keywords
    const candidateChunks = [];
    
    // Also include direct chunks from high priority documents if not already in vector results
    if (highPriorityDocNames.size > 0) {
      allDocs.filter(d => highPriorityDocNames.has(d.name)).forEach(doc => {
        const chunks = doc.chunks || [];
        chunks.forEach((chunk, cIdx) => {
          candidateChunks.push({
            chunkId: `${doc.name}_chk_${cIdx + 1}`,
            fileId: doc.name,
            fileName: doc.name,
            pageNumber: chunk.pageNumber || 1,
            section: chunk.section || `Page ${chunk.pageNumber || 1}`,
            content: chunk.content,
            score: 8.0,
            isDocumentRecord: false
          });
        });
      });
    }

    // Merge vector results into candidate pool
    vectorResults.forEach(v => candidateChunks.push(v));

    // 4. Retrieve from structured facts in case data
    const factMatches = [];
    const allFacts = this.dataSource?.facts || [];
    for (const fact of allFacts) {
      const rawVal = String(fact.normalized_value || fact.value || fact.raw_value || '');
      if (rawVal.includes(';base64,') || rawVal.startsWith('JVBERi0') || rawVal.length > 2000) continue;

      const attr = (fact.attribute || fact.field_name || fact.field || '').toLowerCase();
      const factText = `${attr} ${rawVal} ${fact.source_file || fact.source?.documentName || ''}`.toLowerCase();
      const sourceDoc = fact.source?.documentName || fact.source_file || '';
      
      let matchCount = 0;
      for (const token of normTokens) {
        if (factText.includes(token)) matchCount++;
      }
      
      const isTargetDoc = highPriorityDocNames.has(sourceDoc);
      if (matchCount > 0 || isTargetDoc) {
        let label = (fact.attribute || fact.field_name || 'Detail').replace(/_/g, ' ');
        label = label.charAt(0).toUpperCase() + label.slice(1);
        factMatches.push({
          chunkId: `fact_${fact.fact_id || fact.id || Math.random()}`,
          fileId: sourceDoc || 'document',
          fileName: sourceDoc || 'document',
          pageNumber: fact.source?.pageNumber || fact.source_page || 1,
          section: label,
          content: rawVal,
          score: (matchCount * 3.0) + (isTargetDoc ? 6.0 : 0),
          isStructuredFact: true
        });
      }
    }

    // 5. Score and filter chunks
    const scoredChunks = candidateChunks.map(chunk => {
      const contentLower = (chunk.content || '').toLowerCase();
      const fileLower = (chunk.fileName || '').toLowerCase();
      let score = chunk.score || 1.0;

      // Boost if in high priority target document
      if (highPriorityDocNames.has(chunk.fileName) || highPriorityDocNames.has(chunk.fileId)) {
        score += 8.0;
      }

      // Match against normalized topical query tokens
      normTokens.forEach(token => {
        if (contentLower.includes(token) || fileLower.includes(token)) {
          score += 3.5;
        }
      });

      // Boost rich technical / structural / implementation / code chunks
      if (contentLower.includes('example') || contentLower.includes('public class') || contentLower.includes('doget') || contentLower.includes('dopost') || contentLower.includes('httpservlet') || contentLower.includes('class.forname')) {
        score += 5.0;
      }
      if (contentLower.includes('init(') || contentLower.includes('service(') || contentLower.includes('destroy(') || contentLower.includes('getparameter') || contentLower.includes('cookie')) {
        score += 4.0;
      }
      if (contentLower.includes('aim:') || contentLower.includes('algorithm:') || contentLower.includes('program:') || contentLower.includes('result:')) {
        score += 3.5;
      }

      return { ...chunk, score };
    });

    // 6. Combine and rank evidence
    let combined = [...scoredChunks, ...factMatches];
    combined.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Deduplicate by content prefix
    const deduplicated = [];
    const seen = new Set();

    for (const item of combined) {
      const fileName = item.fileName || item.fileId || 'document';
      const content = item.content || '';
      const key = `${fileName}_${content.slice(0, 60).toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(item);
      }
      if (deduplicated.length >= limit) break;
    }

    // 7. Evidence Sufficiency & Anti-Hallucination Guardrail Check
    const totalEvidenceScore = deduplicated.reduce((sum, item) => sum + (item.score || 0), 0);
    
    // Generic attribute words that are not domain-distinctive
    const genericWords = new Set(['number', 'total', 'value', 'date', 'data', 'name', 'type', 'list', 'form', 'info', 'information', 'records']);
    const distinctiveTokens = normTokens.filter(t => !genericWords.has(t));

    // Check if any topical token matched across the deduplicated chunks
    const matchedTopicalTokensCount = normTokens.filter(t => 
      deduplicated.some(item => ((item.fileName || '') + ' ' + (item.content || '')).toLowerCase().includes(t))
    ).length;

    const matchedDistinctiveCount = distinctiveTokens.filter(t => 
      deduplicated.some(item => ((item.fileName || '') + ' ' + (item.content || '')).toLowerCase().includes(t))
    ).length;

    const hasTargetDocMatch = highPriorityDocNames.size > 0 && deduplicated.some(item => highPriorityDocNames.has(item.fileName));
    const tokenMatchRatio = normTokens.length > 0 ? (matchedTopicalTokensCount / normTokens.length) : 1;
    
    // In order to be sufficient:
    // If query has distinctive terms (e.g. 'aircraft', 'satellite', 'nuclear', 'mars'),
    // at least one distinctive term MUST match, or a target doc must match.
    const distinctiveSatisfied = distinctiveTokens.length === 0 || matchedDistinctiveCount >= Math.min(2, Math.ceil(distinctiveTokens.length * 0.4)) || hasTargetDocMatch;

    const hasSufficientEvidence = deduplicated.length > 0 && distinctiveSatisfied && (
      hasTargetDocMatch ||
      (matchedTopicalTokensCount > 0 && (normTokens.length <= 2 || tokenMatchRatio >= 0.35) && totalEvidenceScore >= 1.5) ||
      (normTokens.length === 0 && totalEvidenceScore >= 0.5)
    );

    return {
      query,
      evidence: deduplicated,
      distinctSources: Array.from(new Set(deduplicated.map(d => d.fileName || d.fileId).filter(Boolean))),
      totalSourcesCount: this.dataSource?.documents?.length || 0,
      hasSufficientEvidence,
      totalScore: totalEvidenceScore,
      targetDocs: Array.from(highPriorityDocNames)
    };
  }
}
