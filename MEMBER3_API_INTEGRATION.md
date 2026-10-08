# NEXUS AI — MEMBER 3 API INTEGRATION & INTERFACE CONTRACT

**Author:** Member 3 (Integration & Orchestration Engineer)  
**System:** NEXUS AI — Evidence-Centric Information Intelligence  
**Target:** Member 2 Engine Integration & Orchestrator API Specification  

---

## 1. Upstream Contract: Consuming Member 2 Intelligence

Member 3's orchestrator includes a dedicated adapter (`orchestrator/services/member2-client.js`) configured via the environment variable `MEMBER2_URL` (defaults to `http://localhost:8000`).

### 1.1 Health & Connectivity
- **Endpoint:** `GET ${MEMBER2_URL}/health`
- **Behavior:** The orchestrator probes Member 2 every 30 seconds.
  - If Member 2 responds `200 OK`, the orchestrator marks status as `LIVE_MEMBER2_PIPELINE`.
  - If offline or unreachable, it seamlessly switches to `LOCAL_CALIBRATED_PIPELINE` using the high-fidelity demonstration dataset (`orchestrator/data/loan-case-data.js`).

### 1.2 Ingesting Findings from Member 2
- **Endpoint:** `GET ${MEMBER2_URL}/api/intelligence/findings`
- **Expected Payload:**
```json
[
  {
    "id": "find-1",
    "category": "BUDGET_DISCREPANCY",
    "severity": "CRITICAL",
    "title": "Budget discrepancy detected",
    "summary": "Project Alpha requested loan exceeds the sanctioned subsidy ceiling by ₹3.4L.",
    "entityName": "Project Alpha (Nexus Solar)",
    "conflictingFacts": [
      {
        "id": "fact-1",
        "entityId": "ent-3",
        "entityName": "Project Alpha",
        "attribute": "Requested Loan Amount",
        "value": "₹18,40,000",
        "normalizedValue": 1840000,
        "source": {
          "documentId": "doc-1",
          "documentName": "Loan_Application_Form_NexusSolar.pdf",
          "pageNumber": 2,
          "snippet": "The borrower requests a commercial term loan facility of INR 18,40,000...",
          "extractedAt": "2026-03-24T10:15:02Z"
        },
        "confidence": 0.98
      },
      {
        "id": "fact-2",
        "entityId": "ent-3",
        "entityName": "Project Alpha",
        "attribute": "Approved Subsidized Ceiling",
        "value": "₹15,00,000",
        "normalizedValue": 1500000,
        "source": {
          "documentId": "doc-2",
          "documentName": "Grant_Sanction_Order_MNRE_2025.pdf",
          "pageNumber": 1,
          "snippet": "Sanction is hereby accorded for Project Alpha subject to an overall eligible debt cap not exceeding INR 15,00,000...",
          "extractedAt": "2026-03-24T10:15:32Z"
        },
        "confidence": 0.96
      }
    ],
    "discrepancyDelta": {
      "expectedOrPrevious": "₹15,00,000 (Approved Grant Cap)",
      "reportedOrNew": "₹18,40,000 (Loan Requested)",
      "difference": "₹3,40,000"
    },
    "reasoning": "The loan application seeks ₹18.4L for Project Alpha, whereas MNRE Grant Sanction Order Section 4 explicitly caps eligible borrowing at ₹15.0L...",
    "confidence": 0.94,
    "recommendation": "Review required: Require applicant to align requested facility within the ₹15.0L ceiling or furnish supplemental equity co-funding letter."
  }
]
```

---

## 2. Orchestration API Endpoints (Port 5001)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Returns system pipeline stages, active document counts, and Member 2 connectivity |
| `GET` | `/api/metrics` | Returns total documents, facts, relationships, conflicts, missing data, and avg confidence |
| `GET` | `/api/documents` | Returns list of ingested documents with processing lifecycle status |
| `POST` | `/api/documents/upload` | Accepts multi-file payload, enqueues files, and initializes pipeline progress |
| `GET` | `/api/documents/progress` | Polls active document ingestion progress (increments from 15% to 100%) |
| `GET` | `/api/facts` | Returns extracted facts (filterable by `entityId` and `category`) |
| `GET` | `/api/findings` | Returns cross-document contradictions (filterable by `severity` and `category`) |
| `GET` | `/api/findings/:id` | Returns single finding by ID with complete source citations |
| `GET` | `/api/missing` | Returns missing regulatory documents under lending policies |
| `GET` | `/api/timeline` | Returns chronological value evolution (e.g. quarterly turnover progression) |
| `GET` | `/api/graph` | Returns nodes and relationship edges for knowledge graph visualization |
| `POST` | `/api/qa` | Processes natural language inquiries using deterministic grounding |
| `GET` | `/api/report` | Generates structured Case Decision Intelligence Report |
| `GET` | `/api/report/markdown` | Returns report formatted in standard GitHub Markdown |
| `POST` | `/api/reset` | Resets session state to the baseline calibrated demonstration case |

---

## 3. Grounded Q&A Protocol (`POST /api/qa`)

### Request
```json
{
  "query": "What information is inconsistent?"
}
```

### Response
```json
{
  "query": "what information is inconsistent?",
  "answer": "### Inconsistencies & Contradictions Detected (3 Major Discrepancies)\n\nDeterministic cross-document validation identified **3 factual discrepancies**...",
  "confidence": 0.95,
  "citedFacts": [ ... ],
  "citedEvidence": [
    {
      "documentId": "doc-1",
      "documentName": "Loan_Application_Form_NexusSolar.pdf",
      "pageNumber": 2,
      "snippet": "The borrower requests a commercial term loan facility of INR 18,40,000..."
    }
  ],
  "suggestedFollowUps": [
    "Show evidence for the income mismatch.",
    "What changed over time?",
    "What information is missing?"
  ]
}
```
