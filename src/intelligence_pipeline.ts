/**
 * NEXUS AI — Master Information Intelligence Pipeline (Member 2 Engine)
 *
 * Coordinates end-to-end processing:
 *   Raw Extracted Inputs (Member 1)
 *     ↓
 *   Multi-Signal Entity Resolution
 *     ↓
 *   Fact Linking & Deterministic Value Normalization
 *     ↓
 *   Cross-Document Contradiction & Consistency Detection
 *     ↓
 *   Missing Information & Document Gap Auditing
 *     ↓
 *   Temporal Timeline Analysis & Trend Evaluation
 *     ↓
 *   Multi-Signal Confidence & Evidence Aggregation
 *     ↓
 *   Validated Intelligence Report (Member 3 Interface)
 */

import type {
  IngestedCasePayload,
  IntelligenceReport,
  Finding,
  FindingType,
} from './models/types.ts';
import { EntityResolver } from './entity_resolution/entity_resolver.ts';
import { FactLinker } from './fact_linking/fact_linker.ts';
import { ContradictionEngine } from './contradiction/contradiction_engine.ts';
import { MissingInfoEngine } from './missing_info/missing_info_engine.ts';
import { TemporalEngine } from './temporal/temporal_engine.ts';
import { EvidenceEngine } from './evidence/evidence_engine.ts';
import { ConfidenceEngine } from './confidence/confidence_engine.ts';

export class IntelligencePipeline {
  private entityResolver: EntityResolver;
  private factLinker: FactLinker;
  private contradictionEngine: ContradictionEngine;
  private missingInfoEngine: MissingInfoEngine;
  private temporalEngine: TemporalEngine;
  private evidenceEngine: EvidenceEngine;
  private confidenceEngine: ConfidenceEngine;

  constructor() {
    this.confidenceEngine = new ConfidenceEngine();
    this.entityResolver = new EntityResolver();
    this.factLinker = new FactLinker();
    this.contradictionEngine = new ContradictionEngine(this.confidenceEngine);
    this.missingInfoEngine = new MissingInfoEngine(this.confidenceEngine);
    this.temporalEngine = new TemporalEngine();
    this.evidenceEngine = new EvidenceEngine();
  }

  /**
   * Processes an ingested case payload and generates a complete IntelligenceReport.
   */
  public processCase(payload: IngestedCasePayload): IntelligenceReport {
    // 1. Multi-signal Entity Resolution
    const resolvedEntities = this.entityResolver.resolveEntities(payload.raw_entities || []);

    // 2. Fact Linking & Value Normalization
    const linkedFacts = this.factLinker.linkFacts(payload.raw_facts || [], resolvedEntities);

    // 3. Fact Clustering
    const factClusters = this.factLinker.clusterFacts(linkedFacts);

    // 4. Cross-Document Contradiction & Consistency Detection
    const contradictionFindings = this.contradictionEngine.analyzeClusters(factClusters);

    // 5. Missing Information Evaluation
    const { items: missingItems, findings: missingFindings } =
      this.missingInfoEngine.evaluateMissingInformation(
        linkedFacts,
        payload.documents || [],
        resolvedEntities
      );

    // Combine all findings
    const allFindings: Finding[] = [...contradictionFindings, ...missingFindings];

    // 6. Temporal Timelines
    const timelines = this.temporalEngine.buildTimelines(linkedFacts, resolvedEntities);

    // 7. Calculate Summary Statistics
    const findingsByType: Record<FindingType, number> = {
      CONTRADICTION: 0,
      POSSIBLE_CONTRADICTION: 0,
      TEMPORAL_CHANGE: 0,
      CONSISTENT: 0,
      MISSING_INFORMATION: 0,
      DUPLICATE: 0,
      RELATED_INFORMATION: 0,
    };

    let criticalCount = 0;
    let highCount = 0;

    for (const f of allFindings) {
      findingsByType[f.type] = (findingsByType[f.type] || 0) + 1;
      if (f.severity === 'CRITICAL') criticalCount++;
      if (f.severity === 'HIGH') highCount++;
    }

    let verificationStatus: IntelligenceReport['summary']['verification_status'] = 'VERIFIED';
    if (criticalCount > 0) {
      verificationStatus = 'HIGH_RISK';
    } else if (highCount > 0 || findingsByType['CONTRADICTION'] > 0) {
      verificationStatus = 'FLAGGED_FOR_REVIEW';
    } else if (findingsByType['MISSING_INFORMATION'] > 0) {
      verificationStatus = 'INCOMPLETE';
    }

    return {
      case_id: payload.case_id,
      generated_at: new Date().toISOString(),
      summary: {
        total_documents: payload.documents?.length || 0,
        total_raw_facts: payload.raw_facts?.length || 0,
        total_resolved_entities: resolvedEntities.length,
        findings_count_by_type: findingsByType,
        critical_findings_count: criticalCount,
        high_findings_count: highCount,
        verification_status: verificationStatus,
      },
      resolved_entities: resolvedEntities,
      findings: allFindings,
      timelines,
      missing_information: missingItems,
      all_facts: linkedFacts,
    };
  }

  public getEvidenceEngine(): EvidenceEngine {
    return this.evidenceEngine;
  }
}
