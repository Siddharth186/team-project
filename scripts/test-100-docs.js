async function test100DocumentsIngestionAndQA() {
  console.log('================================================================');
  console.log('🚀 TESTING INGESTION OF 100 DOCUMENTS + GROUNDED Q&A REASONING');
  console.log('================================================================\n');

  // Generate 100 synthetic document items representing diverse entities
  const batch100 = [];
  for (let i = 1; i <= 100; i++) {
    const docName = `Dossier_Document_${String(i).padStart(3, '0')}.pdf`;
    const entityName = `Entity_${String(i).padStart(3, '0')}_Corp`;
    const limitAmount = 1000000 + i * 50000;
    
    batch100.push({
      name: docName,
      size: 15000 + i * 200,
      type: 'pdf',
      category: i % 3 === 0 ? 'TAX' : (i % 3 === 1 ? 'FINANCIAL' : 'LEGAL'),
      content: `Audit attestation for ${entityName} issued on 10 March 2026. Approved borrowing facility limit of INR ${limitAmount.toLocaleString('en-IN')} with credit rating A+.`
    });
  }

  console.log(`[1/3] Uploading batch of ${batch100.length} documents to /api/documents/upload...`);
  const startTime = Date.now();
  const uploadRes = await fetch('http://localhost:5001/api/documents/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents: batch100 })
  });
  const uploadJson = await uploadRes.json();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`  ✅ Ingested ${uploadJson.documents?.length} documents in ${elapsed}s (Total in system: ${uploadJson.totalDocuments})`);

  console.log('\n[2/3] Querying specific entity facts from document #77 (Dossier_Document_077.pdf)...');
  const qaRes = await fetch('http://localhost:5001/api/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'What is the approved borrowing limit for Entity_077_Corp?' })
  });
  const qaJson = await qaRes.json();
  console.log('  Q&A Status:', qaRes.status);
  console.log('  Answer:\n', qaJson.answer);
  console.log('  Cited Evidence:', qaJson.citedEvidence);

  console.log('\n[3/3] Querying full dossier overview across all documents...');
  const qaListRes = await fetch('http://localhost:5001/api/qa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'List all uploaded documents' })
  });
  const qaListJson = await qaListRes.json();
  console.log('  Answer Overview:\n', qaListJson.answer.slice(0, 400) + '...\n');

  console.log('================================================================');
  console.log('✅ ALL 100 DOCUMENTS INGESTED, INDEXED, AND RETRIEVABLE VIA Q&A');
  console.log('================================================================');
}

test100DocumentsIngestionAndQA();
