import test from 'node:test';
import assert from 'node:assert/strict';
import { IntelligencePipeline } from '../src/intelligence_pipeline.ts';
import { IntelligenceServer } from '../src/api/server.ts';
import { LOAN_CASE_STUDY } from '../src/demo.ts';

test('End-to-End Pipeline: Processes Loan Case Study accurately', () => {
  const pipeline = new IntelligencePipeline();
  const report = pipeline.processCase(LOAN_CASE_STUDY);

  assert.equal(report.case_id, 'CASE-LOAN-2026-8841');
  assert.equal(report.summary.total_documents, 4);
  assert.equal(report.summary.total_resolved_entities, 1);
  assert.equal(report.resolved_entities[0].canonical_name, 'Ramesh Kumar');

  // Verify contradiction detected
  const contradictions = report.findings.filter(f => f.type === 'CONTRADICTION');
  assert.ok(contradictions.length > 0);
  const incomeContradiction = contradictions.find(c => c.title.includes('monthly_income'));
  assert.ok(incomeContradiction);
  assert.equal(incomeContradiction?.severity, 'HIGH');

  // Verify consistent facts detected
  const consistent = report.findings.filter(f => f.type === 'CONSISTENT');
  assert.ok(consistent.length > 0);

  // Verify missing info detected
  const missing = report.findings.filter(f => f.type === 'MISSING_INFORMATION');
  assert.ok(missing.some(m => m.title.includes('Residential Address')));
  assert.ok(missing.some(m => m.title.includes('Applicant Signature')));

  // Verify timeline generated
  assert.ok(report.timelines.length > 0);
  assert.equal(report.timelines[0].attribute, 'monthly_income');
  assert.ok(report.timelines[0].events.length >= 3);
});

test('REST API: Server endpoints return validated intelligence', async () => {
  const server = new IntelligenceServer();
  const testPort = 3099;

  await server.start(testPort);

  try {
    // 1. Health check
    const healthRes = await fetch(`http://localhost:${testPort}/api/v1/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = await healthRes.json();
    assert.equal(healthJson.status, 'ok');
    assert.equal(healthJson.subsystem, 'MEMBER_2_INTELLIGENCE_ENGINE');

    // 2. Process Case
    const processRes = await fetch(`http://localhost:${testPort}/api/v1/intelligence/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(LOAN_CASE_STUDY),
    });
    assert.equal(processRes.status, 201);
    const reportJson = await processRes.json();
    assert.equal(reportJson.case_id, 'CASE-LOAN-2026-8841');
    assert.ok(reportJson.findings.length > 0);

    // 3. Get Case Report
    const getReportRes = await fetch(`http://localhost:${testPort}/api/v1/intelligence/CASE-LOAN-2026-8841`);
    assert.equal(getReportRes.status, 200);
    const fetchedReport = await getReportRes.json();
    assert.equal(fetchedReport.case_id, 'CASE-LOAN-2026-8841');

    // 4. Get Findings filtered
    const findingsRes = await fetch(
      `http://localhost:${testPort}/api/v1/findings?case_id=CASE-LOAN-2026-8841&type=CONTRADICTION`
    );
    assert.equal(findingsRes.status, 200);
    const findingsJson = await findingsRes.json();
    assert.ok(findingsJson.total > 0);
    assert.equal(findingsJson.findings[0].type, 'CONTRADICTION');

    // 5. Get Evidence Card
    const firstFindingId = findingsJson.findings[0].finding_id;
    const evidenceRes = await fetch(`http://localhost:${testPort}/api/v1/evidence/${firstFindingId}`);
    assert.equal(evidenceRes.status, 200);
    const evidenceCard = await evidenceRes.json();
    assert.equal(evidenceCard.finding_id, firstFindingId);
    assert.ok(evidenceCard.comparative_view.includes('Traceable Evidence'));

    // 6. Get Timeline
    const timelineRes = await fetch(
      `http://localhost:${testPort}/api/v1/timeline/PERSON_001?case_id=CASE-LOAN-2026-8841`
    );
    assert.equal(timelineRes.status, 200);
    const timelineJson = await timelineRes.json();
    assert.equal(timelineJson.entity_id, 'PERSON_001');
    assert.ok(timelineJson.timelines.length > 0);
  } finally {
    await server.stop();
  }
});
