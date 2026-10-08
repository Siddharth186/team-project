/**
 * NEXUS AI — Temporal Analysis & Timeline Engine
 *
 * Constructs chronological timelines of entity attributes across documents:
 * Examples:
 *   - "Monthly income increased from ₹30K (Jan 2024) → ₹35K (Apr 2024) → ₹42K (Aug 2024)."
 *   - "Budget revised: ₹10L (Jan) → ₹12L (Mar) → ₹15L (Jun)."
 */

import type {
  Fact,
  ResolvedEntity,
  EntityTimeline,
  TimelineEvent,
  TimeGranularity,
} from '../models/types.ts';

export class TemporalEngine {
  /**
   * Constructs timelines for all entities and temporal attributes.
   */
  public buildTimelines(facts: Fact[], resolvedEntities: ResolvedEntity[]): EntityTimeline[] {
    const timelines: EntityTimeline[] = [];

    // Map entity ID to entity object
    const entityMap = new Map<string, ResolvedEntity>();
    for (const ent of resolvedEntities) {
      entityMap.set(ent.entity_id, ent);
    }

    // Group facts by (entity_id, attribute)
    const groups = new Map<string, Fact[]>();

    for (const fact of facts) {
      // Must have some temporal indicator
      if (!fact.temporal_context || fact.temporal_context.granularity === 'UNSPECIFIED') {
        continue;
      }

      const key = `${fact.entity_id}::${fact.attribute}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(fact);
    }

    // Build timeline for each group having >= 2 chronological entries or significant event
    for (const [key, groupFacts] of groups) {
      if (groupFacts.length < 2) continue;

      const [entityId, attribute] = key.split('::');
      const entity = entityMap.get(entityId);
      const canonicalName = entity?.canonical_name || entityId;

      // Sort facts chronologically
      const sortedFacts = [...groupFacts].sort((a, b) => {
        const timeA = a.temporal_context.iso_timestamp || a.temporal_context.date_string || '';
        const timeB = b.temporal_context.iso_timestamp || b.temporal_context.date_string || '';
        return timeA.localeCompare(timeB);
      });

      const events: TimelineEvent[] = [];

      for (let i = 0; i < sortedFacts.length; i++) {
        const f = sortedFacts[i];
        const dateStr = f.temporal_context.date_string || f.temporal_context.raw_time || 'Unspecified';

        let deltaFromPrev: TimelineEvent['delta_from_previous'] = undefined;

        if (i > 0) {
          const prevFact = sortedFacts[i - 1];
          const currNum = f.normalized_value.parsed_numeric;
          const prevNum = prevFact.normalized_value.parsed_numeric;

          if (currNum !== undefined && prevNum !== undefined) {
            const numDelta = currNum - prevNum;
            const pct = prevNum !== 0 ? (numDelta / prevNum) * 100 : 0;
            const direction =
              numDelta > 0 ? 'INCREASE' : numDelta < 0 ? 'DECREASE' : 'UNCHANGED';

            deltaFromPrev = {
              numeric_delta: Math.round(numDelta * 100) / 100,
              percentage_change: Math.round(pct * 10) / 10,
              direction,
            };
          } else {
            deltaFromPrev = {
              direction:
                f.normalized_value.standardized_representation !==
                prevFact.normalized_value.standardized_representation
                  ? 'MODIFIED'
                  : 'UNCHANGED',
            };
          }
        }

        events.push({
          event_id: `EVT_${entityId}_${i + 1}`,
          date_string: dateStr,
          iso_timestamp: f.temporal_context.iso_timestamp,
          granularity: f.temporal_context.granularity,
          attribute: f.attribute,
          value: f.normalized_value,
          fact_id: f.fact_id,
          document_name: f.evidence.document_name,
          page_number: f.evidence.page_number,
          source_text: f.evidence.source_text,
          delta_from_previous: deltaFromPrev,
        });
      }

      // Generate natural narrative summary
      const summary = this.generateNarrativeSummary(canonicalName, attribute, events);

      timelines.push({
        entity_id: entityId,
        canonical_name: canonicalName,
        attribute,
        events,
        summary,
      });
    }

    return timelines;
  }

  private generateNarrativeSummary(
    entityName: string,
    attribute: string,
    events: TimelineEvent[]
  ): string {
    if (events.length === 0) return '';
    if (events.length === 1) {
      return `${entityName}'s ${attribute} was ${events[0].value.standardized_representation} on ${events[0].date_string}.`;
    }

    const trajectory = events
      .map(e => `${e.value.standardized_representation} (${e.date_string})`)
      .join(' → ');

    const first = events[0];
    const last = events[events.length - 1];

    if (
      first.value.parsed_numeric !== undefined &&
      last.value.parsed_numeric !== undefined
    ) {
      const netDelta = last.value.parsed_numeric - first.value.parsed_numeric;
      const netPct =
        first.value.parsed_numeric !== 0
          ? ((netDelta / first.value.parsed_numeric) * 100).toFixed(1)
          : '0';
      const dirWord = netDelta > 0 ? 'increased' : netDelta < 0 ? 'decreased' : 'remained steady';
      const sign = netDelta > 0 ? '+' : '';

      return `${entityName}'s ${attribute} ${dirWord} across ${events.length} records: ${trajectory}. Net change: ${sign}${netDelta.toLocaleString()} (${sign}${netPct}%).`;
    }

    return `${entityName}'s ${attribute} transitioned: ${trajectory}.`;
  }
}
