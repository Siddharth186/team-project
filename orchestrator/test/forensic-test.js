import fs from 'fs';

async function runForensicMasterTest() {
  console.log('====================================================');
  console.log('PHASE 4: CREATING CONTROLLED BASELINE TEST DOCUMENT');
  console.log('====================================================');

  const baselineDoc = {
    name: 'Rahul_Sharma_Profile_Baseline.txt',
    size: 280,
    type: 'txt',
    category: 'IDENTITY',
    content: 'NEXUS AI TEST DOCUMENT\n\nName: Rahul Sharma\nAge: 25\nOccupation: Software Engineer\nCompany: ABC Technologies\nMonthly Income: INR 50000\nJoining Date: January 15, 2026\nCity: Bengaluru'
  };

  console.log('====================================================');
  console.log('PHASE 5 & 6: UPLOADING & PHYSICAL FILE VERIFICATION');
  console.log('====================================================');
  const upload1 = await fetch('http://localhost:5001/api/documents/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents: [baselineDoc] })
  }).then(r => r.json());
  console.log('Upload Result:', upload1.message, '| Total Documents:', upload1.totalDocuments);

  const diskFiles = fs.readdirSync('data/documents');
  console.log('Verified Files on Disk:', diskFiles);
  const fileExists = diskFiles.includes(baselineDoc.name);
  console.log('Baseline File Exists on Disk:', fileExists ? 'PASS' : 'FAIL');

  console.log('====================================================');
  console.log('PHASE 7, 8, 11 & 12: EXTRACTION & STRUCTURED FACTS');
  console.log('====================================================');
  const factsRes = await fetch('http://localhost:5001/api/facts').then(r => r.json());
  const rahulFacts = factsRes.filter(f => (f.entityName || f.raw_entity_name || '').toLowerCase().includes('rahul'));
  console.log('Extracted Facts Count for Rahul Sharma:', rahulFacts.length);
  rahulFacts.slice(0, 6).forEach(f => {
    console.log(`  * ${f.attribute} = ${f.value} [Source: ${f.source?.documentName || 'Doc'}, Page ${f.source?.pageNumber || 1}]`);
  });

  console.log('====================================================');
  console.log('PHASE 16 & 17: MULTI-DOCUMENT CONTRADICTION TEST');
  console.log('====================================================');
  const doc2 = {
    name: 'R_Sharma_Salary_Slip_Jan2026.txt',
    size: 220,
    type: 'txt',
    category: 'FINANCIAL',
    content: 'Name: R. Sharma\nCompany: ABC Technologies\nMonthly Income: INR 50000\nDate: January 2026'
  };
  const doc3 = {
    name: 'Rahul_Sharma_Bank_Statement_Feb2026.txt',
    size: 240,
    type: 'txt',
    category: 'FINANCIAL',
    content: 'Name: Rahul Sharma\nCompany: ABC Technologies\nMonthly Income: INR 35000\nDate: February 2026'
  };

  const uploadMulti = await fetch('http://localhost:5001/api/documents/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents: [doc2, doc3] })
  }).then(r => r.json());
  console.log('Multi-doc Upload Result:', uploadMulti.message, '| Total Documents:', uploadMulti.totalDocuments);

  console.log('====================================================');
  console.log('PHASE 21 & 22: Q&A RETRIEVAL & ANTI-HALLUCINATION');
  console.log('====================================================');
  const questions = [
    'What is Rahul Sharma\'s monthly income?',
    'Which company does Rahul Sharma work for?',
    'What is Rahul\'s age?',
    'What is Rahul\'s blood group?'
  ];

  for (const q of questions) {
    console.log('\n--- QUESTION:', q);
    const qa = await fetch('http://localhost:5001/api/qa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    }).then(r => r.json());
    console.log('ANSWER:\n', qa.answer.trim());
    console.log('CONFIDENCE:', qa.confidence);
  }
}

runForensicMasterTest().catch(console.error);
