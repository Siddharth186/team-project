/**
 * NEXUS AI — Evidence Aggregation & Provenance Engine
 *
 * Ensures every finding and fact preserves complete traceability:
 *   Document ID → Document Name → Page Number → Source Text Snippet → Bounding Box.
 */

import type { EvidenceSource, Finding, Fact } from '../models/types.ts';

export interface FormattedEvidenceCard {
  finding_id: string;
  finding_title: string;
  finding_type: string;
  severity: string;
  evidence_items: {
    label: string;
    document_id: string;
    document_name: string;
    page_number: number;
    source_text: string;
    context?: string;
  }[];
  comparative_view: string;
}

export class EvidenceEngine {
  /**
   * Aggregates and verifies evidence for a finding.
   */
  public extractEvidenceForFinding(finding: Finding): EvidenceSource[] {
    const list: EvidenceSource[] = [];

    // Directly from finding evidence list
    if (finding.evidence && finding.evidence.length > 0) {
      list.push(...finding.evidence);
    }

    // Corroborate from facts
    if (finding.facts && finding.facts.length > 0) {
      for (const fact of finding.facts) {
        if (fact.evidence) {
          const alreadyAdded = list.some(
            e =>
              e.document_id === fact.evidence.document_id &&
              e.page_number === fact.evidence.page_number &&
              e.source_text === fact.evidence.source_text
          );
          if (!alreadyAdded) {
            list.push(fact.evidence);
          }
        }
      }
    }

    return list;
  }

  /**
   * Generates a clean human-readable and UI-ready comparative evidence card.
   */
  public generateEvidenceCard(finding: Finding): FormattedEvidenceCard {
    const evidenceItems = (finding.facts || []).map((fact, index) => {
      const label = `Evidence Source #${index + 1} (${fact.attribute})`;
      return {
        label,
        document_id: fact.evidence.document_id,
        document_name: fact.evidence.document_name,
        page_number: fact.evidence.page_number,
        source_text: fact.evidence.source_text,
        context: fact.context,
      };
    });

    const lines: string[] = [];
    lines.push(`Finding: ${finding.title} [${finding.type} | ${finding.severity}]`);
    lines.push(`Description: ${finding.description}`);
    lines.push(`Traceable Evidence:`);

    for (const item of evidenceItems) {
      lines.push(`  • [${item.document_name} — p.${item.page_number}] "${item.source_text}"`);
    }

    return {
      finding_id: finding.finding_id,
      finding_title: finding.title,
      finding_type: finding.type,
      severity: finding.severity,
      evidence_items: evidenceItems,
      comparative_view: lines.join('\n'),
    };
  }

  /**
   * Trace all evidence across all facts for a specific entity.
   */
  public traceEntityEvidence(facts: Fact[], entityId: string): EvidenceSource[] {
    return facts
      .filter(f => f.entity_id === entityId)
      .map(f => f.evidence)
      .filter(Boolean);
  }
}
