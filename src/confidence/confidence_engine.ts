/**
 * NEXUS AI — Multi-Signal Confidence Engine
 *
 * Replaces naive LLM confidence with a transparent, multi-signal scoring model:
 *   1. Extraction Confidence (from Member 1 OCR / parser)
 *   2. Entity Match Confidence (from Entity Resolution)
 *   3. Normalization Certainty (from deterministic normalizers)
 *   4. Source Document Quality (official bank/gov doc vs self-declaration)
 *   5. Comparison Certainty (mathematical precision vs fuzzy text)
 *   6. Evidence Completeness (traceability to doc, page, text)
 */

import type { Fact, FindingType, ConfidenceAssessment, ConfidenceLevel } from '../models/types.ts';

export interface ConfidenceInput {
  facts: Fact[];
  comparisonType: FindingType;
  valueDiscrepancy?: number;
  entityMatchScore?: number;
}

export class ConfidenceEngine {
  /**
   * Calculates a composite multi-signal confidence assessment for a finding or fact set.
   */
  public calculateConfidence(input: ConfidenceInput): ConfidenceAssessment {
    const { facts, comparisonType } = input;

    // 1. Extraction Confidence
    let avgExtraction = 0.90;
    if (facts.length > 0) {
      const sum = facts.reduce((acc, f) => acc + (f.extraction_confidence || 0.85), 0);
      avgExtraction = sum / facts.length;
    }

    // 2. Entity Match Confidence
    const entityMatchConfidence = input.entityMatchScore !== undefined ? input.entityMatchScore : 0.92;

    // 3. Normalization Certainty
    let normCertainty = 0.98;
    for (const f of facts) {
      if (f.normalized_value.data_type === 'CURRENCY' || f.normalized_value.data_type === 'NUMBER') {
        normCertainty = Math.min(normCertainty, 0.98);
      } else if (f.normalized_value.data_type === 'DATE') {
        normCertainty = Math.min(normCertainty, 0.95);
      } else {
        normCertainty = Math.min(normCertainty, 0.88);
      }
    }

    // 4. Source Document Quality
    let sourceQuality = 0.85;
    for (const f of facts) {
      const docName = (f.evidence?.document_name || '').toLowerCase();
      if (
        docName.includes('bank') ||
        docName.includes('statement') ||
        docName.includes('pan') ||
        docName.includes('passport') ||
        docName.includes('tax') ||
        docName.includes('itr')
      ) {
        sourceQuality = Math.max(sourceQuality, 0.95);
      }
    }

    // 5. Comparison Certainty
    let comparisonCertainty = 0.95;
    if (comparisonType === 'CONTRADICTION' || comparisonType === 'CONSISTENT') {
      comparisonCertainty = 0.98; // Deterministic calculation
    } else if (comparisonType === 'POSSIBLE_CONTRADICTION') {
      comparisonCertainty = 0.75;
    } else if (comparisonType === 'TEMPORAL_CHANGE') {
      comparisonCertainty = 0.92;
    }

    // 6. Evidence Completeness
    let evidenceCompleteness = 1.0;
    for (const f of facts) {
      if (!f.evidence) {
        evidenceCompleteness -= 0.5;
        continue;
      }
      if (!f.evidence.document_id || !f.evidence.document_name) evidenceCompleteness -= 0.2;
      if (f.evidence.page_number === undefined || f.evidence.page_number <= 0) evidenceCompleteness -= 0.2;
      if (!f.evidence.source_text || f.evidence.source_text.trim() === '') evidenceCompleteness -= 0.2;
    }
    evidenceCompleteness = Math.max(0.2, Math.min(1.0, evidenceCompleteness));

    // Weighted composite calculation
    const weightedScore =
      0.20 * avgExtraction +
      0.20 * entityMatchConfidence +
      0.15 * normCertainty +
      0.15 * sourceQuality +
      0.15 * comparisonCertainty +
      0.15 * evidenceCompleteness;

    const roundedScore = Math.round(weightedScore * 100) / 100;

    let level: ConfidenceLevel = 'HIGH';
    if (roundedScore < 0.65) {
      level = 'LOW';
    } else if (roundedScore < 0.82) {
      level = 'MEDIUM';
    }

    const explanation = `Multi-signal assessment: Extraction ${(avgExtraction * 100).toFixed(0)}%, Entity Match ${(entityMatchConfidence * 100).toFixed(0)}%, Normalization ${(normCertainty * 100).toFixed(0)}%, Source Quality ${(sourceQuality * 100).toFixed(0)}%, Deterministic Comparison ${(comparisonCertainty * 100).toFixed(0)}%, Provenance Evidence ${(evidenceCompleteness * 100).toFixed(0)}%. Composite: ${(roundedScore * 100).toFixed(0)}% (${level}).`;

    return {
      level,
      score: roundedScore,
      factors: {
        extraction_confidence: Math.round(avgExtraction * 100) / 100,
        entity_match_confidence: Math.round(entityMatchConfidence * 100) / 100,
        normalization_certainty: Math.round(normCertainty * 100) / 100,
        source_quality: Math.round(sourceQuality * 100) / 100,
        comparison_certainty: Math.round(comparisonCertainty * 100) / 100,
        evidence_completeness: Math.round(evidenceCompleteness * 100) / 100,
      },
      explanation,
    };
  }
}
