import fs from 'fs';
import path from 'path';

const file = path.resolve('apps/dashboard/e2e/review/council-audit/focused-ui-copy-audit.json');
const data = JSON.parse(fs.readFileSync(file, 'utf-8'));

const lines = [];

data.forEach((p) => {
  lines.push(`\n======================================================`);
  lines.push(`PAGE: [${p.name}] (${p.path})`);
  lines.push(`Screenshot: ${p.screenshot}`);
  lines.push(`Total UI copy panjang: ${p.items?.length || 0}`);
  lines.push(`------------------------------------------------------`);
  
  if (!p.items || p.items.length === 0) {
    lines.push(`  (Aman - tidak ada teks/subteks > 2 kalimat)`);
    return;
  }

  // Deduplicate items with similar texts
  const seen = new Set();
  p.items.forEach((item, i) => {
    // Only show unique texts
    const snippet = item.text.replace(/\s+/g, ' ').trim();
    if (seen.has(snippet)) return;
    seen.add(snippet);

    lines.push(`  • #${i + 1} [Tag: <${item.tag}> | Role: ${item.role}]`);
    lines.push(`    Jumlah Kalimat: ${item.sentenceCount} | Karakter: ${item.charCount}`);
    lines.push(`    Konten: "${snippet}"`);
    lines.push('');
  });
});

fs.writeFileSync(path.resolve('apps/dashboard/e2e/review/council-audit/clean-breakdown.txt'), lines.join('\n'), 'utf-8');
console.log('Saved clean-breakdown.txt!');
