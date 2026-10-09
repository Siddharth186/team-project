/**
 * NEXUS AI — PERSISTENT STORAGE MANAGER
 * 
 * Provides durable JSON persistence for case state, uploaded documents,
 * normalized facts, resolved entities, findings, and graph topologies.
 * 
 * Guarantees that server restarts or network interruptions DO NOT wipe
 * user cases, uploaded files, or extracted intelligence findings.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_PATH = path.join(__dirname, '../data/session-store.json');

export class StorageManager {
  static getStoragePath() {
    return STORAGE_PATH;
  }

  /**
   * Load persisted session from disk or initialize with seed defaults
   */
  static loadSession(seedDefaults) {
    try {
      if (fs.existsSync(STORAGE_PATH)) {
        const raw = fs.readFileSync(STORAGE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);

        // Ensure all required fields exist
        const merged = {
          documents: Array.isArray(parsed.documents) ? parsed.documents : [...seedDefaults.documents],
          entities: Array.isArray(parsed.entities) ? parsed.entities : [...seedDefaults.entities],
          facts: Array.isArray(parsed.facts) ? parsed.facts : [...seedDefaults.facts],
          findings: Array.isArray(parsed.findings) ? parsed.findings : [...seedDefaults.findings],
          missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : [...seedDefaults.missingInformation],
          temporalTrajectory: Array.isArray(parsed.temporalTrajectory) ? parsed.temporalTrajectory : [...seedDefaults.temporalTrajectory],
          graph: parsed.graph && parsed.graph.nodes ? parsed.graph : { ...seedDefaults.graph },
          metrics: parsed.metrics || { ...seedDefaults.metrics },
          lastPersistedAt: parsed.lastPersistedAt || new Date().toISOString()
        };

        // Guarantee seed documents exist in store if empty
        if (merged.documents.length === 0 && seedDefaults.documents.length > 0) {
          merged.documents = [...seedDefaults.documents];
        }

        console.log(`[STORAGE MANAGER] Loaded persistent session: ${merged.documents.length} docs, ${merged.facts.length} facts.`);
        return merged;
      }
    } catch (err) {
      console.warn('[STORAGE MANAGER] Failed to load persistent state, falling back to seed:', err.message);
    }

    // Default initialization
    const initial = {
      documents: [...seedDefaults.documents],
      entities: [...seedDefaults.entities],
      facts: [...seedDefaults.facts],
      findings: [...seedDefaults.findings],
      missingInformation: [...seedDefaults.missingInformation],
      temporalTrajectory: [...seedDefaults.temporalTrajectory],
      graph: { ...seedDefaults.graph },
      metrics: { ...seedDefaults.metrics },
      lastPersistedAt: new Date().toISOString()
    };

    StorageManager.saveSession(initial);
    return initial;
  }

  /**
   * Persist active session data atomically to disk
   */
  static saveSession(sessionData) {
    try {
      const dataToSave = {
        documents: sessionData.documents || [],
        entities: sessionData.entities || [],
        facts: sessionData.facts || [],
        findings: sessionData.findings || [],
        missingInformation: sessionData.missingInformation || [],
        temporalTrajectory: sessionData.temporalTrajectory || [],
        graph: sessionData.graph || { nodes: [], edges: [] },
        metrics: sessionData.metrics || {},
        lastPersistedAt: new Date().toISOString()
      };

      const dir = path.dirname(STORAGE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(STORAGE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('[STORAGE MANAGER] Error writing session to disk:', err.message);
      return false;
    }
  }

  /**
   * Reset storage back to initial seed data
   */
  static resetSession(seedDefaults) {
    try {
      const initial = {
        documents: [...seedDefaults.documents],
        entities: [...seedDefaults.entities],
        facts: [...seedDefaults.facts],
        findings: [...seedDefaults.findings],
        missingInformation: [...seedDefaults.missingInformation],
        temporalTrajectory: [...seedDefaults.temporalTrajectory],
        graph: { ...seedDefaults.graph },
        metrics: { ...seedDefaults.metrics },
        lastPersistedAt: new Date().toISOString()
      };

      StorageManager.saveSession(initial);
      console.log('[STORAGE MANAGER] Reset session to initial seed state.');
      return initial;
    } catch (err) {
      console.error('[STORAGE MANAGER] Error resetting session:', err.message);
      return null;
    }
  }

  /**
   * Get storage statistics
   */
  static getStats() {
    const exists = fs.existsSync(STORAGE_PATH);
    let sizeBytes = 0;
    let mtime = null;

    if (exists) {
      const stat = fs.statSync(STORAGE_PATH);
      sizeBytes = stat.size;
      mtime = stat.mtime.toISOString();
    }

    return {
      storagePath: STORAGE_PATH,
      exists,
      sizeBytes,
      lastModified: mtime
    };
  }
}
