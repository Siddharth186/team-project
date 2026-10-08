# NEXUS AI — Member 2: Intelligence REST API Reference
**Subsystem:** Member 2 — Information Intelligence Engine  
**Target Consumer:** Member 3 (Reasoning Orchestration, Chatbot, UI Dashboard)  
**Protocol:** HTTP / JSON REST  
**Default Port:** `3002` (configurable via `PORT` environment variable)

---

## 1. Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/health` | Subsystem health check and cached case count |
| `POST` | `/api/v1/intelligence/process` | Ingests Member 1 case payload, runs intelligence pipeline, stores report |
| `GET` | `/api/v1/intelligence/:case_id` | Retrieves full validated intelligence report for a case |
| `GET` | `/api/v1/findings` | Queries findings with optional filters (`case_id`, `type`, `severity`) |
| `GET` | `/api/v1/evidence/:finding_id` | Returns traceable evidence cards with page and snippet citations |
| `GET` | `/api/v1/timeline/:entity_id` | Retrieves chronological attribute timelines and progression deltas |

---

## 2. Endpoint Details

### 2.1 Health Check
- **Route:** `GET /api/v1/health`
- **Response:** `200 OK`
```json
{
  "status": "ok",
  "subsystem": "MEMBER_2_INTELLIGENCE_ENGINE",
  "active_cases_cached": 1,
  "timestamp": "2026-10-08T18:00:00.000Z"
}
```

---

