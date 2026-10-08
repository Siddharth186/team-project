# NEXUS AI — Member 2: Information Intelligence Engine Architecture
**Subsystem:** Member 2 — Information Intelligence Engine  
**Branch:** `feature/member2-intelligence`  
**System Status:** INTEGRATION READY  

---

## 1. Architectural Mission & Core Principle

In traditional document search and AI chatbots, the document is treated as the atomic unit. NEXUS AI rejects this paradigm based on our foundational axiom:

> **"The unit of intelligence is the FACT, not the document."**

```
Documents ──► Facts ──► Connections ──► Validation ──► Intelligence ──► Decision
```

### Core Architectural Principle:
> **"AI interprets information. Deterministic systems validate information."**

Large Language Models (LLMs) are stochastic pattern engines. They are not databases, calculators, date comparators, or legal arbiters of truth. 
- Member 1 uses AI/OCR models to *interpret* and extract raw mentions and text fragments from unstructured documents.
- **Member 2 uses deterministic algorithmic systems** to normalize, resolve entities, link facts, detect contradictions, verify timelines, compute multi-signal confidence, and enforce checklist completeness.
- Member 3 orchestrates high-level synthesis and interactive decision support based solely on **Member 2's validated findings**.

---

## 2. End-to-End Pipeline Architecture

```
                  ┌──────────────────────────────────────────────┐
                  │ MEMBER 1: INGESTION & EXTRACTION SUBSYSTEM   │
                  │ Ingested Documents, Raw Mentions, Raw Facts  │
                  └──────────────────────┬───────────────────────┘
                                         │ IngestedCasePayload
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│              MEMBER 2: INFORMATION INTELLIGENCE ENGINE                          │
│                                                                                 │
│   1. Multi-Signal Entity Resolution Engine                                      │
│      ├── Exact Identifier Matching (PAN, Passport, Phone, Account)             │
│      ├── Initials & Token Analysis ("R. Kumar" ↔ "Ramesh Kumar")                │
│      └── Disambiguation Guards (Never merge on conflicting identifiers)         │
│                                         │                                       │
│                                         ▼                                       │
│   2. Fact Normalization & Fact Linking Engine                                   │
│      ├── Currency Normalization (₹15 Lakh, 1500000 INR, Rs. 15,00,000, 15L)    │
│      ├── Date & Temporal Parsing (DD/MM/YYYY, ISO, Quarters, Fiscal Years)      │
│      ├── Attribute Canonicalization (salary_credit ──► monthly_income)          │
│      └── Fact Clustering by (Canonical Entity ID × Attribute)                  │
│                                         │                                       │
│                    ┌────────────────────┴────────────────────┐                  │
│                    ▼                                         ▼                  │
│   3. Deterministic Contradiction Engine     4. Temporal Timeline Engine         │
│      ├── Invariant Attribute Rules             ├── Chronological Event Sorting  │
│      ├── Timeframe Equality Check              ├── Numeric & Pct Deltas         │
│      └── Contradiction vs Revision Filtering   └── Natural Narrative Generation │
│                    │                                         │                  │
│                    └────────────────────┬────────────────────┘                  │
│                                         ▼                                       │
│   5. Missing Information & Document Audit Engine                                │
│      ├── Required Field Checklists (Loan, Grant, KYC, Insurance)                │
│      └── Semantic Document Package Absence Detection (Missing Bank Stmt)        │
│                                         │                                       │
│                                         ▼                                       │
│   6. Multi-Signal Confidence Engine & Evidence Aggregator                       │
│      ├── 6-Factor Transparent Scoring Model                                     │
│      └── Full Provenance Binding: Doc ID → Doc Name → Page → Source Text        │
└────────────────────────────────────────┬────────────────────────────────────────┘
                                         │ IntelligenceReport / REST API
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │ MEMBER 3: REASONING, ORCHESTRATION & UI      │
                  │ Validated Findings, Audit Reports, Q&A, UI   │
                  └──────────────────────────────────────────────┘
```

---

## 3. Subsystem Component Breakdown

### 3.1 Data Model (`src/models/types.ts`)
Encapsulates the canonical fact representation:
$$\text{FACT} = \text{ENTITY} + \text{ATTRIBUTE} + \text{VALUE} + \text{TIME} + \text{CONTEXT} + \text{SOURCE} + \text{CONFIDENCE}$$
- `ResolvedEntity`: Canonical ID (`PERSON_001`), canonical name, aliases list, identifiers map, confidence score.
- `Fact`: Canonical entity ID, standardized attribute, typed `NormalizedValue`, `NormalizedTime`, `EvidenceSource`.
- `Finding`: Section 13 compliant structure containing `finding_id`, `type`, `severity`, `title`, `description`, `facts`, `evidence`, `confidence`, and `recommended_action`.

