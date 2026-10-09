import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function getFiles(dir, extList) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    if (['node_modules', '.git', 'dist', '.gemini', 'tmp'].includes(file)) continue;
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFiles(fullPath, extList));
    } else if (extList.some(ext => fullPath.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

const jsFiles = getFiles('.', ['.js', '.mjs']);
console.log(`Checking ${jsFiles.length} JavaScript files for syntax errors...`);

let errorCount = 0;
for (const file of jsFiles) {
  try {
    execSync(`node --check "${file}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`❌ Syntax error in ${file}:`, err.stderr?.toString() || err.message);
    errorCount++;
  }
}

const tsFiles = getFiles('src', ['.ts']).concat(getFiles('test', ['.ts']));
console.log(`Checking ${tsFiles.length} TypeScript engine & test files...`);
for (const file of tsFiles) {
  try {
    execSync(`node --experimental-strip-types --check "${file}"`, { stdio: 'pipe' });
  } catch (err) {
    console.error(`❌ Syntax/type-strip error in ${file}:`, err.stderr?.toString() || err.message);
    errorCount++;
  }
}

console.log(`\n========================================`);
if (errorCount === 0) {
  console.log(`✅ All ${jsFiles.length + tsFiles.length} files passed syntax and runtime checks cleanly!`);
} else {
  console.log(`❌ Found ${errorCount} file(s) with errors.`);
  process.exit(1);
}
