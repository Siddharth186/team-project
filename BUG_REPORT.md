# NEXUS AI — ROOT CAUSE CLASSIFICATION & BUG REPORT
**Date:** October 9, 2026  
**Auditor:** Senior Full-Stack AI System Engineer, Debugger & Architect  
**Branch:** `debug/full-system-audit`  

---

## 1. Classification Summary

* **P0 (Blocker):** 0 (Application services launch and run cleanly)
* **P1 (Critical):** 2 (File upload disconnection, Missing Member 1 $\rightarrow$ Member 2 $\rightarrow$ Member 3 pipeline)
* **P2 (Major):** 4 (Member 2 health route mismatch, Static Document Summary, Static Chat responses, Port collision risk)
* **P3 (Minor):** 2 (Black line scrolling artifact, Modal navigation state stickiness)
* **P4 (Enhancement):** 0

---

## 2. Detailed Bug Reports

### BUG-001
* **Severity:** P1 (CRITICAL)
* **Component:** `frontend/src/components/modals/UploadModal.tsx` & `frontend/src/App.tsx`
* **Description:** Upload modal was unable to insert files or send data to the backend.
* **Expected:** Selecting files or clicking demo batch should send HTTP POST request to `/api/documents/upload` and update the active dossier.
* **Actual:** Function `handleFiles` executed a simulated `setTimeout(1200)` and called `onUploadSuccess` which merely incremented a local dummy integer `docCount`.
* **Root Cause:** UI mock handler was not connected to `nexusApi.uploadDocuments(items)`.
* **Evidence:** `UploadModal.tsx` lines 30-44 had no fetch/API call; `App.tsx` only had `setDocCount(prev => prev + files.length)`.
* **Fix:** Integrated `FileReader` and `nexusApi.uploadDocuments(items)` in `UploadModal.tsx`; updated `App.tsx` to refresh live documents via `nexusApi.getDocuments()`.
* **Test:** Uploaded `ITR_V_Filed_Return_2025_26.pdf` and verified it appears in `sessionData.documents` with HTTP 202.

---

### BUG-002
* **Severity:** P1 (CRITICAL)
* **Component:** `orchestrator/server.js`
* **Description:** Upload route did not extract facts or execute Member 2 contradiction checks.
* **Expected:** Uploaded files should have their entities and facts extracted (Member 1) and evaluated for contradictions (Member 2).
* **Actual:** Endpoint `POST /api/documents/upload` only generated mock document metadata objects with `status: 'PROCESSING'`.
* **Root Cause:** Missing cross-subsystem pipeline adapter between Member 1 parser and Member 2 intelligence engine in the orchestrator.
* **Evidence:** In `server.js`, `sessionData.facts` and `sessionData.findings` were never updated on upload.
* **Fix:** Implemented `orchestrator/services/member1-client.js` and wired `app.post('/api/documents/upload')` to extract facts and pass them to `member2Client.processCase(casePayload)`.
* **Test:** Verified that uploading a document increments `sessionData.facts` and updates `sessionData.metrics`.

---

### BUG-003
* **Severity:** P2 (MAJOR)
* **Component:** `src/api/server.ts` & `orchestrator/services/member2-client.js`
* **Description:** Member 3 orchestrator reported Member 2 as disconnected (`connected: false`).
* **Expected:** Member 3 health poller should verify Member 2 is live and report `connected: true` with mode `LIVE_MEMBER2_PIPELINE`.
* **Actual:** Member 2 was running on port 3002, but orchestrator's health check failed with 404.
* **Root Cause:** Route mismatch: `member2-client.js` queried `/health` while Member 2 only listened on `/api/v1/health`.
* **Evidence:** `GET http://localhost:3002/health` returned 404 before fix; status returned `mode: LOCAL_CALIBRATED_PIPELINE`.
* **Fix:** Added `/health`, `/api/intelligence/findings`, and `/api/intelligence/facts` aliases in `src/api/server.ts`.
* **Test:** `GET http://localhost:5001/api/status` now returns `"member2Integration": {"connected": true, "mode": "LIVE_MEMBER2_PIPELINE"}`.

---

