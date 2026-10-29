/**
 * NEXUS AI — Local Model Stack & Hardware-Aware Configuration
 * Optimized for Windows (16 GB RAM / 4 GB VRAM)
 */

import dotenv from 'dotenv';
dotenv.config();

export const ModelConfig = {
  // Local Ollama Runtime Endpoint (supports OLLAMA_BASE_URL or OLLAMA_HOST alias)
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || process.env.OLLAMA_HOST || 'http://127.0.0.1:11434',

  // Primary Reasoning Model (Qwen2.5-3B default for 4GB VRAM / 16GB RAM; configurable via OLLAMA_MODEL or OLLAMA_PRIMARY_MODEL alias)
  primaryModel: process.env.OLLAMA_MODEL || process.env.OLLAMA_PRIMARY_MODEL || 'qwen2.5:3b',
  // Fallback Tiers: tinyllama (instant offline fallback) or qwen2.5:0.5b / qwen2.5:7b
  fallbackModel: process.env.OLLAMA_FALLBACK_MODEL || 'tinyllama',

  // Secondary Verification Model
  verifierModel: process.env.OLLAMA_VERIFIER_MODEL || process.env.OLLAMA_MODEL || 'qwen2.5:3b',

  // Dedicated Embedding Model (preserves separate embedding pipeline)
  embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',

  // Context window size (16K default for long documents, avoids silent truncation)
  numCtx: parseInt(process.env.OLLAMA_NUM_CTX || '16384', 10),

  // Temperature configuration per task
  temperatureExtraction: parseFloat(process.env.OLLAMA_TEMP_EXTRACTION || '0.1'),
  temperatureReasoning: parseFloat(process.env.OLLAMA_TEMP_REASONING || '0.2'),
  temperatureReport: parseFloat(process.env.OLLAMA_TEMP_REPORT || '0.4'),
  temperatureVerifier: parseFloat(process.env.OLLAMA_TEMP_VERIFIER || '0.0'),

  // Vector Database Endpoint (ChromaDB)
  chromaUrl: process.env.CHROMA_URL || 'http://127.0.0.1:8000',
  chromaCollection: process.env.CHROMA_COLLECTION || 'nexus_documents',

  // Hardware Safety Constraints
  maxContextChunks: parseInt(process.env.MAX_CONTEXT_CHUNKS || '6', 10),
  inferenceTimeoutMs: parseInt(process.env.INFERENCE_TIMEOUT_MS || '35000', 10),
  sequentialInference: true, // NEVER load 14B and 12B simultaneously
  localOnly: process.env.LOCAL_ONLY !== 'false', // Default strictly local

  // Verification Thresholds
  enableVerifierForComplexQueriesOnly: true,
  verificationConfidenceThreshold: 0.75
};
