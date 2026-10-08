import test from 'node:test';
import assert from 'node:assert/strict';
import { ConfidenceEngine } from '../src/confidence/confidence_engine.ts';
import type { Fact } from '../src/models/types.ts';

test('Confidence Engine: Multi-signal evaluation with official source yields HIGH confidence', () => {
  const engine = new ConfidenceEngine();

  const mockFact: Fact = {
    fact_id: 'F1',
    entity_id: 'PERSON_001',
    attribute: 'monthly_income',
    normalized_value: {
      data_type: 'CURRENCY',
      raw_value: '₹31,500',
      parsed_numeric: 31500,
      standardized_representation: 'INR:31500.00',
    },
    temporal_context: { granularity: 'MONTH', date_string: '2024-03' },
    context: 'Official bank salary credit',
    evidence: {
      document_id: 'DOC_1',
      document_name: 'BankStatement.pdf',
      page_number: 3,
      source_text: 'SALARY CREDIT : ₹31,500.00',
      extraction_confidence: 0.98,
    },
    extraction_confidence: 0.98,
  };

  const assessment = engine.calculateConfidence({
    facts: [mockFact],
    comparisonType: 'CONSISTENT',
    entityMatchScore: 0.95,
  });

  assert.equal(assessment.level, 'HIGH');
  assert.ok(assessment.score >= 0.90);
  assert.equal(assessment.factors.extraction_confidence, 0.98);
  assert.equal(assessment.factors.normalization_certainty, 0.98);
  assert.equal(assessment.factors.source_quality, 0.95);
  assert.equal(assessment.factors.evidence_completeness, 1.0);
  assert.ok(assessment.explanation.includes('Multi-signal assessment'));
});

test('Confidence Engine: Degraded evidence produces lower score', () => {
  const engine = new ConfidenceEngine();

  const degradedFact: Fact = {
    fact_id: 'F2',
    entity_id: 'UNKNOWN',
    attribute: 'note',
    normalized_value: {
      data_type: 'TEXT',
      raw_value: 'maybe 20k',
      standardized_representation: 'maybe 20k',
    },
    temporal_context: { granularity: 'UNSPECIFIED' },
    context: '',
    evidence: {
      document_id: '',
      document_name: 'ScratchPad.txt',
      page_number: 0,
      source_text: '',
      extraction_confidence: 0.40,
    },
    extraction_confidence: 0.40,
  };

  const assessment = engine.calculateConfidence({
    facts: [degradedFact],
    comparisonType: 'POSSIBLE_CONTRADICTION',
    entityMatchScore: 0.50,
  });

  assert.ok(assessment.score < 0.70);
  assert.ok(assessment.level === 'LOW' || assessment.level === 'MEDIUM');
});