### 3.2 Fact Normalization Engine (`src/normalization/`)
- **Currency (`currency.ts`):** Indian Lakh/Crore systems, K/M/B multipliers, standard symbols (₹, $, €, £), comma formats.
- **Dates (`date.ts`):** Standardizes DD/MM/YYYY, MM/DD/YYYY, named months, quarters (`Q1 2024`), fiscal years (`FY2023-24`), ISO 8601 strings, and granularity tracking (`DAY`, `MONTH`, `QUARTER`, `YEAR`).
- **Numbers (`number.ts`):** Floating point amounts, percentages, unit handling.
- **Text & Identifiers (`text.ts`):** Strips honorifics (Mr., Mrs., Dr.), normalizes PAN (`ABCDE1234F`), phones (`+91` normalization), accounts, employment categories.

### 3.3 Multi-Signal Entity Resolution (`src/entity_resolution/entity_resolver.ts`)
Resolves real-world variations:
- `"Mr. Ramesh Kumar"`, `"R. Kumar"`, `"Ramesh K."`, `"R KUMAR"` $\rightarrow$ `PERSON_001` ("Ramesh Kumar").
- **Disambiguation Guard:** If two entities have identical names (e.g. two people named "Amit Sharma") but different PAN numbers, they are **never merged**; two distinct canonical entities are created.

### 3.4 Fact Linking & Clustering (`src/fact_linking/fact_linker.ts`)
- Maps raw facts to canonical entity IDs.
- Canonicalizes synonyms (e.g., `salary_credit`, `net_salary`, `take_home_pay` $\rightarrow$ `monthly_income`).
- Groups facts into clusters by `(entity_id, attribute)` for pairwise cross-document comparison.

### 3.5 Contradiction vs. Temporal Revision Engine (`src/contradiction/contradiction_engine.ts`)
Crucial hackathon differentiator:
- Distinguishes **Contradictions** (conflicting values claimed for the same point in time, e.g. Stated ₹42K vs Bank ₹31.5K) from **Temporal Revisions** (Jan ₹30K $\rightarrow$ Apr ₹35K $\rightarrow$ Aug ₹42K).
- Categorizes findings into:
  - `CONTRADICTION`: High/Critical severity.
  - `POSSIBLE_CONTRADICTION`: Medium severity when temporal context is ambiguous.
  - `TEMPORAL_CHANGE`: Informational/Low severity progression.
  - `CONSISTENT`: Verified agreement across independent documents.
  - `DUPLICATE`: Redundant identical facts within the same document.

### 3.6 Missing Information Engine (`src/missing_info/missing_info_engine.ts`)
- Evaluates against domain checklists (`LOAN_VERIFICATION_CHECKLIST`).
- Checks explicit field absences (e.g. Missing Residential Address, Missing Applicant Signature).
- Audits document bundle completeness (flags missing Bank Statement or Tax Return).

### 3.7 Temporal Analysis & Timeline Engine (`src/temporal/temporal_engine.ts`)
- Constructs chronological trajectories of entity attributes over time.
- Calculates exact numeric deltas and percentage shifts.
- Generates natural narrative explanations for human underwriters.

### 3.8 Evidence Engine (`src/evidence/evidence_engine.ts`)
- Enforces strict provenance traceability:
  Every finding binds directly to:
  $$\text{Document ID} \longrightarrow \text{Document Name} \longrightarrow \text{Page Number} \longrightarrow \text{Source Text Snippet}$$
- Generates side-by-side comparative cards.

### 3.9 Multi-Signal Confidence Engine (`src/confidence/confidence_engine.ts`)
Computes composite confidence without relying on hallucinated LLM self-confidence:
$$\text{Score} = 0.20 E_{\text{ext}} + 0.20 E_{\text{ent}} + 0.15 C_{\text{norm}} + 0.15 Q_{\text{src}} + 0.15 C_{\text{comp}} + 0.15 P_{\text{evid}}$$

### 3.10 REST API Server (`src/api/server.ts`)
Native zero-dependency HTTP server exposing REST endpoints ready for Member 3 consumption.
