import test from 'node:test';
import assert from 'node:assert/strict';
import { MissingInfoEngine } from '../src/missing_info/missing_info_engine.ts';
import { FactLinker } from '../src/fact_linking/fact_linker.ts';
import type { RawFact, IngestedDocumentInfo, ResolvedEntity } from '../src/models/types.ts';

test('Missing Information Engine: Accurately flags missing required checklist fields', () => {
  const linker = new FactLinker();
  const mockEntity: ResolvedEntity = {
    entity_id: 'PERSON_001',
    canonical_name: 'Ramesh Kumar',
    entity_type: 'PERSON',
    aliases: [],
    identifiers: { pan: 'ABCDE1234F', account_number: '123456789' },
    mention_ids: ['M1'],
    confidence_score: 0.95,
    resolution_rationale: 'Init',
  };

  const rawFacts: RawFact[] = [
    {
      fact_id: 'F1',
      attribute: 'monthly_income',
      raw_value: '₹42,000',
      evidence: { document_id: 'D1', document_name: 'Salary.pdf', page_number: 1, source_text: 'Income ₹42,000' },
    },
    {
      fact_id: 'F2',
      attribute: 'employment_status',
      raw_value: 'Salaried',
      evidence: { document_id: 'D1', document_name: 'Salary.pdf', page_number: 1, source_text: 'Salaried' },
    },
    {
      fact_id: 'F3',
      attribute: 'date_of_birth',
      raw_value: '1985-04-15',
      evidence: { document_id: 'D1', document_name: 'Salary.pdf', page_number: 1, source_text: '1985-04-15' },
    },
  ];

  const facts = linker.linkFacts(rawFacts, [mockEntity]);
  const docs: IngestedDocumentInfo[] = [
    { document_id: 'D1', document_name: 'Salary.pdf', doc_type: 'BANK_STATEMENT' },
  ];

  const engine = new MissingInfoEngine();
  const result = engine.evaluateMissingInformation(facts, docs, [mockEntity]);

  // Address and Signature must be missing
  const addressItem = result.items.find(i => i.attribute === 'address');
  assert.equal(addressItem?.is_missing, true);

  const sigItem = result.items.find(i => i.attribute === 'signature');
  assert.equal(sigItem?.is_missing, true);

  // Present fields
  const nameItem = result.items.find(i => i.attribute === 'name');
  assert.equal(nameItem?.is_missing, false);

  const incomeItem = result.items.find(i => i.attribute === 'monthly_income');
  assert.equal(incomeItem?.is_missing, false);

  // Findings emitted
  const missingFindings = result.findings.filter(f => f.type === 'MISSING_INFORMATION');
  assert.ok(missingFindings.some(f => f.title.includes('Residential Address')));
  assert.ok(missingFindings.some(f => f.title.includes('Applicant Signature')));
});

test('Missing Information Engine: Detects missing mandatory document type', () => {
  const engine = new MissingInfoEngine();
  const docsWithoutBankStmt: IngestedDocumentInfo[] = [
    { document_id: 'D1', document_name: 'Application.pdf', doc_type: 'LOAN_APPLICATION' },
  ];

  const result = engine.evaluateMissingInformation([], docsWithoutBankStmt, []);

  assert.ok(
    result.findings.some(f => f.title.includes('Missing Document Package: Official Bank Statement'))
  );
});
