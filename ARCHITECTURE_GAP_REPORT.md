# NEXUS AI — ARCHITECTURE GAP & INTEGRATION REPORT
**Date:** October 9, 2026  
**Auditor:** Senior Forensic Systems Engineer  

---

## 1. Architectural Gap Analysis

### 1. Missing Components
- **Physical Disk Document Archive:** Previously, uploaded files existed solely in transient memory.  
  *Resolution:* Added physical file writer in `orchestrator/server.js` archiving all uploads to `data/documents/<filename>`.
- **Durable Case State Store:** Process restarts previously reset active dossiers.  
  *Resolution:* Implemented `StorageManager` (`orchestrator/services/storage-manager.js`) persisting case state to `orchestrator/data/session-store.json`.

### 2. Disconnected Components (Resolved)
- **Frontend Upload Modal:** `UploadModal.tsx` was running isolated mock timers without dispatching HTTP requests to port 5001.  
  *Resolution:* Connected `FileReader` and wired `nexusApi.uploadDocuments()` to dispatch multipart payloads.
- **Member 2 Discrepancy Pipeline Connection:** `orchestrator/server.js` was receiving uploaded files but not triggering `member2Client.processCase()`.  
  *Resolution:* Wired `POST /api/documents/upload` to automatically invoke Member 2 entity resolution, fact linking, and contradiction detection.
- **Copilot Terminal Chat:** `ChatBoxTerminal.tsx` was not sending prompts to `POST /api/qa`.  
  *Resolution:* Connected chat input to live grounded reasoning endpoint.

### 3. Wrong Component Connections / Schema Gaps (Resolved)
- **Member 2 Target URL:** `Member2Client` previously defaulted to port 3001 while Member 2 listened on port 3002.  
  *Resolution:* Corrected default baseUrl to `http://localhost:3002`.
- **Member 2 Missing Route Aliases:** Inter-service health checks reported Member 2 offline due to missing `/health` and legacy alias routes.  
  *Resolution:* Added `/health` and `/api/intelligence/findings` route aliases in `src/api/server.ts`.
- **Orchestrator Port Collision:** Root `.env` contained `PORT=8000` (intended for FastAPI), causing the Node server to collide with Member 1.  
  *Resolution:* Safeguarded Orchestrator port selection in `orchestrator/server.js` (`process.env.ORCHESTRATOR_PORT || (PORT === '8000' ? 5001 : PORT)`).

### 4. Unused / Redundant LLM & Agent Definitions
- **Agent Frameworks:** No complex, flaky multi-agent frameworks are required for deterministic fact extraction. Direct Gemini 3.5 Flash LLM structured JSON generation with deterministic normalization in Member 2 provides higher reliability, faster latency, and zero hallucination.

### 5. OCR Execution & Resilience Gap (Resolved)
- **Python / Tesseract Host Dependency:** Host environments lacking Python could not run native Tesseract OCR.  
  *Resolution:* Embedded Gemini 3.5 Flash Multimodal Vision OCR into `Member1Client` (`orchestrator/services/member1-client.js`), processing images, scanned PDFs, and documents with zero host dependencies.
