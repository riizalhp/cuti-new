import fs from 'fs';
import path from 'path';

const file = path.resolve('apps/dashboard/e2e/review/council-audit/all-pages-text-audit.json');
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

console.log('=== RINGKASAN AUDIT TEKS & SUBTEKS DASHBOARD USER (>2 KALIMAT) ===\n');

const outSummary = [];
for (const [key, val] of Object.entries(data)) {
  outSummary.push(`\n======================================================`);
  outSummary.push(`PAGE: ${val.name} | Path: ${val.path} | Screenshot: ${val.screenshot}`);
  outSummary.push(`Total elemen > 2 kalimat / panjang: ${val.longTexts?.length || 0}`);
  outSummary.push(`------------------------------------------------------`);
  
  if (val.longTexts && val.longTexts.length > 0) {
    val.longTexts.forEach((item, idx) => {
      outSummary.push(`  #${idx + 1} [Role: ${item.role}] [Tag: <${item.tag}>] [${item.sentenceCount} kalimat | ${item.charCount} chars]`);
      outSummary.push(`     Teks: "${item.text.replace(/\s+/g, ' ')}"`);
      outSummary.push(`     Kalimat:`);
      item.sentences.forEach((s, sIdx) => {
        outSummary.push(`       (${sIdx + 1}) ${s.trim()}`);
      });
      outSummary.push('');
    });
  } else {
    outSummary.push('  (Tidak ditemukan teks/subteks bertele-tele > 2 kalimat)\n');
  }
}
fs.writeFileSync(path.resolve('apps/dashboard/e2e/review/council-audit/audit-summary.txt'), outSummary.join('\n'), 'utf-8');
console.log('Written audit-summary.txt UTF-8!');
