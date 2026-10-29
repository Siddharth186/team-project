import fs from 'fs';
import path from 'path';

async function ingestUserFiles() {
  const docsDir = 'data/documents';
  const userFiles = [
    'world wide web.pptx.pdf',
    'HTTP.pptx.pdf',
    'React Props.pptx.pdf',
    'UNIT 3-XML.pdf',
    '1. ReactJS.pdf',
    'SERVLETS AND DATABASE CONNECTIVITY.pdf'
  ];

  // First purge previous demo session to keep ONLY user's files
  await fetch('http://localhost:5001/api/documents/all', { method: 'DELETE' });

  const payload = [];
  for (const name of userFiles) {
    const filePath = path.join(docsDir, name);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      const b64 = `data:application/pdf;base64,${buffer.toString('base64')}`;
      payload.push({
        name,
        size: buffer.length,
        type: 'pdf',
        category: 'LEGAL',
        content: b64
      });
    }
  }

  console.log(`Ingesting ${payload.length} user files...`);
  const res = await fetch('http://localhost:5001/api/documents/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documents: payload })
  });
  const data = await res.json();
  console.log('Upload response:', res.status, 'Total docs in store:', data.totalDocuments);
}

ingestUserFiles();
