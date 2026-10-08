# NEXUS AI — Member 2 Repository & Interface Audit
**Role:** Member 2 — Information Intelligence Engine  
**Branch:** `feature/member2-intelligence`  
**Timestamp:** 2026-10-08  

---

## 1. Executive Summary & Context

NEXUS AI is an **Evidence-Centric Information Intelligence Platform** built around the core axiom:
> *"The unit of intelligence is the FACT, not the document."*

A 3-person team divides responsibilities as follows:
- **Member 1 (Document Ingestion & Extraction):** Document ingestion, parsing, OCR, tables, chunking, raw fact and entity extraction with source evidence pointers.
- **Member 2 (Information Intelligence Engine — THIS SUBSYSTEM):** Fact normalization, entity resolution, cross-document fact linking, contradiction detection, missing information identification, temporal timeline analysis, evidence aggregation, multi-signal confidence engine, and validated findings generation.
- **Member 3 (LLM Reasoning, Orchestration & Interface):** LLM synthesis, user Q&A, final decision reports, API gateway, UI/Dashboard.

---

## 2. Repository State Audit

| Component | Status in Workspace | Notes & Strategy |
| :--- | :--- | :--- |
| **Workspace Tree** | Minimal (`README.md` only) | Greenfield codebase. No other members' code currently committed to this branch. |
| **Git Configuration** | Branch created | Checked out `feature/member2-intelligence`. Isolated from future merges. |
| **Runtime Environment** | Node.js v24.19.0 (with native TypeScript support via `--experimental-strip-types`), npm 11.17.0, Git 2.47+ | Node 24 native TypeScript provides zero-transpile, hyper-fast, deterministic execution and testing. |
| **Member 1 Integration** | Not yet committed to tree | Member 2 must formalize the **Member 1 Ingestion & Extraction Contract** (`IngestedDocument`, `RawEntity`, `RawFact`, `EvidenceSnippet`) so that Member 1's output plugs in seamlessly without friction. |
| **Member 3 Integration** | Not yet committed to tree | Member 2 must expose clean REST endpoints (`/api/v1/...`) and structured JSON schemas (`Finding`, `IntelligenceReport`, `Timeline`, `EvidenceRecord`) for Member 3's orchestration and UI. |

---

## 3. Subsystem Boundaries & Ownership Matrix

```
       [Member 1: Ingestion & Extraction]
                        │  (Raw Facts, Entities, Evidence)
                        ▼
       ┌──────────────────────────────────────────────────────────┐
       │     MEMBER 2: INFORMATION INTELLIGENCE ENGINE            │
       │                                                          │
       │  1. Fact Normalization (dates, currencies, units, nums) │
       │  2. Multi-Signal Entity Resolution (aliases, IDs, sims)  │
       │  3. Cross-Document Fact Linking                          │
       │  4. Deterministic Contradiction Detection                │
       │  5. Temporal Intelligence & Timeline Engine              │
       │  6. Missing Information Engine (Explicit & Semantic)     │
       │  7. Evidence Preservation Engine (Doc → Page → Snippet)  │
       │  8. Multi-Signal Confidence Scoring (Extraction + Match) │
       │  9. Validated Findings Generation                        │
       └──────────────────────────────────────────────────────────┘
                        │  (Validated Findings, Timelines, Evidences)
                        ▼
       [Member 3: Orchestration, Reporting & Interface]
```

### Member 2 Ownership Checklist
- [x] Fact Normalization Engine
- [x] Entity Resolution Engine
- [x] Fact Linking Engine
- [x] Cross-Document Comparison Engine
- [x] Contradiction & Temporal Change Classifier
- [x] Missing Information Evaluator
- [x] Temporal Analysis & Timeline Builder
- [x] Evidence Aggregator & Provenance Tracker
- [x] Multi-Signal Confidence Engine
- [x] Intelligence REST API & In-Memory Store

### Explicit Non-Ownership (Strictly Respected)
- [x] **No** PDF parsing / OCR pipeline modifications (Member 1)
- [x] **No** raw document chunking / text layout parsing (Member 1)
- [x] **No** frontend / dashboard HTML/React implementation (Member 3)
- [x] **No** free-form generative LLM chat prompt orchestrations (Member 3)

---

## 4. Contract Specifications with Other Members

### Input Contract: From Member 1 (`IngestedCasePayload`)
Member 1 delivers:
1. `case_id`: Unique identifier of the case / application (e.g., `LOAN-2026-089`).
2. `documents`: List of ingested documents with `document_id`, `filename`, `doc_type` (e.g. `LOAN_APPLICATION`, `BANK_STATEMENT`, `TAX_RETURN`, `SALARY_SLIP`, `ID_PROOF`), `timestamp`.
3. `entities`: Raw extracted entities with mention texts, types (`PERSON`, `ORGANIZATION`, `ACCOUNT`, `ASSET`), identifiers (PAN, SSN, Account #, Phone, Email) and source references.
4. `facts`: Raw extracted facts containing `entity_id` or entity mentions, `attribute` (e.g. `monthly_income`, `annual_turnover`, `employer_name`, `date_of_birth`, `address`, `loan_amount_requested`), `raw_value`, `time_context`, and exact `evidence` (`document_id`, `page_number`, `source_text`, `bounding_box` or character offsets, `extraction_confidence`).

### Output Contract: To Member 3 (`IntelligenceReport`)
Member 2 provides:
1. `case_id`: The case ID.
2. `resolved_entities`: Canonical entities with canonical IDs, canonical names, aliases, and associated linked facts.
3. `normalized_facts`: Canonical facts with parsed typed values, units, temporal timestamps, and attached provenance evidence.
4. `findings`: Array of validated findings conforming strictly to Section 13 schema:
   - `finding_id`
   - `type`: `CONTRADICTION`, `POSSIBLE_CONTRADICTION`, `TEMPORAL_CHANGE`, `CONSISTENT`, `MISSING_INFORMATION`, `DUPLICATE`, `RELATED_INFORMATION`
   - `severity`: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFORMATIONAL`
   - `title`, `description`
   - `facts`: associated normalized facts
   - `evidence`: traceable array of `(document_id, filename, page, text)`
   - `confidence`: composite object `{ level: "HIGH"|"MEDIUM"|"LOW", score: 0.0-1.0, factors: [...] }`
   - `recommended_action`: clear next step for human decision-maker
5. `timelines`: Entity and attribute progression over time.
6. `missing_information`: Missing required and contextual fields by document checklist and domain schema.

---

## 5. Architectural Principle Adherence
- **AI Interprets, Deterministic Systems Validate:**
  No LLM will be used as a numerical calculator, date comparator, currency normalizer, or single source of truth. All calculations and contradiction logic are implemented deterministically with zero drift.
- **Evidence-Centric:**
  No finding can be emitted without traceability down to Document → Page → Source Text.
- **24-Hour Hackathon Readiness:**
  Zero complex external service dependencies required to run or test. High-performance, self-contained TypeScript/Node.js engine ready for immediate integration.
