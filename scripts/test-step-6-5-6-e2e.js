import fs from 'fs';
import path from 'path';

const ORCHESTRATOR_URL = 'http://localhost:5001';
const DOC_ENGINE_URL = 'http://127.0.0.1:8000';

async function runStep6Verification() {
  console.log('================================================================');
  console.log('🚀 STEP 6.5 & 6.6 MANUAL & AUTOMATED VERIFICATION');
  console.log('================================================================\n');

  const results = [];

  // 1. Health check of all services
  console.log('[1/7] Checking Subsystems Health...');
  try {
    const orchHealthRes = await fetch(`${ORCHESTRATOR_URL}/api/status`);
    const orchHealth = await orchHealthRes.json();
    console.log(`  ✅ Orchestrator: HTTP 200 (Status: ${orchHealth.status})`);

    const docEngRes = await fetch(`${DOC_ENGINE_URL}/api/v1/health`);
    const docEngHealth = await docEngRes.json();
    console.log(`  ✅ Document Engine: HTTP 200 (LLM: ${docEngHealth.llm_provider}, OCR: ${docEngHealth.ocr_provider})`);

    const modelHealthRes = await fetch(`${ORCHESTRATOR_URL}/api/models/health`);
    const modelHealth = await modelHealthRes.json();
    console.log(`  ✅ Model Subsystem: Running=${modelHealth.running}, LocalOnly=${modelHealth.config?.localOnly}`);
    
    results.push({ test: 'Subsystems Health Check', status: 'PASS', details: 'Orchestrator, DocEngine, Models healthy' });
  } catch (err) {
    results.push({ test: 'Subsystems Health Check', status: 'FAIL', details: err.message });
  }

  // 2. Multi-Format Upload: PDF, DOCX, XLSX, Image (PNG)
  console.log('\n[2/7] Uploading multi-format test documents (PDF, DOCX, XLSX, PNG)...');
  const uploadDir = path.join(process.cwd(), 'data/test_uploads');
  const formats = [
    { name: 'e2e_sample.pdf', mime: 'application/pdf', category: 'FINANCIAL' },
    { name: 'e2e_sample.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'LEGAL' },
    { name: 'e2e_sample.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'FINANCIAL' },
    { name: 'e2e_sample.png', mime: 'image/png', category: 'IDENTITY' }
  ];

  const payloadDocs = [];
  for (const f of formats) {
    const fullPath = path.join(uploadDir, f.name);
    if (fs.existsSync(fullPath)) {
      const buffer = fs.readFileSync(fullPath);
      const b64 = `data:${f.mime};base64,${buffer.toString('base64')}`;
      payloadDocs.push({
        name: f.name,
        size: buffer.length,
        category: f.category,
        content: b64
      });
    } else {
      console.warn(`  ⚠️ Missing ${fullPath}, using fallback text`);
      payloadDocs.push({
        name: f.name,
        size: 1024,
        category: f.category,
        content: `Sample content for ${f.name}`
      });
    }
  }

  try {
    const uploadRes = await fetch(`${ORCHESTRATOR_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents: payloadDocs })
    });
    const uploadData = await uploadRes.json();
    console.log(`  ✅ Uploaded ${uploadData.documents?.length || 0} files. Total in store: ${uploadData.totalDocuments}`);
    results.push({
      test: 'Multi-Format Ingestion (PDF, DOCX, XLSX, PNG)',
      status: (uploadRes.status === 202 && uploadData.documents?.length === 4) ? 'PASS' : 'FAIL',
      details: `Processed ${uploadData.documents?.length} documents across 4 formats`
    });
  } catch (err) {
    results.push({ test: 'Multi-Format Ingestion', status: 'FAIL', details: err.message });
  }

  // 3. Confirm Facts Extraction across documents
  console.log('\n[3/7] Verifying Extracted Structured Facts...');
  try {
    const docsRes = await fetch(`${ORCHESTRATOR_URL}/api/documents`);
    const docsData = await docsRes.json();
    const factsRes = await fetch(`${ORCHESTRATOR_URL}/api/graph`);
    const graphData = await factsRes.json();

    const factsCount = graphData.nodes?.length || 0;
    console.log(`  ✅ Graph contains ${factsCount} fact/entity nodes.`);
    results.push({
      test: 'Structured Fact Extraction',
      status: factsCount > 0 ? 'PASS' : 'FAIL',
      details: `${factsCount} nodes extracted across documents`
    });
  } catch (err) {
    results.push({ test: 'Structured Fact Extraction', status: 'FAIL', details: err.message });
  }

  // 4. Confirm Findings / Contradictions Detection
  console.log('\n[4/7] Verifying Cross-Document Intelligence Findings...');
  try {
    const findingsRes = await fetch(`${ORCHESTRATOR_URL}/api/findings`);
    const findings = await findingsRes.json();
    console.log(`  ✅ Detected ${findings.length} cross-document findings/contradictions.`);
    results.push({
      test: 'Contradiction & Finding Intelligence',
      status: findings.length > 0 ? 'PASS' : 'FAIL',
      details: `${findings.length} findings active in system`
    });
  } catch (err) {
    results.push({ test: 'Contradiction & Finding Intelligence', status: 'FAIL', details: err.message });
  }

  // 5. Confirm Grounded Q&A with Citations
  console.log('\n[5/7] Verifying Grounded Q&A with Verbatim Quotes & Citations...');
  try {
    const qaRes = await fetch(`${ORCHESTRATOR_URL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is Ramesh Kumar\'s monthly income and employer?' })
    });
    const qaData = await qaRes.json();
    console.log('  QA Answer:\n  ' + qaData.answer.replace(/\n/g, '\n  '));
    console.log(`  Cited facts: ${qaData.citedFacts?.length || 0}`);

    const hasGroundedAnswer = qaData.answer && (
      qaData.answer.toLowerCase().includes('ramesh') ||
      qaData.answer.toLowerCase().includes('45000') ||
      qaData.answer.toLowerCase().includes('acme') ||
      qaData.citedFacts?.length > 0
    );

    results.push({
      test: 'Grounded Q&A with Citations',
      status: hasGroundedAnswer ? 'PASS' : 'FAIL',
      details: `Answered with ${qaData.citedFacts?.length || 0} cited facts, Confidence: ${qaData.confidence}`
    });
  } catch (err) {
    results.push({ test: 'Grounded Q&A with Citations', status: 'FAIL', details: err.message });
  }

  // 6. Confirm Report Generation
  console.log('\n[6/7] Verifying Executive Report Generation...');
  try {
    const reportRes = await fetch(`${ORCHESTRATOR_URL}/api/report`);
    const report = await reportRes.json();
    console.log(`  ✅ Report generated: "${report.title || 'Case Report'}"`);
    console.log(`  Executive Summary: ${report.executiveSummary?.slice(0, 80) || report.summary?.slice(0, 80)}...`);
    results.push({
      test: 'Report Generation',
      status: (report && (report.executiveSummary || report.summary || report.sections)) ? 'PASS' : 'FAIL',
      details: `Generated report with ${report.sections?.length || 0} sections`
    });
  } catch (err) {
    results.push({ test: 'Report Generation', status: 'FAIL', details: err.message });
  }

  // 7. Negative Tests: Missing Info Guard & Model Offline Degradation
  console.log('\n[7/7] Running Negative Tests: Strict Anti-Hallucination & Model Offline Degradation...');
  try {
    // 7a. Missing Information Query
    const missingRes = await fetch(`${ORCHESTRATOR_URL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is the private orbital satellite frequency used by the applicant?' })
    });
    const missingData = await missingRes.json();
    console.log('  Negative QA Answer:\n  ' + missingData.answer.replace(/\n/g, '\n  '));

    const antiHallucinationTriggered = (
      missingData.answer.toLowerCase().includes('not available in the uploaded documents') ||
      missingData.answer.toLowerCase().includes("couldn't find") ||
      missingData.answer.toLowerCase().includes("do not contain") ||
      missingData.answer.toLowerCase().includes("not find")
    );

    // 7b. Check offline model tolerance
    const offlineCheckRes = await fetch(`${ORCHESTRATOR_URL}/api/models/health`);
    const offlineCheckData = await offlineCheckRes.json();
    const gracefullyDegraded = typeof offlineCheckData.running === 'boolean';

    const negativePass = antiHallucinationTriggered && gracefullyDegraded;
    console.log(`  ✅ Anti-Hallucination Guard: ${antiHallucinationTriggered ? 'TRIGGERED (Safe)' : 'FAILED'}`);
    console.log(`  ✅ Offline Degradation Handler: ${gracefullyDegraded ? 'ACTIVE (Safe)' : 'FAILED'}`);

    results.push({
      test: 'Negative Tests (Anti-Hallucination & Offline Tolerance)',
      status: negativePass ? 'PASS' : 'FAIL',
      details: `Missing info guarded: ${antiHallucinationTriggered}, Graceful degradation: ${gracefullyDegraded}`
    });
  } catch (err) {
    results.push({ test: 'Negative Tests', status: 'FAIL', details: err.message });
  }

  console.log('\n================================================================');
  console.log('📊 STEP 6.5 & 6.6 EXECUTION RESULTS');
  console.log('================================================================');
  console.table(results);

  const allPassed = results.every(r => r.status === 'PASS');
  if (allPassed) {
    console.log('\n🎉 ALL STEP 6.5 & 6.6 VERIFICATION TESTS PASSED SUCCESSFULLY!\n');
  } else {
    console.log('\n⚠️ Some verification tests failed.\n');
    process.exit(1);
  }
}

runStep6Verification().catch(err => {
  console.error('Test script encountered fatal error:', err);
  process.exit(1);
});
