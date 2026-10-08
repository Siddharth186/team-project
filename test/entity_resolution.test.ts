import test from 'node:test';
import assert from 'node:assert/strict';
import { EntityResolver, compareNameVariants } from '../src/entity_resolution/entity_resolver.ts';
import type { RawEntityMention } from '../src/models/types.ts';

test('Name Variant Comparison: Initials and tokens', () => {
  const c1 = compareNameVariants('Ramesh Kumar', 'R. Kumar');
  assert.equal(c1.matches, true);
  assert.ok(c1.score >= 0.85);

  const c2 = compareNameVariants('Ramesh Kumar', 'Ramesh K.');
  assert.equal(c2.matches, true);
  assert.ok(c2.score >= 0.85);

  const c3 = compareNameVariants('Ramesh Kumar', 'R KUMAR');
  assert.equal(c3.matches, true);
  assert.ok(c3.score >= 0.85);

  const c4 = compareNameVariants('Ramesh Kumar', 'Siddharth Sharma');
  assert.equal(c4.matches, false);
});

test('Entity Resolution: Same entity with multiple name variations resolves to single canonical entity', () => {
  const resolver = new EntityResolver();
  const mentions: RawEntityMention[] = [
    {
      mention_id: 'M1',
      raw_name: 'Mr. Ramesh Kumar',
      entity_type: 'PERSON',
      identifiers: { pan: 'ABCDE1234F' },
      evidence: { document_id: 'D1', document_name: 'Doc1.pdf', page_number: 1, source_text: 'Ramesh Kumar' },
    },
    {
      mention_id: 'M2',
      raw_name: 'R. Kumar',
      entity_type: 'PERSON',
      identifiers: { pan: 'ABCDE1234F' },
      evidence: { document_id: 'D2', document_name: 'Doc2.pdf', page_number: 1, source_text: 'R. Kumar' },
    },
    {
      mention_id: 'M3',
      raw_name: 'Ramesh K.',
      entity_type: 'PERSON',
      identifiers: {},
      evidence: { document_id: 'D3', document_name: 'Doc3.pdf', page_number: 1, source_text: 'Ramesh K.' },
    },
    {
      mention_id: 'M4',
      raw_name: 'R KUMAR',
      entity_type: 'PERSON',
      identifiers: { pan: 'ABCDE1234F' },
      evidence: { document_id: 'D4', document_name: 'Doc4.pdf', page_number: 1, source_text: 'R KUMAR' },
    },
  ];

  const resolved = resolver.resolveEntities(mentions);

  assert.equal(resolved.length, 1);
  const canonical = resolved[0];
  assert.equal(canonical.entity_id, 'PERSON_001');
  assert.equal(canonical.canonical_name, 'Ramesh Kumar');
  assert.equal(canonical.mention_ids.length, 4);
  assert.equal(canonical.identifiers['pan'], 'ABCDE1234F');
  assert.ok(canonical.confidence_score >= 0.90);
});

test('Entity Resolution Disambiguation Guard: Identical name with conflicting PAN must NOT be merged', () => {
  const resolver = new EntityResolver();
  const mentions: RawEntityMention[] = [
    {
      mention_id: 'M1',
      raw_name: 'Amit Sharma',
      entity_type: 'PERSON',
      identifiers: { pan: 'AAAAA1111A' },
      evidence: { document_id: 'D1', document_name: 'App1.pdf', page_number: 1, source_text: 'Amit Sharma' },
    },
    {
      mention_id: 'M2',
      raw_name: 'Amit Sharma',
      entity_type: 'PERSON',
      identifiers: { pan: 'BBBBB2222B' }, // Conflicting PAN!
      evidence: { document_id: 'D2', document_name: 'App2.pdf', page_number: 1, source_text: 'Amit Sharma' },
    },
  ];

  const resolved = resolver.resolveEntities(mentions);

  // Must yield 2 distinct entities because PAN numbers conflict!
  assert.equal(resolved.length, 2);
  assert.equal(resolved[0].entity_id, 'PERSON_001');
  assert.equal(resolved[1].entity_id, 'PERSON_002');
  assert.equal(resolved[0].identifiers['pan'], 'AAAAA1111A');
  assert.equal(resolved[1].identifiers['pan'], 'BBBBB2222B');
});
