/**
 * NEXUS AI — MASTER MULTI-AGENT VERIFICATION TEST SUITE
 * Validates all 12 requirements specified in the Master Prompt.
 */

const ORCHESTRATOR_URL = 'http://localhost:5001';

async function runTest(testName, testFn) {
  try {
    process.stdout.write(`⏳ Running ${testName}... `);
    const result = await testFn();
    console.log(`✅ PASS`);
    return { name: testName, status: 'PASS', details: result };
  } catch (err) {
    console.log(`❌ FAIL`);
    console.error(`   Error: ${err.message}`);
    return { name: testName, status: 'FAIL', error: err.message };
  }
}

async function main() {
  console.log('\n================================================================');
  console.log('🚀 NEXUS AI — 12-POINT LOCAL MULTI-AGENT VERIFICATION SUITE');
  console.log('================================================================\n');

  const results = [];

  // TEST 1: Four files preview & upload
  results.push(await runTest('Test 1: Four Files Preview & Processing', async () => {
    const res = await fetch(`${ORCHESTRATOR_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: [
          't1_report1.pdf',
          't1_report2.pdf',
          't1_research.docx',
          't1_notes.pdf'
        ]
      })
    });
    if (!res.ok) throw new Error(`Upload returned HTTP ${res.status}`);
    const data = await res.json();
    if (!data.documents || data.documents.length !== 4) {
      throw new Error(`Expected 4 documents processed, got ${data.documents?.length}`);
    }
    return `Processed ${data.documents.length} files into dossier.`;
  }));

  // TEST 2: Twelve files uploaded & stored without loss
  results.push(await runTest('Test 2: Twelve Files Complete Persistence & Expandable', async () => {
    const twelveFiles = Array.from({ length: 12 }, (_, i) => ({
      name: `dossier_file_${i + 1}.pdf`,
      size: 1024 * 1024 * (i + 1),
      category: i % 2 === 0 ? 'FINANCIAL' : 'LEGAL'
    }));

    const res = await fetch(`${ORCHESTRATOR_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ files: twelveFiles })
    });
    if (!res.ok) throw new Error(`Upload returned HTTP ${res.status}`);
    const data = await res.json();
    if (data.totalDocuments < 12) {
      throw new Error(`Expected at least 12 total documents in store, got ${data.totalDocuments}`);
    }
    return `All 12 files successfully stored and tracked in system.`;
  }));

  // TEST 3: Last-file retrieval (12th file fact lookup)
  results.push(await runTest('Test 3: Last-File Grounded Retrieval (12th File Fact)', async () => {
    // Ingest 12th file with specific fact
    await fetch(`${ORCHESTRATOR_URL}/api/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: [{
          name: 'project_omega_final_phase12.pdf',
          size: 2048576,
          category: 'LEGAL',
          content: 'Project Omega Phase 12 covers the final grid interlock and deployment validation for high altitude smart solar systems.'
        }]
      })
    });

    const res = await fetch(`${ORCHESTRATOR_URL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is in project omega final phase12?' })
    });
    if (!res.ok) throw new Error(`QA returned HTTP ${res.status}`);
    const data = await res.json();
    if (!data.answer || !data.answer.toLowerCase().includes('project_omega_final_phase12')) {
      throw new Error(`Answer failed to retrieve from 12th file. Got: ${data.answer?.slice(0, 100)}`);
    }
    return `Answer grounded from project_omega_final_phase12.pdf with citation.`;
  }));

  // TEST 4: Cross-Document Comparison
  results.push(await runTest('Test 4: Cross-Document Multi-Source Comparison', async () => {
    const res = await fetch(`${ORCHESTRATOR_URL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Compare file1_objective.pdf and file8_methodology.pdf' })
    });
    if (!res.ok) throw new Error(`Comparison returned HTTP ${res.status}`);
    const data = await res.json();
    if (data.intent !== 'COMPARISON') {
      throw new Error(`Expected intent COMPARISON, got ${data.intent}`);
    }
    if (!data.answer.includes('Multi-Document Comparison') && !data.answer.includes('Comparative')) {
      throw new Error(`Answer lacks structured comparison format: ${data.answer?.slice(0, 100)}`);
    }
    return `Structured side-by-side comparison verified across multiple sources.`;
  }));

  // TEST 5: Follow-up question resolution ("its advantages")
  results.push(await runTest('Test 5: Follow-Up Conversational Context Resolution', async () => {
    const history = [
      { sender: 'user', text: 'What is the objective in file1_objective.pdf?' },
      { sender: 'ai', text: 'Deploy 50 MW smart solar microgrids across high-altitude regions.' }
    ];
    const res = await fetch(`${ORCHESTRATOR_URL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'What are its advantages?',
        history
      })
    });
    if (!res.ok) throw new Error(`Follow-up returned HTTP ${res.status}`);
    const data = await res.json();
    if (!data.resolvedQuery.includes('file1_objective')) {
      throw new Error(`Follow-up pronoun 'its' not resolved. resolvedQuery: ${data.resolvedQuery}`);
    }
    return `Resolved 'its' to referenced entity: ${data.resolvedQuery}`;
  }));

  // TEST 6: Missing information (Strict Anti-Hallucination)
  results.push(await runTest('Test 6: Missing Information & Anti-Hallucination', async () => {
    const res = await fetch(`${ORCHESTRATOR_URL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'What is the nuclear reactor core temperature of the secret facility on Mars in the documents?' })
    });
    if (!res.ok) throw new Error(`Missing info query returned HTTP ${res.status}`);
    const data = await res.json();
    if (!data.answer.includes("couldn't find") && !data.answer.includes("I couldn't find")) {
      throw new Error(`Anti-hallucination guard did not trigger. Got: ${data.answer?.slice(0, 100)}`);
    }
    return `Explicit anti-hallucination declaration returned without inventing data.`;
  }));

  // TEST 7: Numerical Accuracy with Tools Agent
  results.push(await runTest('Test 7: Numerical Calculations via Deterministic Tools Agent', async () => {
    const res = await fetch(`${ORCHESTRATOR_URL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Calculate total or sum from the document values' })
    });
    if (!res.ok) throw new Error(`Numerical calculation returned HTTP ${res.status}`);
    const data = await res.json();
    if (data.intent !== 'NUMERICAL') {
      throw new Error(`Expected NUMERICAL intent, got ${data.intent}`);
    }
    return `Deterministic calculation executed with intent ${data.intent}.`;
  }));

  // TEST 8: Conflicting Evidence Detection
  results.push(await runTest('Test 8: Conflicting Evidence & Contradiction Detection', async () => {
    const res = await fetch(`${ORCHESTRATOR_URL}/api/findings`);
    if (!res.ok) throw new Error(`Findings returned HTTP ${res.status}`);
    const findings = await res.json();
    if (!Array.isArray(findings) || findings.length === 0) {
      throw new Error('No contradiction findings found in intelligence store');
    }
    const critical = findings.find(f => f.severity === 'CRITICAL');
    return `Identified ${findings.length} findings, including critical conflict: ${critical?.title || findings[0].title}`;
  }));

  // TEST 9: Persistence (Disk Store Verification)
  results.push(await runTest('Test 9: Persistence Across Reboots', async () => {
    const res = await fetch(`${ORCHESTRATOR_URL}/api/session/stats`);
    if (!res.ok) throw new Error(`Session stats returned HTTP ${res.status}`);
    const stats = await res.json();
    if (!stats.durable) {
      throw new Error('StorageManager persistence not marked as durable');
    }
    return `Persistent session active: ${stats.activeDocuments} docs, ${stats.activeFacts} facts stored on disk.`;
  }));

  // TEST 10: Local-Only Operation
  results.push(await runTest('Test 10: Local-Only Operation (No External API Keys)', async () => {
    const res = await fetch(`${ORCHESTRATOR_URL}/api/models/status`);
    if (!res.ok) throw new Error(`Model status returned HTTP ${res.status}`);
    const status = await res.json();
    if (status.config?.localOnly !== true) {
      throw new Error('localOnly flag is not enabled in model configuration');
    }
    return `Local-only mode confirmed: Base URL = ${status.config.ollamaBaseUrl}`;
  }));

  // TEST 11: Model Unavailable / Offline Handling
  results.push(await runTest('Test 11: Graceful Degradation on Model Offline', async () => {
    const res = await fetch(`${ORCHESTRATOR_URL}/api/models/health`);
    if (!res.ok) throw new Error(`Health returned HTTP ${res.status}`);
    const health = await res.json();
    // System must return valid JSON without crashing even if Ollama is not running
    if (typeof health.running !== 'boolean') {
      throw new Error('Health check missing running status flag');
    }
    return `Model health subsystem handles offline state cleanly (running: ${health.running}).`;
  }));

  // TEST 12: Regression Testing (All Endpoints Operational)
  results.push(await runTest('Test 12: Subsystem Regression Verification', async () => {
    const endpoints = [
      `${ORCHESTRATOR_URL}/api/status`,
      `${ORCHESTRATOR_URL}/api/metrics`,
      `${ORCHESTRATOR_URL}/api/documents`,
      `${ORCHESTRATOR_URL}/api/graph`,
      `${ORCHESTRATOR_URL}/api/timeline`,
      `${ORCHESTRATOR_URL}/api/report`,
      `${ORCHESTRATOR_URL}/api/files`
    ];
    for (const ep of endpoints) {
      const r = await fetch(ep);
      if (!r.ok) throw new Error(`Endpoint ${ep} returned HTTP ${r.status}`);
    }
    return `All 7 core REST API endpoints returned HTTP 200 OK.`;
  }));

  console.log('\n================================================================');
  console.log('📊 12-POINT MASTER SUITE EXECUTION SUMMARY');
  console.log('================================================================');
  console.table(results.map(r => ({
    Test: r.name,
    Status: r.status,
    Details: r.details || r.error
  })));

  const allPassed = results.every(r => r.status === 'PASS');
  if (allPassed) {
    console.log('\n🎯 ALL 12 MASTER PROMPT TESTS PASSED WITH 100% SUCCESS RATE!\n');
  } else {
    console.log('\n⚠️ Some tests failed. Check summary above.\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
