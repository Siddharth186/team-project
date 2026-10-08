import test from 'node:test';
import assert from 'node:assert/strict';
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

test('Contradiction Engine: Same fact, same value across documents produces CONSISTENT finding', () => {
  const linker = new FactLinker();
  const rawFacts: RawFact[] = [
    {
      fact_id: 'F1',
      entity_mention_id: 'M1',
      attribute: 'salary_credit',
      raw_value: '₹31,500',
      raw_time: 'March 2024',
      evidence: { document_id: 'D1', document_name: 'BankStatement.pdf', page_number: 3, source_text: 'Salary credit ₹31,500' },
    },
    {
      fact_id: 'F2',
      entity_mention_id: 'M1',
      attribute: 'salary',
      raw_value: '31500 INR',
      raw_time: 'March 2024',
      evidence: { document_id: 'D2', document_name: 'SalarySlip.pdf', page_number: 1, source_text: 'Net Pay Rs. 31,500' },
    },
  ];

  const facts = linker.linkFacts(rawFacts, [mockEntity]);
  const clusters = linker.clusterFacts(facts);

  const engine = new ContradictionEngine();
  const findings = engine.analyzeClusters(clusters);

  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, 'CONSISTENT');
  assert.equal(findings[0].severity, 'INFORMATIONAL');
  assert.equal(findings[0].evidence.length, 2);
  assert.equal(findings[0].evidence[0].document_name, 'BankStatement.pdf');
  assert.equal(findings[0].evidence[1].document_name, 'SalarySlip.pdf');
});

test('Contradiction Engine: Duplicate fact in same document produces DUPLICATE finding', () => {
  const linker = new FactLinker();
  const rawFacts: RawFact[] = [
    {
      fact_id: 'F1',
      entity_mention_id: 'M1',
      attribute: 'pan_number',
      raw_value: 'ABCDE1234F',
      evidence: { document_id: 'D1', document_name: 'Application.pdf', page_number: 1, source_text: 'PAN: ABCDE1234F' },
    },
    {
      fact_id: 'F2',
      entity_mention_id: 'M1',
      attribute: 'pan_number',
      raw_value: 'ABCDE1234F',
      evidence: { document_id: 'D1', document_name: 'Application.pdf', page_number: 3, source_text: 'PAN: ABCDE1234F' },
    },
  ];

  const facts = linker.linkFacts(rawFacts, [mockEntity]);
  const clusters = linker.clusterFacts(facts);

  const engine = new ContradictionEngine();
  const findings = engine.analyzeClusters(clusters);

  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, 'DUPLICATE');
  assert.equal(findings[0].severity, 'INFORMATIONAL');
});

test('Contradiction Engine: Different values for same timeframe produce CONTRADICTION finding', () => {
  const linker = new FactLinker();
  const rawFacts: RawFact[] = [
    {
      fact_id: 'F1',
      entity_mention_id: 'M1',
      attribute: 'monthly_income',
      raw_value: '₹42,000',
      raw_time: 'March 2024',
      evidence: { document_id: 'D1', document_name: 'Application.pdf', page_number: 2, source_text: 'Monthly income: ₹42,000' },
    },
    {
      fact_id: 'F2',
      entity_mention_id: 'M1',
      attribute: 'salary_credit',
      raw_value: '₹31,500',
      raw_time: 'March 2024',
      evidence: { document_id: 'D2', document_name: 'BankStatement.pdf', page_number: 3, source_text: 'Salary credit: ₹31,500' },
    },
  ];

  const facts = linker.linkFacts(rawFacts, [mockEntity]);
  const clusters = linker.clusterFacts(facts);

  const engine = new ContradictionEngine();
  const findings = engine.analyzeClusters(clusters);

  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, 'CONTRADICTION');
  assert.equal(findings[0].severity, 'HIGH');
  assert.ok(findings[0].description.includes('Discrepancy'));
  assert.equal(findings[0].evidence.length, 2);
  assert.equal(findings[0].evidence[0].source_text, 'Monthly income: ₹42,000');
  assert.equal(findings[0].evidence[1].source_text, 'Salary credit: ₹31,500');
});

test('Contradiction Engine: Conflicting invariant identity attribute (Date of Birth) produces CRITICAL finding', () => {
  const linker = new FactLinker();
  const rawFacts: RawFact[] = [
    {
      fact_id: 'F1',
      entity_mention_id: 'M1',
      attribute: 'date_of_birth',
      raw_value: '15/04/1985',
      evidence: { document_id: 'D1', document_name: 'Application.pdf', page_number: 1, source_text: 'DOB: 15/04/1985' },
    },
    {
      fact_id: 'F2',
      entity_mention_id: 'M1',
      attribute: 'date_of_birth',
      raw_value: '21/04/1985',
      evidence: { document_id: 'D2', document_name: 'Passport.pdf', page_number: 1, source_text: 'Date of Birth: 21/04/1985' },
    },
  ];

  const facts = linker.linkFacts(rawFacts, [mockEntity]);
  const clusters = linker.clusterFacts(facts);

  const engine = new ContradictionEngine();
  const findings = engine.analyzeClusters(clusters);

  assert.equal(findings.length, 1);
  assert.equal(findings[0].type, 'CONTRADICTION');
  assert.equal(findings[0].severity, 'CRITICAL');
  assert.ok(findings[0].title.includes('Identity Discrepancy'));
});
