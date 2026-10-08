/**
 * NEXUS AI — MEMBER 3 INTEGRATION TEST SUITE
 * Systematically tests all orchestrator endpoints, reasoning algorithms, and evidence contracts.
 */

import assert from 'node:assert';

const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('====================================================');
  console.log('NEXUS AI — MEMBER 3 SUITE: AUTOMATED INTEGRATION TESTS');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`[FAIL] ${name}`);
      console.error(`       Error: ${err.message}`);
    }
  }

  // 1. System Health & Pipeline Test
  await test('GET /status returns online pipeline with 6 stages', async () => {
    const res = await fetch(`${BASE_URL}/status`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ONLINE');
    assert.strictEqual(data.nexusCorePipeline.length, 6);
    assert.strictEqual(data.nexusCorePipeline[5].verdict, 'REVIEW_REQUIRED');
  });

  // 2. Metrics Test
  await test('GET /metrics returns calibrated verification dataset metrics', async () => {
    const res = await fetch(`${BASE_URL}/metrics`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.totalDocuments >= 5, 'Must have at least 5 documents');
    assert(data.totalConflicts >= 3, 'Must have at least 3 detected conflicts');
    assert(data.averageConfidence > 0.9, 'Confidence should be > 90%');
  });

  // 3. Documents List Test
  await test('GET /documents returns ingested verification dossier', async () => {
    const res = await fetch(`${BASE_URL}/documents`);
    assert.strictEqual(res.status, 200);
    const docs = await res.json();
    assert(Array.isArray(docs));
    assert(docs.some(d => d.name.includes('Loan_Application')));
    assert(docs.some(d => d.name.includes('Grant_Sanction')));
    assert(docs.some(d => d.name.includes('Bank_Statement')));
  });

  // 4. Ingestion Upload Simulation Test
  await test('POST /documents/upload initiates pipeline ingestion with progress tracking', async () => {
    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filenames: ['Test_Collateral_Evaluation.pdf'] })
    });
    assert.strictEqual(res.status, 202);
    const data = await res.json();
    assert(data.documents.length === 1);
    assert.strictEqual(data.documents[0].status, 'PROCESSING');
  });

  // 5. Findings & Discrepancies Test
  await test('GET /findings returns critical budget discrepancy and salary mismatch', async () => {
    const res = await fetch(`${BASE_URL}/findings`);
    assert.strictEqual(res.status, 200);
    const findings = await res.json();
    const budgetFinding = findings.find(f => f.category === 'BUDGET_DISCREPANCY');
    assert(budgetFinding, 'Budget discrepancy finding must exist');
    assert.strictEqual(budgetFinding.severity, 'CRITICAL');
    assert(budgetFinding.discrepancyDelta.difference.includes('3,40,000'));
    assert(budgetFinding.conflictingFacts.length >= 2);
  });

  // 6. Traceable Evidence Verification Test
  await test('Finding contains full page-level source text traceability', async () => {
    const res = await fetch(`${BASE_URL}/findings`);
    const findings = await res.json();
    const finding = findings[0];
    const factA = finding.conflictingFacts[0];
    assert(factA.source.documentName, 'Source must have document name');
    assert(factA.source.pageNumber > 0, 'Source must have page number');
    assert(factA.source.snippet.length > 10, 'Source must have exact text snippet');
  });

  // 7. Temporal View Test (₹30L -> ₹35L -> ₹42L)
  await test('GET /timeline returns chronological quarterly turnover progression', async () => {
    const res = await fetch(`${BASE_URL}/timeline`);
    assert.strictEqual(res.status, 200);
    const timeline = await res.json();
    assert.strictEqual(timeline.length, 3);
    assert.strictEqual(timeline[0].value, '₹30,00,000');
    assert.strictEqual(timeline[1].value, '₹35,00,000');
    assert.strictEqual(timeline[2].value, '₹42,00,000');
  });

  // 8. Knowledge Graph Test
  await test('GET /graph returns entity nodes and semantic relationship edges', async () => {
    const res = await fetch(`${BASE_URL}/graph`);
    assert.strictEqual(res.status, 200);
    const graph = await res.json();
    assert(graph.nodes.length >= 10);
    assert(graph.edges.length >= 8);
    assert(graph.edges.some(e => e.label.includes('CONTRADICTS')));
  });

  // 9. Grounded Q&A Test — Inconsistencies Query
  await test('POST /qa answers "What information is inconsistent?" without hallucination', async () => {
    const res = await fetch(`${BASE_URL}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What information is inconsistent?' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.answer.includes('Budget discrepancy'));
    assert(data.answer.includes('3,40,000') || data.answer.includes('3.4L'));
    assert(data.citedFacts.length > 0);
    assert(data.confidence > 0.9);
  });

  // 10. Grounded Q&A Test — Temporal Query
  await test('POST /qa answers "What changed over time?" with timeline evidence', async () => {
    const res = await fetch(`${BASE_URL}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What changed over time?' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.answer.includes('₹30,00,000'));
    assert(data.answer.includes('₹42,00,000'));
    assert(data.answer.includes('+40.0%'));
  });

  // 11. Grounded Q&A Test — Income Mismatch Query
  await test('POST /qa answers "Show evidence for the income mismatch."', async () => {
    const res = await fetch(`${BASE_URL}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Show evidence for the income mismatch.' })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert(data.answer.includes('1,80,000'));
    assert(data.answer.includes('1,25,000'));
    assert(data.answer.includes('55,000'));
    assert(data.citedEvidence.some(e => e.documentName.includes('Bank_Statement')));
  });

  // 12. Case Report Generation Test
  await test('GET /report returns decision intelligence dossier with "REVIEW_REQUIRED"', async () => {
    const res = await fetch(`${BASE_URL}/report`);
    assert.strictEqual(res.status, 200);
    const report = await res.json();
    assert.strictEqual(report.decisionStatus, 'REVIEW_REQUIRED');
    assert(report.riskScore > 50, 'Risk score must be elevated');
    assert(report.recommendedHumanActions.length >= 3);
    assert(report.disclaimer.includes('human decision support'));
  });

  // 13. Markdown Report Export Test
  await test('GET /report/markdown returns formatted markdown text', async () => {
    const res = await fetch(`${BASE_URL}/report/markdown`);
    assert.strictEqual(res.status, 200);
    const text = await res.text();
    assert(text.includes('# NEXUS AI — CASE DECISION INTELLIGENCE REPORT'));
    assert(text.includes('REVIEW_REQUIRED'));
  });

  // 14. Reset Test
  await test('POST /reset restores baseline demo state', async () => {
    const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
    assert.strictEqual(res.status, 200);
  });

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passed}/${total} PASSED (${((passed/total)*100).toFixed(0)}%)`);
  console.log('====================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
