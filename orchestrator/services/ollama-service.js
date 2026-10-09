/**
 * NEXUS AI — Local Ollama Model Runtime Service
 * Manages local model lifecycle, embeddings, sequential inference queue, and health checks.
 */

import net from 'net';
import { ModelConfig } from '../config/models.js';

export class OllamaService {
  constructor() {
    this.baseUrl = ModelConfig.ollamaBaseUrl;
    this.primaryModel = ModelConfig.primaryModel;
    this.fallbackModel = ModelConfig.fallbackModel;
    this.verifierModel = ModelConfig.verifierModel;
    this.embeddingModel = ModelConfig.embeddingModel;
    this.embeddingCache = new Map();

    // Mutex lock to enforce sequential inference on 4GB VRAM
    this.inferenceLock = Promise.resolve();
    this.isOnline = false;
    this.lastCheck = 0;
  }

  /**
   * Instant non-blocking port reachability check using net.Socket (cached for 15s)
   */
  async isReachable() {
    const now = Date.now();
    if (now - this.lastCheck < 15000) {
      return this.isOnline;
    }
    this.lastCheck = now;

    return new Promise((resolve) => {
      const url = new URL(this.baseUrl);
      const port = parseInt(url.port || '11434', 10);
      const host = url.hostname || '127.0.0.1';

      const socket = new net.Socket();
      socket.setTimeout(250);

      socket.on('connect', () => {
        this.isOnline = true;
        socket.destroy();
        resolve(true);
      });
      socket.on('timeout', () => {
        this.isOnline = false;
        socket.destroy();
        resolve(false);
      });
      socket.on('error', () => {
        this.isOnline = false;
        socket.destroy();
        resolve(false);
      });
      socket.connect(port, host);
    });
  }

  /**
   * Acquire sequential inference lock to prevent GPU VRAM exhaustion
   */
  async acquireLock(fn) {
    const next = this.inferenceLock.then(() => fn()).catch(err => {
      throw err;
    });
    this.inferenceLock = next.then(() => {}, () => {});
    return next;
  }

  /**
   * Check Ollama availability and installed models
   */
  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (!res.ok) {
        return {
          running: false,
          error: `Ollama returned HTTP ${res.status}`,
          installedModels: []
        };
      }

      const data = await res.json();
      const modelNames = (data.models || []).map(m => m.name.toLowerCase());

      const hasPrimary = modelNames.some(m => m.includes(this.primaryModel.toLowerCase().split(':')[0]));
      const hasFallback = modelNames.some(m => m.includes(this.fallbackModel.toLowerCase().split(':')[0]));
      const hasVerifier = modelNames.some(m => m.includes(this.verifierModel.toLowerCase().split(':')[0]));
      const hasEmbedding = modelNames.some(m => m.includes(this.embeddingModel.toLowerCase().split(':')[0]));

      return {
        running: true,
        installedModels: (data.models || []).map(m => ({ name: m.name, size: m.size })),
        configured: {
          primary: this.primaryModel,
          fallback: this.fallbackModel,
          verifier: this.verifierModel,
          embedding: this.embeddingModel
        },
        readiness: {
          hasPrimary,
          hasFallback,
          hasVerifier,
          hasEmbedding,
          isOperational: hasPrimary || hasFallback
        }
      };
    } catch (err) {
      return {
        running: false,
        error: err.name === 'AbortError' ? 'Connection timed out' : err.message,
        installedModels: [],
        readiness: {
          hasPrimary: false,
          hasFallback: false,
          hasVerifier: false,
          hasEmbedding: false,
          isOperational: false
        }
      };
    }
  }

  /**
   * Generate vector embedding for text using nomic-embed-text
   */
  async generateEmbedding(text) {
    if (!text || typeof text !== 'string') return [];
    
    // Check in-memory cache
    const cacheKey = text.trim();
    if (this.embeddingCache.has(cacheKey)) {
      return this.embeddingCache.get(cacheKey);
    }

    if (await this.isReachable()) {
      try {
        const res = await fetch(`${this.baseUrl}/api/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.embeddingModel,
            prompt: text
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.embedding && Array.isArray(data.embedding)) {
            // Bounded cache (keep up to 1000 items)
            if (this.embeddingCache.size >= 1000) {
              const firstKey = this.embeddingCache.keys().next().value;
              if (firstKey) this.embeddingCache.delete(firstKey);
            }
            this.embeddingCache.set(cacheKey, data.embedding);
            return data.embedding;
          }
        }
      } catch {
        // Fall through to deterministic word frequency vector fallback
      }
    }

    // Resilient fallback embedding if Ollama embedding model is offline
    const fallbackVector = this.computeDeterministicVector(text);
    return fallbackVector;
  }

  /**
   * Deterministic 64-dimension token hash embedding fallback
   */
  computeDeterministicVector(text, dimensions = 64) {
    const vector = new Array(dimensions).fill(0);
    const tokens = text.toLowerCase().match(/\w+/g) || [];
    if (tokens.length === 0) return vector;

    for (const token of tokens) {
      let hash = 0;
      for (let i = 0; i < token.length; i++) {
        hash = (hash << 5) - hash + token.charCodeAt(i);
        hash |= 0;
      }
      const idx = Math.abs(hash) % dimensions;
      vector[idx] += 1;
    }

    // L2 Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map(v => v / magnitude);
  }

  /**
   * Generate reasoning chat completion with primary model (and fallback)
   */
  async generateChat(messages, options = {}) {
    if (!await this.isReachable()) {
      return { content: null, success: false, error: 'Ollama is offline.' };
    }
    return this.acquireLock(async () => {
      const selectedModel = options.model || this.primaryModel;
      const timeoutMs = options.timeoutMs || ModelConfig.inferenceTimeoutMs;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        const res = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            messages,
            stream: false,
            options: {
              temperature: options.temperature || 0.1,
              num_ctx: options.numCtx || 4096
            }
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          return {
            content: data.message?.content || '',
            modelUsed: selectedModel,
            success: true
          };
        }
      } catch (err) {
        // If primary model failed and fallback is configured differently, try fallback model
        if (selectedModel !== this.fallbackModel) {
          try {
            const fbRes = await fetch(`${this.baseUrl}/api/chat`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                model: this.fallbackModel,
                messages,
                stream: false,
                options: { temperature: 0.1, num_ctx: 2048 }
              })
            });
            if (fbRes.ok) {
              const fbData = await fbRes.json();
              return {
                content: fbData.message?.content || '',
                modelUsed: this.fallbackModel,
                success: true
              };
            }
          } catch {
            // Fallback also failed
          }
        }
      }

      return {
        content: null,
        success: false,
        error: `Local model ${selectedModel} is not running or timed out.`
      };
    });
  }

  /**
   * Generate verification with secondary model (Gemma 3 12B)
   */
  async generateVerification(prompt, options = {}) {
    if (!await this.isReachable()) {
      return { content: null, success: false, error: 'Ollama verifier offline.' };
    }
    return this.acquireLock(async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 25000);

        const res = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.verifierModel,
            messages: [
              { role: 'system', content: 'You are an objective document verification agent. Verify whether the provided answer is strictly supported by the retrieved document evidence.' },
              { role: 'user', content: prompt }
            ],
            stream: false,
            options: { temperature: 0.0, num_ctx: 2048 }
          }),
          signal: controller.signal
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = await res.json();
          return {
            content: data.message?.content || '',
            modelUsed: this.verifierModel,
            success: true
          };
        }
      } catch {
        // Verifier unavailable
      }

      return {
        content: null,
        success: false,
        error: `Verifier model ${this.verifierModel} unavailable.`
      };
    });
  }
}
