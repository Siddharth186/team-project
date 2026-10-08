# NEXUS AI — Member 2: Schema & Interface Specification
**Subsystem:** Member 2 — Information Intelligence Engine  
**Standard:** JSON Schema & TypeScript Type Declarations  

---

## 1. Input Contract: Member 1 $\rightarrow$ Member 2

Member 1 delivers the ingested case package conforming to `IngestedCasePayload`.

### 1.1 `IngestedCasePayload` Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "IngestedCasePayload",
  "type": "object",
  "required": ["case_id", "documents", "raw_entities", "raw_facts"],
  "properties": {
    "case_id": { "type": "string" },
    "case_type": {
      "type": "string",
      "enum": ["LOAN_VERIFICATION", "INSURANCE_CLAIM", "GRANT_APPLICATION", "GENERAL"]
    },
    "documents": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["document_id", "document_name", "doc_type"],
        "properties": {
          "document_id": { "type": "string" },
          "document_name": { "type": "string" },
          "doc_type": { "type": "string" },
          "page_count": { "type": "integer" },
          "upload_timestamp": { "type": "string", "format": "date-time" }
        }
      }
    },
    "raw_entities": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["mention_id", "raw_name", "entity_type", "evidence"],
        "properties": {
          "mention_id": { "type": "string" },
          "raw_name": { "type": "string" },
          "entity_type": { "type": "string", "enum": ["PERSON", "ORGANIZATION", "ACCOUNT", "ASSET", "LOCATION", "IDENTIFIER"] },
          "identifiers": { "type": "object" },
          "evidence": { "$ref": "#/$defs/EvidenceSource" }
        }
      }
    },
    "raw_facts": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["fact_id", "attribute", "raw_value", "evidence"],
        "properties": {
          "fact_id": { "type": "string" },
          "entity_mention_id": { "type": "string" },
          "raw_entity_name": { "type": "string" },
          "attribute": { "type": "string" },
          "raw_value": { "type": ["string", "number"] },
          "raw_time": { "type": "string" },
          "context": { "type": "string" },
          "evidence": { "$ref": "#/$defs/EvidenceSource" }
        }
      }
    }
  },
  "$defs": {
    "EvidenceSource": {
      "type": "object",
      "required": ["document_id", "document_name", "page_number", "source_text"],
      "properties": {
        "document_id": { "type": "string" },
        "document_name": { "type": "string" },
        "page_number": { "type": "integer" },
        "source_text": { "type": "string" },
        "context_snippet": { "type": "string" },
        "extraction_confidence": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
      }
    }
  }
}
```

---

## 2. Output Contract: Member 2 $\rightarrow$ Member 3

Member 2 emits the validated intelligence report conforming to `IntelligenceReport`.

### 2.1 Section 13 Finding Schema
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Finding",
  "type": "object",
  "required": [
    "finding_id",
    "type",
    "severity",
    "title",
    "description",
    "facts",
    "evidence",
    "confidence",
    "recommended_action"
  ],
  "properties": {
    "finding_id": { "type": "string" },
    "type": {
      "type": "string",
      "enum": [
        "CONTRADICTION",
        "POSSIBLE_CONTRADICTION",
        "TEMPORAL_CHANGE",
        "CONSISTENT",
        "MISSING_INFORMATION",
        "DUPLICATE",
        "RELATED_INFORMATION"
      ]
    },
    "severity": {
      "type": "string",
      "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFORMATIONAL"]
    },
    "title": { "type": "string" },
    "description": { "type": "string" },
    "facts": { "type": "array" },
    "evidence": {
      "type": "array",
      "items": { "$ref": "#/$defs/EvidenceSource" }
    },
    "confidence": {
      "type": "object",
      "required": ["level", "score", "factors", "explanation"],
      "properties": {
        "level": { "type": "string", "enum": ["HIGH", "MEDIUM", "LOW"] },
        "score": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "factors": {
          "type": "object",
          "properties": {
            "extraction_confidence": { "type": "number" },
            "entity_match_confidence": { "type": "number" },
            "normalization_certainty": { "type": "number" },
            "source_quality": { "type": "number" },
            "comparison_certainty": { "type": "number" },
            "evidence_completeness": { "type": "number" }
          }
        },
        "explanation": { "type": "string" }
      }
    },
    "recommended_action": { "type": "string" }
  }
}
```

---

## 3. Core TypeScript Interface Reference

```typescript
export interface ResolvedEntity {
  entity_id: string; // e.g. "PERSON_001"
  canonical_name: string; // e.g. "Ramesh Kumar"
  entity_type: EntityType;
  aliases: string[]; // e.g. ["R. Kumar", "Ramesh K.", "R KUMAR"]
  identifiers: Record<string, string>; // e.g. { pan: "ABCDE1234F", phone: "9876543210" }
  mention_ids: string[];
  confidence_score: number;
  resolution_rationale: string;
}

export interface Fact {
  fact_id: string;
  entity_id: string; // "PERSON_001"
  attribute: string; // Canonical attribute
  normalized_value: NormalizedValue;
  temporal_context: NormalizedTime;
  context: string;
  evidence: EvidenceSource;
  extraction_confidence: number;
}

export interface EntityTimeline {
  entity_id: string;
  canonical_name: string;
  attribute: string;
  events: TimelineEvent[];
  summary: string;
}

export interface MissingInfoItem {
  attribute: string;
  label: string;
  severity: FindingSeverity;
  required_for: string;
  recommended_source: string;
  is_missing: boolean;
}
```
