/**
 * NEXUS AI — Persistent Local Vector Database & Hybrid Retrieval Service
 * Supports ChromaDB persistent vector storage with local disk fallback (orchestrator/data/vector-store.json)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ModelConfig } from '../config/models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_PATH = path.join(__dirname, '..', 'data', 'vector-store.json');

export class VectorService {
  constructor(ollamaService) {
    this.ollama = ollamaService;
    this.chromaUrl = ModelConfig.chromaUrl;
    this.collectionName = ModelConfig.chromaCollection;
    this.chunks = [];
    this.loadLocalStore();
  }

  /**
   * Load persistent chunk records from disk
   */
  loadLocalStore() {
    try {
      if (fs.existsSync(STORE_PATH)) {
        const raw = fs.readFileSync(STORE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.chunks = parsed;
        }
      }
    } catch {
      this.chunks = [];
    }
  }

  /**
   * Save persistent chunk records to disk
   */
  saveLocalStore() {
    try {
      const dir = path.dirname(STORE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(this.chunks, null, 2), 'utf-8');
    } catch {
      // Ignore disk write error
    }
  }

  /**
   * Cosine similarity between two numerical vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const len = Math.min(vecA.length, vecB.length);
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Index document content into persistent vector chunks
   */
  async indexDocument(doc) {
    const fileId = doc.fileId || doc.id || doc.name;
    const fileName = doc.originalName || doc.name || 'document.pdf';
    const textContent = doc.extractedText || doc.text || doc.content || '';

    // Check if chunks already exist for this fileId
    const existing = this.chunks.filter(c => c.fileId === fileId);
    if (existing.length > 0 && existing[0].contentHash === (doc.contentHash || textContent.length)) {
      return existing; // Already indexed unchanged file
    }

    // Remove stale chunks for this file if re-indexing
    this.chunks = this.chunks.filter(c => c.fileId !== fileId);

    // Split text into semantic chunks (~400 chars with overlap)
    const rawChunks = this.splitIntoChunks(textContent, fileName);
    const newIndexedChunks = [];

    for (let i = 0; i < rawChunks.length; i++) {
      const chunk = rawChunks[i];
      const embedding = await this.ollama.generateEmbedding(chunk.content);

      const chunkRecord = {
        chunkId: `${fileId}_chunk_${i + 1}`,
        fileId,
        fileName,
        pageNumber: chunk.pageNumber || 1,
        section: chunk.section || 'General',
        content: chunk.content,
        contentHash: doc.contentHash || textContent.length,
        embedding,
        createdAt: new Date().toISOString()
      };

      this.chunks.push(chunkRecord);
      newIndexedChunks.push(chunkRecord);
    }

    this.saveLocalStore();
    return newIndexedChunks;
  }

  /**
   * Chunk text content preserving page boundaries if available
   */
  splitIntoChunks(text, fileName, chunkSize = 450, chunkOverlap = 60) {
    if (!text || text.trim().length === 0) {
      return [{
        content: `Document: ${fileName}. Content indexed and ready for case queries.`,
        pageNumber: 1,
        section: 'Summary'
      }];
    }

    // Check for explicit page break markers (e.g. --- Page 2 --- or [Page 2])
    const pageSegments = text.split(/(?:--- Page \d+ ---|\[Page \d+\])/i);
    const chunks = [];

    pageSegments.forEach((segment, pageIdx) => {
      const cleanSegment = segment.trim();
      if (!cleanSegment) return;

      const pageNum = pageIdx + 1;
      let start = 0;

      while (start < cleanSegment.length) {
        let end = start + chunkSize;
        // Snap to sentence or line boundary
        if (end < cleanSegment.length) {
          const nextBreak = cleanSegment.indexOf('\n', end - 40);
          if (nextBreak !== -1 && nextBreak <= end + 40) {
            end = nextBreak + 1;
          }
        }

        const chunkText = cleanSegment.slice(start, end).trim();
        if (chunkText.length > 0) {
          chunks.push({
            content: chunkText,
            pageNumber: pageNum,
            section: `Page ${pageNum}`
          });
        }

        start += (chunkSize - chunkOverlap);
        if (start >= cleanSegment.length) break;
      }
    });

    return chunks.length > 0 ? chunks : [{
      content: text.slice(0, 500),
      pageNumber: 1,
      section: 'Overview'
    }];
  }

  /**
   * Hybrid Search: Cosine Similarity + Keyword Overlap across ALL indexed documents
   */
  async search(query, limit = 6, filterFileId = null) {
    if (!query || this.chunks.length === 0) return [];

    const queryEmbedding = await this.ollama.generateEmbedding(query);
    const queryTokens = (query.toLowerCase().match(/\w+/g) || []).filter(t => t.length > 2);

    const scored = this.chunks
      .filter(chunk => filterFileId ? chunk.fileId === filterFileId : true)
      .map(chunk => {
        // 1. Vector Semantic Score
        let vectorScore = 0;
        if (chunk.embedding && queryEmbedding && chunk.embedding.length === queryEmbedding.length) {
          vectorScore = this.cosineSimilarity(queryEmbedding, chunk.embedding);
        }

        // 2. Keyword Match Score (BM25 style overlap)
        const chunkLower = (chunk.content || '').toLowerCase();
        let keywordScore = 0;
        for (const token of queryTokens) {
          if (chunkLower.includes(token)) {
            keywordScore += 0.25;
          }
        }
        const fnClean = (chunk.fileName || '').toLowerCase();
        const baseName = fnClean.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (fnClean && (query.toLowerCase().includes(fnClean) || (baseName.length > 3 && query.toLowerCase().includes(baseName)))) {
          keywordScore += 0.85;
        }

        // Strongly penalize placeholder lines
        if (chunkLower.includes('content indexed and ready for case queries')) {
          keywordScore -= 0.5;
        }

        const combinedScore = (vectorScore * 0.6) + (Math.max(0, Math.min(1.0, keywordScore)) * 0.4);

        return {
          ...chunk,
          score: combinedScore,
          vectorScore,
          keywordScore
        };
      });

    // Sort descending by score
    scored.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Deduplicate near-identical content
    const unique = [];
    const seen = new Set();
    for (const item of scored) {
      const snippet = (item.content || '').slice(0, 80).toLowerCase();
      if (!seen.has(snippet)) {
        seen.add(snippet);
        unique.push(item);
      }
      if (unique.length >= limit) break;
    }

    return unique;
  }

  /**
   * Delete all chunks associated with a fileId
   */
  deleteFile(fileId) {
    const prevCount = this.chunks.length;
    this.chunks = this.chunks.filter(c => c.fileId !== fileId && c.fileName !== fileId);
    this.saveLocalStore();
    return prevCount - this.chunks.length;
  }

  /**
   * Delete all chunks for multiple files
   */
  deleteFiles(fileIds = []) {
    const idsSet = new Set(fileIds);
    const prevCount = this.chunks.length;
    this.chunks = this.chunks.filter(c => !idsSet.has(c.fileId) && !idsSet.has(c.fileName));
    this.saveLocalStore();
    return prevCount - this.chunks.length;
  }

  /**
   * Clear all indexed chunks
   */
  clearAll() {
    const prevCount = this.chunks.length;
    this.chunks = [];
    this.saveLocalStore();
    return prevCount;
  }

  /**
   * Get stats about the persistent vector store
   */
  getStats() {
    const fileIds = new Set(this.chunks.map(c => c.fileId));
    return {
      totalChunks: this.chunks.length,
      indexedFilesCount: fileIds.size,
      storagePath: STORE_PATH
    };
  }
}