### BUG-004
* **Severity:** P2 (MAJOR)
* **Component:** `frontend/src/components/dashboard/DocumentSummary.tsx`
* **Description:** Document summary displayed static mock files and never reflected newly uploaded documents.
* **Expected:** Ingested files should appear in the Document Summary table with their actual format, size, and category.
* **Actual:** Hardcoded array `recentFiles` (`Applicant_Form.pdf`, `Income_Certificate.pdf`, etc.) was permanently displayed.
* **Root Cause:** Component lacked props to accept the live documents array from `App.tsx`.
* **Evidence:** `DocumentSummary.tsx` line 54 had hardcoded `recentFiles` array and static `24 Ingested` badge.
* **Fix:** Added `documents?: any[]` prop to `DocumentSummaryProps`, derived `displayFiles`, and bound the count badge to `documents.length`.
* **Test:** Newly uploaded documents dynamically appear at the top of the table.

---

### BUG-005
* **Severity:** P2 (MAJOR)
* **Component:** `frontend/src/components/chat/ChatBoxTerminal.tsx`
* **Description:** Chat terminal returned static hardcoded responses instead of querying the backend reasoning engine.
* **Expected:** Questions typed into Chat Terminal should query `POST /api/qa` on the orchestrator.
* **Actual:** Function `handleSend` had 3 hardcoded `if/else` static replies with hardcoded citation strings.
* **Root Cause:** Frontend mock handler was not connected to `nexusApi.askQuestion(query)`.
* **Evidence:** `ChatBoxTerminal.tsx` line 50 had a `setTimeout` with hardcoded string replies.
* **Fix:** Replaced mock timer with `await nexusApi.askQuestion(q)`, extracting cited evidence, confidence, and grounded answer.
* **Test:** Asked *"What information is inconsistent?"* and received grounded response citing specific primary source pages.

---

### BUG-006
* **Severity:** P3 (MINOR)
* **Component:** `frontend/src/index.css` & `frontend/src/components/background/AntigravityScene.tsx`
* **Description:** Black line visible while scrolling in website.
* **Expected:** Clean, borderless transparent scroll without visual artifacts.
* **Actual:** Dark vertical line down right edge of viewport and horizontal perspective lines cutting across cards.
* **Root Cause:** Scrollbar track background `#0D0F0E` rendered a 5px black strip; Three.js floor `GridHelper` rendered horizontal lines.
* **Evidence:** `::-webkit-scrollbar-track` had `#0D0F0E`; `AntigravityScene.tsx` line 118 added `GridHelper(600, 30)` at `y = -100`.
* **Fix:** Set scrollbar track and thumb to transparent with zero width; removed `GridHelper` from Three.js scene.
* **Test:** Tested scrolling down the page; verified zero black lines across dark and light themes.

---

### BUG-007
* **Severity:** P3 (MINOR)
* **Component:** `frontend/src/App.tsx`
* **Description:** Navigation tabs in header became unresponsive after closing modals.
* **Expected:** User can open, close, and re-open modals repeatedly by clicking the navigation tabs.
* **Actual:** Closing a modal left `activeTab` set to that modal's ID, preventing reopening.
* **Root Cause:** Modal `onClose` handlers did not reset `setActiveTab('overview')`.
* **Evidence:** `KnowledgeGraphModal` had `onClose={() => setGraphModalOpen(false)}` without resetting `activeTab`.
* **Fix:** Added `setActiveTab('overview')` to all modal `onClose` handlers.
* **Test:** Clicked *Knowledge Graph*, closed modal, clicked *Knowledge Graph* again; opened seamlessly.

---

### BUG-008
* **Severity:** P2 (MAJOR)
* **Component:** `orchestrator/server.js` & root `.env`
* **Description:** Shared `PORT=8000` in root `.env` caused port collisions when starting orchestrator.
* **Expected:** Member 1 runs on port 8000, Member 2 on port 3002, Orchestrator on port 5001.
* **Actual:** Running `node orchestrator/server.js` without explicitly passing `PORT=5001` read `PORT=8000` from root `.env`.
* **Root Cause:** Ambiguous environment variable `PORT` shared between Python FastAPI engine and Node.js orchestrator.
* **Fix:** In `orchestrator/server.js`, check `process.env.ORCHESTRATOR_PORT || (process.env.PORT === '8000' ? 5001 : process.env.PORT) || 5001`.
* **Test:** Orchestrator always binds to port 5001 even when root `.env` specifies `PORT=8000`.
