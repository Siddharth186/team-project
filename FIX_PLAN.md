# NEXUS AI — MASTER FIX PLAN & IMPLEMENTATION ROADMAP
**Date:** October 9, 2026  
**Auditor:** Senior Full-Stack AI System Engineer, Debugger & Architect  
**Branch:** `debug/full-system-audit`  

---

## 1. Prioritized Fix Ordering

1. **P1 (Critical):**
   * **Fix 1:** Bridge Frontend File Upload to Backend Ingestion API.
   * **Fix 2:** Wire Ingestion Pipeline to Extract Entities/Facts and Forward to Member 2 Contradiction Engine.
2. **P2 (Major):**
   * **Fix 3:** Synchronize Member 2 REST API Routes (`/health`, `/api/intelligence/findings`) with Member 3 Orchestrator Client.
   * **Fix 4:** Safeguard Port Allocation in `orchestrator/server.js` against Root `.env` Collisions.
   * **Fix 5:** Dynamically Render Live Uploaded Documents in `DocumentSummary.tsx`.
   * **Fix 6:** Connect `ChatBoxTerminal.tsx` to Live Grounded Q&A Reasoning Engine (`/api/qa`).
3. **P3 (Minor):**
   * **Fix 7:** Eliminate Black Scrollbar Line Artifact in `frontend/src/index.css`.
   * **Fix 8:** Remove Three.js Perspective Floor Grid in `AntigravityScene.tsx` and Add 3D Verified Documents.
   * **Fix 9:** Reset Navigation Active Tab on Modal Close in `frontend/src/App.tsx`.

---

## 2. Technical Fix Specifications

### Fix 1 & 2: End-to-End Ingestion, Extraction & Contradiction Pipeline
* **Why:** The system is an evidence-centric intelligence pipeline. When a user uploads a file, it must be ingested, parsed, extracted into facts, and validated for contradictions across existing documents.
* **Affected Files:**
  * `frontend/src/components/modals/UploadModal.tsx`
  * `frontend/src/App.tsx`
  * `orchestrator/services/member1-client.js`
  * `orchestrator/services/member2-client.js`
  * `orchestrator/server.js`
* **Affected Components:** Frontend Ingestion UI, Orchestrator Service, Member 1 Parser, Member 2 Intelligence Engine.
* **Possible Side Effects:** Large files could exceed default body limits; mitigated by configuring `express.json({ limit: '50mb' })`.
* **Tests Required:**
  * Upload single document (`POST /api/documents/upload`).
  * Verify document appears in `GET /api/documents`.
  * Verify extracted facts appear in `sessionData.facts`.
  * Verify Member 2 evaluation generates findings and evidence cards.

---

### Fix 3 & 4: Subsystem Route Alignment & Port Conflict Defense
* **Why:** Member 3 health poller queried `/health`, but Member 2 was listening on `/api/v1/health`. Furthermore, root `.env` defines `PORT=8000`, which could cause port conflicts if orchestrator defaulted to 8000.
* **Affected Files:**
  * `src/api/server.ts`
  * `orchestrator/server.js`
* **Affected Components:** Member 2 REST Server, Orchestrator Startup.
* **Possible Side Effects:** None; adding route aliases preserves backward compatibility with existing tests.
* **Tests Required:**
  * `npm test` (all 20 unit/integration tests must pass).
  * `node orchestrator/test/integration.test.js` (all 14 integration tests must pass).
  * `GET http://localhost:5001/api/status` returns `member2Integration.connected: true`.

---

### Fix 5 & 6: Live Dashboard & Grounded Chat Wiring
* **Why:** Users need visual confirmation of uploaded documents in the summary table and the ability to ask natural-language questions about newly ingested files.
* **Affected Files:**
  * `frontend/src/components/dashboard/DocumentSummary.tsx`
  * `frontend/src/components/chat/ChatBoxTerminal.tsx`
* **Affected Components:** Document Summary Table, Chat Terminal.
* **Possible Side Effects:** None; offline fallback ensures UI remains responsive if backend is momentarily unreachable.
* **Tests Required:**
  * Ask *"What conflicts did you find?"* $\rightarrow$ verifies verbatim source citations.
  * Upload new document $\rightarrow$ verifies it appears immediately in the table.

---

### Fix 7, 8 & 9: UI Cleanliness & Navigation Reactivity
* **Why:** Provide a clean visual presentation without black scroll lines or stuck navigation tabs.
* **Affected Files:**
  * `frontend/src/index.css`
  * `frontend/src/components/background/AntigravityScene.tsx`
  * `frontend/src/App.tsx`
* **Affected Components:** Global CSS, Three.js Scene, Top Navigation Bar.
* **Possible Side Effects:** None.
* **Tests Required:**
  * Smooth scroll test in browser.
  * Repeated modal open/close test across all tabs.
