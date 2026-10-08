import test from 'node:test';
import assert from 'node:assert/strict';
import { TemporalEngine } from '../src/temporal/temporal_engine.ts';
import { ContradictionEngine } from '../src/contradiction/contradiction_engine.ts';
import { FactLinker } from '../src/fact_linking/fact_linker.ts';
import type { RawFact, ResolvedEntity } from '../src/models/types.ts';

const mockEntity: ResolvedEntity = {
  entity_id: 'PERSON_001',
  canonical_name: 'Ramesh Kumar',
  entity_type: 'PERSON',
  aliases: ['R. Kumar'],
  identifiers: { pan: 'ABCDE1234F' },
  mention_ids: ['M1'],
  confidence_score: 0.95,
  resolution_rationale: 'Initial',
};

test('Temporal Intelligence: Historical progression across time is NOT classified as contradiction', () => {
  const linker = new FactLinker();
  const rawFacts: RawFact[] = [
    {
      fact_id: 'F1',
      entity_mention_id: 'M1',
      attribute: 'monthly_income',
      raw_value: '₹30,000',
      raw_time: 'January 2024',
      evidence: { document_id: 'D1', document_name: 'BankJan.pdf', page_number: 1, source_text: 'Jan Salary: ₹30,000' },
    },
    {
      fact_id: 'F2',
      entity_mention_id: 'M1',
      attribute: 'monthly_income',
      raw_value: '₹35,000',
      raw_time: 'April 2024',
      evidence: { document_id: 'D2', document_name: 'BankApr.pdf', page_number: 1, source_text: 'Apr Salary: ₹35,000' },
    },
    {
      fact_id: 'F3',
      entity_mention_id: 'M1',
      attribute: 'monthly_income',
      raw_value: '₹42,000',
      raw_time: 'August 2024',
      evidence: { document_id: 'D3', document_name: 'BankAug.pdf', page_number: 1, source_text: 'Aug Salary: ₹42,000' },
    },
  ];

  const facts = linker.linkFacts(rawFacts, [mockEntity]);
  const clusters = linker.clusterFacts(facts);

  const contradictionEngine = new ContradictionEngine();
  const findings = contradictionEngine.analyzeClusters(clusters);

  // All pair comparisons across different dates should be TEMPORAL_CHANGE, NOT CONTRADICTION!
  assert.ok(findings.length > 0);
  for (const f of findings) {
    assert.equal(f.type, 'TEMPORAL_CHANGE');
    assert.notEqual(f.type, 'CONTRADICTION');
  }

  // Verify timeline construction
  const temporalEngine = new TemporalEngine();
  const timelines = temporalEngine.buildTimelines(facts, [mockEntity]);

  assert.equal(timelines.length, 1);
  const timeline = timelines[0];
  assert.equal(timeline.entity_id, 'PERSON_001');
  assert.equal(timeline.attribute, 'monthly_income');
  assert.equal(timeline.events.length, 3);

  // Chronological verification
  assert.equal(timeline.events[0].date_string, '2024-01');
  assert.equal(timeline.events[0].value.parsed_numeric, 30000);
  assert.equal(timeline.events[1].date_string, '2024-04');
  assert.equal(timeline.events[1].value.parsed_numeric, 35000);
  assert.equal(timeline.events[2].date_string, '2024-08');
  assert.equal(timeline.events[2].value.parsed_numeric, 42000);

  // Delta verification
  assert.equal(timeline.events[1].delta_from_previous?.numeric_delta, 5000);
  assert.equal(timeline.events[1].delta_from_previous?.direction, 'INCREASE');
  assert.equal(timeline.events[2].delta_from_previous?.numeric_delta, 7000);
  assert.equal(timeline.events[2].delta_from_previous?.direction, 'INCREASE');

  assert.ok(timeline.summary.includes('increased'));
  assert.ok(timeline.summary.includes('Net change: +12,000'));
});
