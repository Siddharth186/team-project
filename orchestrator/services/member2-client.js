/**
 * NEXUS AI — MEMBER 2 INTEGRATION CLIENT & ADAPTER
 * 
 * Communicates with Member 2 (Facts, Contradictions, Evidence, Confidence Engine).
 * Gracefully switches between:
 * 1. Live Member 2 API (when Member 2 service is running)
 * 2. High-Fidelity Calibrated Dataset (for isolated hackathon testing and demo stability)
 */

export class Member2Client {
  constructor(baseUrl = process.env.MEMBER2_URL || 'http://localhost:3002') {
    this.baseUrl = baseUrl;
    this.isLive = false;
    this.lastChecked = null;
  }

  async checkHealth() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      
      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal
      }).catch(() => null);

      clearTimeout(timeoutId);
      this.isLive = !!(res && res.ok);
      this.lastChecked = new Date().toISOString();
      return this.isLive;
    } catch {
      this.isLive = false;
      this.lastChecked = new Date().toISOString();
      return false;
    }
  }

  getStatus() {
    return {
      connected: this.isLive,
      endpoint: this.baseUrl,
      mode: this.isLive ? 'LIVE_MEMBER2_PIPELINE' : 'LOCAL_CALIBRATED_PIPELINE',
      lastChecked: this.lastChecked
    };
  }

  async fetchLiveFindings() {
    if (!this.isLive) return null;
    try {
      const res = await fetch(`${this.baseUrl}/api/intelligence/findings`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return null;
  }

  async fetchLiveFacts() {
    if (!this.isLive) return null;
    try {
      const res = await fetch(`${this.baseUrl}/api/intelligence/facts`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return null;
  }

  async processCase(payload) {
    if (!this.isLive) await this.checkHealth();
    if (this.isLive) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/intelligence/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('[MEMBER 2 CLIENT] Process case failed:', err.message);
      }
    }
    return null;
  }
}
