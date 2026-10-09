# NEXUS AI — ROOT CAUSE FORENSIC AUDIT REPORT
**Audit Date:** October 9, 2026  
**Auditor:** Senior Forensic Systems Engineer  

---

### BUG-001: Disconnected File Upload & Simulation Mode in Frontend
- **Severity:** P1 (Critical)
- **Component:** `frontend/src/components/modals/UploadModal.tsx`
- **Symptom:** Selecting files simulated a 1-second delay and updated an in-memory counter without issuing any network request or reading file payloads.
- **Expected:** Files read via `FileReader` and dispatched via `POST /api/documents/upload` to the orchestrator.
- **Actual:** Zero HTTP requests were generated; files remained in client memory.
- **First Failure:** Frontend upload trigger boundary.
- **Root Cause:** Dummy timeout mock code left uncompleted before merge.
- **Fix:** Implemented `FileReader` to extract base64/text and dispatched items to `nexusApi.uploadDocuments()`.
- **Files Affected:** `frontend/src/components/modals/UploadModal.tsx`, `frontend/src/services/api.ts`.

---

### BUG-002: Ingestion Adapter Defaulting to Static Entities for Uploaded Text
- **Severity:** P1 (Critical)
- **Component:** `orchestrator/services/member1-client.js`
- **Symptom:** Uploading documents with custom entities (e.g., "Rahul Sharma") produced static entities for `Nexus Solar Power Pvt Ltd`.
- **Expected:** Dynamic parsing of text and multimodal OCR extracting real names, numbers, and attributes from uploaded files.
- **Actual:** Autonomous parser used hard-coded fallback records instead of analyzing user payload.
- **First Failure:** Ingestion extraction step in Member 1 client.
- **Root Cause:** Ingestion adapter lacked dynamic regex parsing and direct LLM/Vision extraction integration.
- **Fix:** Integrated Gemini 3.5 Flash Multimodal Vision & Semantic Extraction for all file formats (PDF, DOCX, XLSX, TXT, CSV, PNG) with dynamic key-value regex parser fallback.
- **Files Affected:** `orchestrator/services/member1-client.js`.

---

### BUG-003: Reasoning Engine Hard-Coded to Seed Case and Missing Anti-Hallucination Gate
- **Severity:** P1 (Critical)
- **Component:** `orchestrator/services/reasoning-engine.js`
- **Symptom:** Asking "What is Rahul Sharma's monthly income?" or "What is Rahul's blood group?" triggered keyword matches against seed borrower records ("Arjun Mehta") or returned generic facts.
- **Expected:** Grounded answers referencing Rahul Sharma from uploaded documents, and explicit "not available" statements for unmentioned attributes.
- **Actual:** Static case handlers bypassed active session facts.
- **First Failure:** Retrieval and reasoning grounding step.
- **Root Cause:** Rule-based keyword checks intercepted natural language queries before querying the active fact store.
- **Fix:** Refactored `GroundedReasoningEngine` to query active facts in session storage with Gemini 3.5 Flash grounding and strict anti-hallucination verification.
- **Files Affected:** `orchestrator/services/reasoning-engine.js`.

---

### BUG-004: Volatile Process Storage
- **Severity:** P2 (Major)
- **Component:** `orchestrator/server.js` & `orchestrator/services/storage-manager.js`
- **Symptom:** Server restarts wiped all uploaded documents and extracted intelligence.
- **Expected:** Persisted case dossiers surviving server reboots.
- **Actual:** Pure in-memory session arrays.
- **Fix:** Implemented `StorageManager` serializing case state to `orchestrator/data/session-store.json` and saving physical files to `data/documents/`.
- **Files Affected:** `orchestrator/services/storage-manager.js`, `orchestrator/server.js`.
