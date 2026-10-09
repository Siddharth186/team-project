/**
 * NEXUS AI — AGENT 2: RESEARCH & RETRIEVAL AGENT
 * Responsibilities:
 *  - Search entire document index across ALL uploaded files (not limited to first 4)
 *  - Combine semantic vector retrieval with keyword scoring
 *  - Deduplicate passages and preserve file + page metadata
 *  - Detect evidence sufficiency and evidence gaps
 */

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
    const stopWords = new Set(['the', 'is', 'are', 'what', 'which', 'who', 'where', 'how', 'why', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'a', 'an', 'this', 'that', 'from', 'with', 'document', 'documents', 'file', 'files', 'please', 'tell', 'show', 'give']);
    const queryTokens = (q.match(/\w+/g) || []).filter(t => t.length > 2 && !stopWords.has(t));

    // 1. Retrieve from persistent vector store (all indexed chunks)
    const vectorResults = await this.vectorService.search(query, limit);

    // 2. Retrieve from structured facts in case data
    const factMatches = [];
    const allFacts = this.dataSource?.facts || [];
    for (const fact of allFacts) {
      const rawVal = String(fact.normalized_value || fact.value || fact.raw_value || '');
      if (rawVal.includes(';base64,') || rawVal.startsWith('JVBERi0') || rawVal.length > 2000) continue;

      const attr = (fact.attribute || fact.field_name || fact.field || '').toLowerCase();
      const factText = `${attr} ${rawVal} ${fact.source_file || fact.source?.documentName || ''}`.toLowerCase();
      let matchCount = 0;
      for (const token of queryTokens) {
        if (factText.includes(token)) matchCount++;
      }
      const sourceDoc = fact.source?.documentName || fact.source_file || '';
      const hasExplicitFileMention = sourceDoc && sourceDoc.includes('.') && q.includes(sourceDoc.toLowerCase());
      
      if (matchCount > 0 || hasExplicitFileMention) {
        let label = (fact.attribute || fact.field_name || 'Detail').replace(/_/g, ' ');
        label = label.charAt(0).toUpperCase() + label.slice(1);
        factMatches.push({
          chunkId: `fact_${fact.fact_id || fact.id || Math.random()}`,
          fileId: sourceDoc || 'document',
          fileName: sourceDoc || 'document',
          pageNumber: fact.source?.pageNumber || fact.source_page || 1,
          section: label,
          content: rawVal,
          score: (matchCount * 2.5) + (hasExplicitFileMention ? 3.5 : 0),
          isStructuredFact: true
        });
      }
    }

    // 2.5 Retrieve from indexed document inventory (lowest priority fallback)
    const allDocs = this.dataSource?.documents || [];
    for (const doc of allDocs) {
      const docName = (doc.name || doc.filename || '').toLowerCase();
      const rawTokens = (docName.match(/[a-z0-9]+/g) || []).filter(t => t.length > 2);
      const matchCount = queryTokens.filter(t => docName.includes(t)).length;
      const cleanDocBase = docName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      const hasDirectMatch = q.includes(docName) || (cleanDocBase.length > 3 && q.includes(cleanDocBase)) || (rawTokens.length > 0 && matchCount >= Math.min(2, rawTokens.length));

      if (hasDirectMatch) {
        factMatches.push({
          chunkId: `doc_${doc.id || doc.name}`,
          fileId: doc.name,
          fileName: doc.name,
          pageNumber: 1,
          section: 'Document Metadata',
          content: `Document: ${doc.name} (Category: ${doc.documentCategory || doc.category || 'General'}, Pages: ${doc.totalPages || 1}, Status: ${doc.status || 'PROCESSED'}).`,
          score: 0.3,
          isDocumentRecord: true
        });
      }
    }

    // 3. Filter vector results to ensure at least some query token overlap if query had specific keywords
    const filteredVectorResults = vectorResults.filter(chunk => {
      if ((chunk.content || '').includes('Content indexed and ready for case queries')) return false;
      if (queryTokens.length === 0) return true;
      const cText = (chunk.content || '').toLowerCase();
      const fnText = (chunk.fileName || '').toLowerCase();
      const hasAnyToken = queryTokens.some(t => cText.includes(t) || fnText.includes(t));
      return hasAnyToken || (chunk.vectorScore || 0) >= 0.75;
    });

    // 4. Combine and rank evidence
    let combined = [...filteredVectorResults, ...factMatches];

    // If query explicitly mentions specific documents, strictly prioritize those documents
    const mentionedDocNames = (this.dataSource?.documents || [])
      .map(d => d.name || '')
      .filter(name => {
        const cleanName = name.toLowerCase();
        const cleanBase = cleanName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        return q.includes(cleanName) || (cleanBase.length > 3 && q.includes(cleanBase));
      });

    if (mentionedDocNames.length > 0) {
      const targetDocSet = new Set(mentionedDocNames.map(n => n.toLowerCase()));
      const targetedEvidence = combined.filter(item => {
        const fn = (item.fileName || item.fileId || '').toLowerCase();
        return targetDocSet.has(fn) || mentionedDocNames.some(m => fn.includes(m.toLowerCase()));
      });
      if (targetedEvidence.length > 0) {
        combined = targetedEvidence;
      }
    }

    // Boost rich structural/program/aim/algorithm chunks over repetitive short lines
    combined.forEach(item => {
      const c = (item.content || '').toLowerCase();
      if (c.includes('aim:') || c.includes('algorithm:') || c.includes('program:') || c.includes('result:') || c.includes('implementation') || c.includes('socket')) {
        item.score = (item.score || 1.0) + 3.5;
      }
    });

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

    // Check evidence sufficiency
    const totalEvidenceScore = deduplicated.reduce((sum, item) => sum + (item.score || 0), 0);
    const hasTokenOverlap = queryTokens.length === 0 || deduplicated.some(item => {
      const txt = `${item.fileName || ''} ${item.content || ''}`.toLowerCase();
      return queryTokens.some(t => txt.includes(t));
    });
    const hasSufficientEvidence = deduplicated.length > 0 && totalEvidenceScore >= 0.3 && hasTokenOverlap;

    return {
      query,
      evidence: deduplicated,
      distinctSources: Array.from(new Set(deduplicated.map(d => d.fileName || d.fileId).filter(Boolean))),
      totalSourcesCount: this.dataSource?.documents?.length || 0,
      hasSufficientEvidence,
      totalScore: totalEvidenceScore
    };
  }
}