### 2.2 Process Ingested Case Payload
- **Route:** `POST /api/v1/intelligence/process`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "case_id": "CASE-LOAN-2026-8841",
  "case_type": "LOAN_VERIFICATION",
  "documents": [
    {
      "document_id": "DOC_APP_01",
      "document_name": "LoanApplication.pdf",
      "doc_type": "LOAN_APPLICATION",
      "page_count": 3
    },
    {
      "document_id": "DOC_BANK_01",
      "document_name": "BankStatement_Q1_2024.pdf",
      "doc_type": "BANK_STATEMENT",
      "page_count": 5
    }
  ],
  "raw_entities": [
    {
      "mention_id": "ENT_01",
      "raw_name": "Mr. Ramesh Kumar",
      "entity_type": "PERSON",
      "identifiers": { "pan": "ABCDE1234F" },
      "evidence": {
        "document_id": "DOC_APP_01",
        "document_name": "LoanApplication.pdf",
        "page_number": 1,
        "source_text": "Applicant Full Name: Mr. Ramesh Kumar"
      }
    }
  ],
  "raw_facts": [
    {
      "fact_id": "FACT_01",
      "entity_mention_id": "ENT_01",
      "attribute": "monthly_income",
      "raw_value": "₹42,000",
      "raw_time": "March 2024",
      "evidence": {
        "document_id": "DOC_APP_01",
        "document_name": "LoanApplication.pdf",
        "page_number": 2,
        "source_text": "Monthly Income: ₹42,000",
        "extraction_confidence": 0.97
      }
    }
  ]
}
```
- **Response:** `201 Created`
  Returns the complete `IntelligenceReport` JSON.

---

### 2.3 Get Full Case Intelligence Report
- **Route:** `GET /api/v1/intelligence/:case_id`
- **Example:** `GET /api/v1/intelligence/CASE-LOAN-2026-8841`
- **Response:** `200 OK`
```json
{
  "case_id": "CASE-LOAN-2026-8841",
  "generated_at": "2026-10-08T18:04:20.123Z",
  "summary": {
    "total_documents": 4,
    "total_raw_facts": 11,
    "total_resolved_entities": 1,
    "findings_count_by_type": {
      "CONTRADICTION": 1,
      "POSSIBLE_CONTRADICTION": 0,
      "TEMPORAL_CHANGE": 5,
      "CONSISTENT": 2,
      "MISSING_INFORMATION": 2,
      "DUPLICATE": 0,
      "RELATED_INFORMATION": 0
    },
    "critical_findings_count": 1,
    "high_findings_count": 2,
    "verification_status": "FLAGGED_FOR_REVIEW"
  },
  "resolved_entities": [
    {
      "entity_id": "PERSON_001",
      "canonical_name": "Ramesh Kumar",
      "entity_type": "PERSON",
      "aliases": ["Mr. Ramesh Kumar", "R. Kumar", "Ramesh K.", "R KUMAR"],
      "identifiers": {
        "pan": "ABCDE1234F",
        "phone": "9876543210",
        "account_number": "987654321098"
      },
      "confidence_score": 0.99,
      "resolution_rationale": "Initialized new entity; Merged mention via unique identifier"
    }
  ],
  "findings": [ ... ],
  "timelines": [ ... ],
  "missing_information": [ ... ]
}
```

---

### 2.4 Query Findings
- **Route:** `GET /api/v1/findings?case_id={case_id}&type={type}&severity={severity}`
- **Example:** `GET /api/v1/findings?case_id=CASE-LOAN-2026-8841&type=CONTRADICTION`
- **Response:** `200 OK`
```json
{
  "total": 1,
  "findings": [
    {
      "finding_id": "FINDING_0001",
      "type": "CONTRADICTION",
      "severity": "HIGH",
      "title": "Direct Contradiction: monthly_income",
      "description": "Discrepancy found for \"monthly_income\": \"LoanApplication.pdf\" (p.2) indicates \"₹42,000\", while \"BankStatement_Q1_2024.pdf\" (p.3) indicates \"₹31,500\". Discrepancy ratio: 33.3%.",
      "facts": [ ... ],
      "evidence": [
        {
          "document_id": "DOC_APP_01",
          "document_name": "LoanApplication.pdf",
          "page_number": 2,
          "source_text": "Monthly Income: ₹42,000"
        },
        {
          "document_id": "DOC_BANK_01",
          "document_name": "BankStatement_Q1_2024.pdf",
          "page_number": 3,
          "source_text": "31-Mar-2024 SALARY CREDIT / TECH INNOVATIONS : ₹31,500.00 CR"
        }
      ],
      "confidence": {
        "level": "HIGH",
        "score": 0.95,
        "factors": {
          "extraction_confidence": 0.98,
          "entity_match_confidence": 0.92,
          "normalization_certainty": 0.98,
          "source_quality": 0.95,
          "comparison_certainty": 0.98,
          "evidence_completeness": 1.0
        },
        "explanation": "Multi-signal assessment: Extraction 98%, Entity Match 92%, Normalization 98%, Source Quality 95%, Deterministic Comparison 98%, Provenance Evidence 100%. Composite: 95% (HIGH)."
      },
      "recommended_action": "Request applicant clarification or official bank reconciliation for monthly_income."
    }
  ]
}
```

---

### 2.5 Get Traceable Evidence Card
- **Route:** `GET /api/v1/evidence/:finding_id`
- **Example:** `GET /api/v1/evidence/FINDING_0001`
- **Response:** `200 OK`
```json
{
  "finding_id": "FINDING_0001",
  "finding_title": "Direct Contradiction: monthly_income",
  "finding_type": "CONTRADICTION",
  "severity": "HIGH",
  "evidence_items": [
    {
      "label": "Evidence Source #1 (monthly_income)",
      "document_id": "DOC_APP_01",
      "document_name": "LoanApplication.pdf",
      "page_number": 2,
      "source_text": "Monthly Income: ₹42,000"
    },
    {
      "label": "Evidence Source #2 (monthly_income)",
      "document_id": "DOC_BANK_01",
      "document_name": "BankStatement_Q1_2024.pdf",
      "page_number": 3,
      "source_text": "31-Mar-2024 SALARY CREDIT / TECH INNOVATIONS : ₹31,500.00 CR"
    }
  ],
  "comparative_view": "Finding: Direct Contradiction: monthly_income [CONTRADICTION | HIGH]\nDescription: Discrepancy found for \"monthly_income\": \"LoanApplication.pdf\" (p.2) indicates \"₹42,000\", while \"BankStatement_Q1_2024.pdf\" (p.3) indicates \"₹31,500\". Discrepancy ratio: 33.3%.\nTraceable Evidence:\n  • [LoanApplication.pdf — p.2] \"Monthly Income: ₹42,000\"\n  • [BankStatement_Q1_2024.pdf — p.3] \"31-Mar-2024 SALARY CREDIT / TECH INNOVATIONS : ₹31,500.00 CR\""
}
```

---

### 2.6 Get Entity Attribute Timeline
- **Route:** `GET /api/v1/timeline/:entity_id?case_id={case_id}`
- **Example:** `GET /api/v1/timeline/PERSON_001?case_id=CASE-LOAN-2026-8841`
- **Response:** `200 OK`
```json
{
  "entity_id": "PERSON_001",
  "timelines": [
    {
      "entity_id": "PERSON_001",
      "canonical_name": "Ramesh Kumar",
      "attribute": "monthly_income",
      "summary": "Ramesh Kumar's monthly_income increased across 5 records: INR:30000.00 (2023) → INR:30000.00 (2024-01) → INR:42000.00 (2024-03) → INR:31500.00 (2024-03) → INR:31500.00 (2024-03). Net change: +1,500 (+5.0%).",
      "events": [
        {
          "event_id": "EVT_PERSON_001_1",
          "date_string": "2023",
          "value": { "data_type": "CURRENCY", "raw_value": "Rs. 30,000", "parsed_numeric": 30000, "standardized_representation": "INR:30000.00" },
          "document_name": "ITR_Acknowledgement_FY2023.pdf",
          "page_number": 1,
          "source_text": "Gross Total Income: Rs. 3,60,000 (Monthly average: Rs. 30,000)"
        },
        {
          "event_id": "EVT_PERSON_001_2",
          "date_string": "2024-01",
          "value": { "data_type": "CURRENCY", "raw_value": "₹30,000", "parsed_numeric": 30000, "standardized_representation": "INR:30000.00" },
          "document_name": "BankStatement_Q1_2024.pdf",
          "page_number": 2,
          "source_text": "31-Jan-2024 SALARY CREDIT : ₹30,000.00 CR",
          "delta_from_previous": { "numeric_delta": 0, "percentage_change": 0, "direction": "UNCHANGED" }
        },
        {
          "event_id": "EVT_PERSON_001_3",
          "date_string": "2024-03",
          "value": { "data_type": "CURRENCY", "raw_value": "₹31,500", "parsed_numeric": 31500, "standardized_representation": "INR:31500.00" },
          "document_name": "BankStatement_Q1_2024.pdf",
          "page_number": 3,
          "source_text": "31-Mar-2024 SALARY CREDIT / TECH INNOVATIONS : ₹31,500.00 CR",
          "delta_from_previous": { "numeric_delta": 1500, "percentage_change": 5, "direction": "INCREASE" }
        }
      ]
    }
  ]
}
```
