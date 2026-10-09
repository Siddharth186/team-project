/**
 * NEXUS AI — Local Model Stack & Hardware-Aware Configuration
 * Optimized for Windows (16 GB RAM / 4 GB VRAM)
 */

import dotenv from 'dotenv';
dotenv.config();

export const ModelConfig = {
  // Local Ollama Runtime Endpoint
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434',

  // Primary Reasoning Model (qwen2.5:3b / qwen3:8b)
  primaryModel: process.env.OLLAMA_PRIMARY_MODEL || 'qwen2.5:3b',
  fallbackModel: process.env.OLLAMA_FALLBACK_MODEL || 'qwen2.5:3b',

  // Secondary Verification Model (qwen2.5:3b / gemma3:12b)
  verifierModel: process.env.OLLAMA_VERIFIER_MODEL || 'qwen2.5:3b',

  // Embedding Model (Nomic Embed Text)
  embeddingModel: process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text',

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
